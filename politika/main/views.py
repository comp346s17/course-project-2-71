from django.shortcuts import render, redirect
from models import OurUser, Event, Comment, junctionEventUser
from django.http import JsonResponse
import json
import datetime


def index(request):
	return render(request,'main/index.html')
	
def eventsApi(request, eventId=None):
	if(eventId == None):
		if(request.method == 'GET'):
			events = Event.objects.all()
			allEvents = [e.to_json() for e in events] # shorthand for loop
			
			return JsonResponse(allEvents, safe=False) # safe=False required for sending lists
		elif(request.method == 'POST'):
			pass
			params = json.loads(request.body)
			
			myimage = params.get('image', "/static/main/img/eventImage.png")
			mytitle = params.get('title', "The greatest event ever")
			mylocation = params.get('location', "St. Paul")
			myorganizer = OurUser.objects.get(id=params.get('organizer'))
			mygoing = 0
			mydate =  datetime.datetime.strptime(params.get('date'), '%m/%d/%Y').strftime('%Y-%m-%d')
			mystartTime = datetime.datetime.strptime(params.get('startTime'), '%H:%M')
			myendTime = datetime.datetime.strptime(params.get('endTime'), '%H:%M')
			mydescription = params.get('description',"This event will be awesome")
			mediaList = ""
			event = Event(title=mytitle, organizer=myorganizer, image = myimage, 
			location= mylocation, going = mygoing, date = mydate, startTime = mystartTime, endTime = myendTime, description = mydescription)
			event.save()
			return redirect("/")
	else:
		if(request.method == 'GET'):
			event = Event.objects.get(id = eventId)
			return JsonResponse(event.to_json())
		elif(request.method == 'DELETE'):
			pass
			event = Event.objects.get(id=eventId)
			event.delete()
			return redirect("/")

def usersApi(request, userId = None):
	if request.method == 'GET':
		if userId:
			user = OurUser.objects.get(id=userId)
			allEvents = user.event_set.all()
			events_org = allEvents.filter(organizer=request.user)
			events_org_json = [e.to_json() for e in events_org]
			events_go = allEvents.filter(organizer=request.user)
			events_go_json = [e.to_json() for e in events_go]
			return JsonResponse({user: user.to_json(), events_org: events_org_json, events_go: events_go_json})
		else:
			users = OurUser.objects.all()
			allUsers = [u.to_json() for u in users] # shorthand for loop
			return JsonResponse(allUsers, safe=False)
	elif request.method == 'POST':
		params = json.loads(request.body)
		username = params.get(username, 'No username') # Second param is default value
		name = params.get(name, 'No first name')
		last_name = params.get(last_name, 'No last name')
		profile_pic = params.get(profile_pic, 'No profile pic')
		about = params.get(about, 'No about')
		user = OurUser(
			username = username,
			name = name,
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
	if request.method == "POST":
		# if form is valid?
		pass

