from django.shortcuts import render, redirect
from models import OurUser, Event, Comment, junctionEventUser
from django.http import JsonResponse
import json
import datetime
from rest_framework import permissions, viewsets
from authentication.permissions import IsAccountOwner
from main.serializers import OurUserSerializer

from forms import SignUpForm
from search import get_query

def index(request):
	return render(request,'main/index.html')

#from "http://julienphalip.com/post/2825034077/adding-search-to-a-django-site-in-a-snap"
#simple search our event database
def search(request):
	query_string = ''
	found_entries = None
	
	if ('q' in request.GET) and request.GET['q'].strip():
	
		query_string = request.GET['q']
		
		entry_query = get_query(query_string, ['title', 'description','location'])
		found_entries = Event.objects.filter(entry_query)
		events = filterOutPastEvents(found_entries)
		results = [e.to_json() for e in events]
		print(results)
	else: #the user searched for an empty query, so return all results
		events = Event.objects.all()
		events = filterOutPastEvents(events)
		results = [e.to_json() for e in events]
	return JsonResponse(results, safe=False) 
	
def filterOutPastEvents(eventList):
	noPastEvents = []	
	for event in eventList:
		eventDateTime =  datetime.datetime.combine(event.date, event.endTime)
		if(eventDateTime >= datetime.datetime.now()):
			noPastEvents.append(event)
	return noPastEvents		
	
def eventsApi(request, eventId=None):
	if(eventId == None):
		if(request.method == 'GET'):
			events = Event.objects.all()
			noPastEvents = filterOutPastEvents(events)
			#filter no it does not include past events
			
			
			allEvents = [e.to_json() for e in noPastEvents] # shorthand for loop
			
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
			

def usersApi(request, username = None):
	if username :
		user = User.objects.get(username=username)
		if request.method == 'GET':
			allEvents = user.ouruser.event_set.all()
			events_org = allEvents.filter(organizer=user)
			events_org_json = [e.to_json() for e in events_org]
			events_go = user.event_set.all()
			events_go_json = [e.to_json() for e in events_go]
			return JsonResponse({"user": user.to_json(), "events_org": events_org_json, "events_go": events_go_json})
		if request.method == 'DELETE':
			if (request.user == user):
				user.delete()
				return JsonResponse(user.to_json())
	if request.method == 'POST':
		params = json.loads(request.body)
		# if params.get(password1) and params.get(password2) and  check password mathc?
		user = User.objects.create_user(params.get(username), params.get(password1))
		user = OurUser(
			username = params.get(username),
			first_name = params.get(first_name, 'Anonymous'),
			last_name = params.get(last_name, ''),
			profile_pic = params.get(profile_pic, ''),
			about = params.get(about, ''))
		user.save()
		return JsonResponse(user.to_json())		

# https://thinkster.io/django-angularjs-tutorial#registering-new-users
class OurUserViewSet(viewsets.ModelViewSet):
	lookup_field = 'username'
	queryset = OurUser.objects.all()
	serializer_class = OurUserSerializer

	def get_permissions(self):
		if self.request.method in permissions.SAFE_METHODS:
			return (permissions.AllowAny(),)

		if self.request.method == 'POST':
			return (permissions.AllowAny(),)

		return (permissions.IsAuthenticated(), IsAccountOwner(),)

	def create(self, request):
		serializer = self.serializer_class(data=request.data)

		if serializer.is_valid():
			OurUser.objects.create_user(**serializer.validated_data)

			return Response(serializer.validated_data, status=status.HTTP_201_CREATED)

		return Response({
			'status': 'Bad request',
			'message': 'Account could not be created with received data.'
		}, status=status.HTTP_400_BAD_REQUEST)