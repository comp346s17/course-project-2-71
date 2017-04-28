from django.shortcuts import render, redirect
from models import OurUser, Event, Comment, junctionEventUser
from django.http import JsonResponse
import json
import datetime
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from forms import SignUpForm
from search import get_query

def index(request):
	return render(request,'main/index.html')

#from "http://julienphalip.com/post/2825034077/adding-search-to-a-django-site-in-a-snap"
def search(request):
	query_string = ''
	found_entries = None
	if ('q' in request.GET) and request.GET['q'].strip():
		query_string = request.GET['q']
		entry_query = get_query(query_string, ['title', 'description','location'])
		found_entries = Event.objects.filter(entry_query)
		results = [e.to_json() for e in found_entries]
		print(results)
	return JsonResponse(results, safe=False) 
	
   
	
def eventsApi(request, eventId=None):
	if(eventId == None):
		if(request.method == 'GET'):
			events = Event.objects.all()
			allEvents = [e.to_json() for e in events] # shorthand for loop
			
			return JsonResponse(allEvents, safe=False) # safe=False required for sending lists
		elif(request.method == 'POST'):
			params = json.loads(request.body)
			print('get id? ' + str(eventId))
			myimage = params.get('image', "/static/main/img/eventImage.png")
			mytitle = params.get('title', "The greatest event ever")
			mylocation = params.get('location', "St. Paul")
			myorganizer = OurUser.objects.get(id=params.get('organizer'))
			mygoing = 0
			mydate =  datetime.datetime.strptime(params.get('date'), '%m/%d/%Y').strftime('%Y-%m-%d')
			mystartTime = datetime.datetime.strptime(params.get('startTime'), "%I:%M %p").strftime('%H:%M:%S')
			myendTime = datetime.datetime.strptime(params.get('endTime'), "%I:%M %p").strftime('%H:%M:%S')
			mydescription = params.get('description',"This event will be awesome")

			myMediaList = "[]"

			event = Event(title=mytitle, organizer=myorganizer, image = myimage, 
			location= mylocation, going = mygoing, date = mydate, startTime = mystartTime, endTime = myendTime, description = mydescription, media_list = myMediaList)
			event.save()
			return redirect("/")
	else:
		if(request.method == 'GET'):
			event = Event.objects.get(id = eventId)
			return JsonResponse(event.to_json())
		elif(request.method == 'DELETE'):
			event = Event.objects.get(id=eventId)
			event.delete()
			return redirect("/")
		elif(request.method == 'PUT'):
			params = json.loads(request.body)
			event = Event.objects.get(id=eventId)
			event.image = params.get('image', event.image)
			event.title = params.get('title', event.title)
			event.location = params.get('location', event.location)
			event.going = params.get('going', event.going)

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
			return redirect("/")


def commentsApi(request, eventId, commentId=None):
	
		if(request.method == 'GET'):
			comments = Comment.objects.filter(eventId = Event.objects.get(id=eventId))
			allComments = [c.to_json() for c in comments] # shorthand for loop
			
			return JsonResponse(allComments, safe=False) # safe=False required for sending lists
		elif(request.method == 'POST'):
			params = json.loads(request.body)
			myUser =  OurUser.objects.get(id=params.get('userId'))
			myEvent = Event.objects.get(id=eventId)
			myBody = params.get('body')				
			myLiked = 0
			myDisliked = 0
			comment = Comment(userId=myUser, eventId=myEvent, body = myBody, liked = myLiked, disliked = myDisliked)
			comment.save()
			return redirect("/")
			
		elif(request.method == 'DELETE'):
			comment = Comment.objects.get(id=commentId)
			event.delete()
			return redirect("/")
			
		elif(request.method == 'PUT'):
			params = json.loads(request.body)
			pass
			


def usersApi(request, userId = None):
	if request.method == 'GET':
		if userId:
			user = OurUser.objects.get(id=userId)

			events_org = Event.objects.filter(organizer=user)

			events_org_json = [e.to_json() for e in events_org]
			events_go = user.event_set.all()
			events_go_json = [e.to_json() for e in events_go]
			return JsonResponse({"user": user.to_json(), "events_org": events_org_json, "events_go": events_go_json})
		else:
			users = OurUser.objects.all()
			allUsers = [u.to_json() for u in users] # shorthand for loop
			return JsonResponse(allUsers, safe=False)
	elif request.method == 'POST':
		params = json.loads(request.body)
		username = params.get(username, 'No username') # Second param is default value
		first_name = params.get(first_name, 'Anonymous')
		last_name = params.get(last_name, '')
		profile_pic = params.get(profile_pic, '')
		about = params.get(about, '')
		user = OurUser(
			username = username,
			first_name = first_name,
			last_name = last_name,
			profile_pic = profile_pic,
			about = about)
		user.save()
		return JsonResponse(user.to_json())		
	else : #delete
		user = OurUser.objects.get(id=userId)
		user.delete()
		return JsonResponse(user.to_json())		

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.refresh_from_db()
            # username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user.ouruser.first_name = form.cleaned_data.get('first_name')
            user.ouruser.last_name = form.cleaned_data.get('last_name')
            user.save()
            user = authenticate(username=user.username, password=password)
            login(request, user)
            return redirect('/')
    else:
        form = SignUpForm()
    return redirect('/', {'form' : form})