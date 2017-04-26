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
			print('gete here spost wiht id')
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
			pass			
			