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
			print(allEvents)
			return JsonResponse(allEvents, safe=False) # safe=False required for sending lists
		elif(request.method == 'POST'):
			pass
			params = json.loads(request.body)
			
			myimage = params.get('image', "/static/main/img/eventImage.png")
			mytitle = params.get('title', "The greatest event ever")
			mylocation = params.get('location', "St. Paul")
			myorganizer = OurUser.objects.get(id=params.get('organizer'))
			mygoing = 0
			mydate = params.get('date', datetime.datetime.now())
			mystartTime = params.get('startTime', datetime.datetime.now())
			myendTime = params.get('startTime', datetime.datetime.now())
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