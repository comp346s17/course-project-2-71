from django.shortcuts import render
from models import OurUser, Event, Comment, junctionEventUser
from django.http import JsonResponse
import json


def index(request):
	return render(request,'main/index.html')
	
def eventsApi(request, eventId=None):
	if(eventId == None):
		if(request.method == 'GET'):
			events = Event.objects.all()
			allPosts = [e.to_json() for e in events] # shorthand for loop
			return JsonResponse(allPosts, safe=False) # safe=False required for sending lists
		elif(request.method == 'POST'):
			pass
			# params = json.loads(request.body)
			# myTitle = params.get(title, 'No title')
			# myText = params.get(text, 'Empty post')
			# post = Post(title=myTitle, text=myText)
			# post.save()
	else:
		if(request.method == 'GET'):
			event = Event.objects.get(id = eventId)
			return JsonResponse(event.to_json())
		elif(request.method == 'DELETE'):
			pass
			# event = Event.objects.get(id=postId)
			# post.delete()