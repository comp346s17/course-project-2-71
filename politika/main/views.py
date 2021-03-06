from django.shortcuts import render, redirect
from models import OurUser, Event, Comment, junctionEventUser
from django.http import JsonResponse
import json
import datetime
from search import get_query
from django.contrib.auth import logout, authenticate, login

def index(request):
	return render(request,'main/index.html')

#from "http://julienphalip.com/post/2825034077/adding-search-to-a-django-site-in-a-snap"
#simple search our event database
def search(request):
	query_string = ''
	found_entries = None
	
	if ('q' in request.GET) and request.GET['q'].strip():
	
		query_string = request.GET['q']
		
		entry_query = get_query(query_string, ['title', 'description','location', 'category'])
		found_entries = Event.objects.filter(entry_query)
		events = filterOutPastEvents(found_entries)
		results = [e.to_json() for e in events]
	else: #the user searched for an empty query, so return all results
		events = Event.objects.all()
		events = filterOutPastEvents(events)
		results = [e.to_json() for e in events]
	return JsonResponse(results, safe=False) 

#method filters out all events that already passed and returns a list of events.	
def filterOutPastEvents(eventList):
	noPastEvents = []	
	for event in eventList:
		eventDateTime =  datetime.datetime.combine(event.date, event.endTime)
		if(eventDateTime >= datetime.datetime.now()):
			noPastEvents.append(event)
	return noPastEvents		


#api that is responsible for serving the events to the front end and creating new events in the database	
def eventsApi(request, eventId=None):
	if(eventId == None): #get all events
		if(request.method == 'GET'):
			events = Event.objects.all()
			noPastEvents = filterOutPastEvents(events)			
			allEvents = [e.to_json() for e in noPastEvents]			
			return JsonResponse(allEvents, safe=False) 
			
		elif(request.method == 'POST'): #create new event
			params = json.loads(request.body)
			#date and time are submited in a different format than what the database accepts. so it is
			#necessary to convert then tot he corrent format
			mydate =  datetime.datetime.strptime(params.get('date'), '%m/%d/%Y').strftime('%Y-%m-%d')			
			mystartTime = datetime.datetime.strptime(params.get('startTime'), "%I:%M %p").strftime('%H:%M:%S')
			myendTime = datetime.datetime.strptime(params.get('endTime'), "%I:%M %p").strftime('%H:%M:%S')
			
			#data validation for date and time, return errors if there are mistakes
			if(datetime.datetime.strptime(mydate, '%Y-%m-%d').date() < datetime.datetime.today().date()): #if date is in the past
				return JsonResponse({'error': 'Date is in the past. Please select a future date.'})
			if(datetime.datetime.strptime(myendTime,'%H:%M:%S') < datetime.datetime.strptime(mystartTime,'%H:%M:%S')): #if end time is before start time
				return JsonResponse({'error': 'End time is before start time. Please, pick an end time that is later than start time.'})
			#if date is today but end time has already passed
			if(datetime.datetime.strptime(mydate,'%Y-%m-%d').date() == datetime.datetime.today().date() and datetime.datetime.strptime(myendTime,'%H:%M:%S').time() < datetime.datetime.now().time() ):
				return JsonResponse({'error': 'End time is in the past. Please, pick an end time that is later than now.'})
			
			
			
			myimage = params.get('image', "/static/main/img/eventImage.png")
			mytitle = params.get('title', "The greatest event ever")
			mylocation = params.get('location', "St. Paul")
			myorganizer = request.user
			mycategory = params.get('category')
			mygoing = 0
			mydescription = params.get('description',"This event will be awesome")
			myMediaList = "[]"

			event = Event(title=mytitle, organizer=myorganizer, image = myimage, 
			location= mylocation, going = mygoing, date = mydate, startTime = mystartTime, endTime = myendTime, description = mydescription, media_list = myMediaList, category=mycategory)
			event.save()
			return JsonResponse({'message': 'Event created'})
	else: 
		if(request.method == 'GET'): #get specific event
			event = Event.objects.get(id = eventId)
			return JsonResponse(event.to_json())
		elif(request.method == 'DELETE'): #delere specific event
			event = Event.objects.get(id=eventId)
			event.delete()
			return redirect("/")
		elif(request.method == 'PUT'): #update specific an event
			params = json.loads(request.body)
			event = Event.objects.get(id=eventId)
			event.image = params.get('image', event.image)
			event.title = params.get('title', event.title)
			event.location = params.get('location', event.location)
			event.category = params.get('category', event.category)
			if params.get('going') and not event.attendees.filter(id=request.user.id).exists():
				event.going = params.get('going')
				junc = junctionEventUser(userId=request.user, eventId=event)
				junc.save()

			tempDate = params.get('date', '')
			if tempDate != '':
				event.date =  datetime.datetime.strptime(str(tempDate), '%m/%d/%Y').strftime('%Y-%m-%d')
			
			tempStartTime = params.get('startTime', '')
			if tempStartTime !='':
				event.startTime = datetime.datetime.strptime(str(tempStartTime), "%I:%M %p").strftime('%H:%M:%S')
			
			tempEndTime = params.get('endTime', '')
			if tempEndTime != '':
				event.endTime = datetime.datetime.strptime(str(tempEndTime), "%I:%M %p").strftime('%H:%M:%S')
			
			event.description = params.get('description',event.description)
			
			
			tempMediaList = params.get('media_list', '')
			if tempMediaList != '':
				
				currentMediaList = json.loads(event.media_list)
				tempMediaList = json.loads(tempMediaList)
				currentMediaList.append(tempMediaList)
				event.media_list = json.dumps(currentMediaList)

			event.save()
			return JsonResponse(event.to_json())



#api that is responsible for serving the comments to the front end and creating new comments in the database	
def commentsApi(request, eventId, commentId=None):
	
		if(request.method == 'GET'): #get comments for a particular event
			comments = Comment.objects.filter(eventId = Event.objects.get(id=eventId))
			allComments = [c.to_json() for c in comments] 			
			return JsonResponse(allComments, safe=False) 
			
		elif(request.method == 'POST'): #create new comment in a particular event
			params = json.loads(request.body)
			myUser =  OurUser.objects.get(id=params.get('userId'))
			myEvent = Event.objects.get(id=eventId)
			myBody = params.get('body')				
			myLiked = 0
			myDisliked = 0
			comment = Comment(userId=myUser, eventId=myEvent, body = myBody, liked = myLiked, disliked = myDisliked)
			comment.save()
			return redirect("/")
			
		elif(request.method == 'DELETE'): #delete a comment
			comment = Comment.objects.get(id=commentId)
			event.delete()
			return redirect("/")
			
		elif(request.method == 'PUT'): #in the future we can use this to allow users to edit an comment
			params = json.loads(request.body)
			pass
	


#api that is responsible for serving the users to the front end and creating new users in the database
def usersApi(request, userId = None):

	if userId: 
		user = OurUser.objects.get(id=userId)

		if request.method == 'GET':
			events_org = Event.objects.filter(organizer=user) #get all events current user organizes
			events_org_json = [e.to_json() for e in events_org]
			events_go = user.event_set.all() #get all event current user is going to
			events_go_json = [e.to_json() for e in events_go]
			return JsonResponse({"user": user.to_json(), "events_org": events_org_json, "events_go": events_go_json})
		
		if request.method == 'DELETE':
			if (request.user == user): #check that user is authorized to delete
				logout(request)
				user.delete()
				return JsonResponse(user.to_json())
		
		if request.method == 'PUT':
			params = json.loads(request.body)
			user.first_name = params.get('first_name', user.first_name)
			user.last_name = params.get('last_name', user.last_name)
			user.profile_pic = params.get('profile_pic', user.profile_pic)
			user.about = params.get('about', user.about)
			user.save()
			return JsonResponse({'message': 'Profile updated!', 'user': user.to_json()})
	

	#when no user id is needed
	if request.method == 'POST':
		params = json.loads(request.body)

		if params.get('action') == 'logout': 
			logout(request)
			return render(request,'main/index.html')

		#if request sent from login form
		if params.get('form') == 'login':  
			user = authenticate(username= params.get('username'), password=params.get('password')) 
			if user:
				login(request, user)
				return JsonResponse({'message': 'Successfully logged in!', 'user': user.to_json()})
			else:
				return JsonResponse({'error': "Wrong username or password."})
		
		#if request sent from login form 
		if params.get('form') == 'signup': 
			#error if username already exists
			if OurUser.objects.filter(username=params.get('username')).exists(): 
				return JsonResponse({'error': "Username already exists"});
			
			#success if password1 and password2 exist and they match
			if params.get('password1') and params.get('password2') and  params.get('password1')== params.get('password2'):
				user = OurUser.objects.create_user(
					username = params.get('username'),
					password = params.get('password1'),
					first_name = params.get('first_name'),
					last_name = params.get('last_name'),
					profile_pic = params.get('profile_pic'),
					about = params.get('about'))
				user.save()
				user = authenticate(username= params.get('username'), password=params.get('password1'))
				login(request, user)
				return JsonResponse({'message': "Successfully created an account!", 'user': user.to_json()})
			else:
				return JsonResponse({'error': "Passwords don't match"});	
