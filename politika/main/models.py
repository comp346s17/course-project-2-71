from __future__ import unicode_literals

from django.db import models
import json
import datetime
from django.contrib.auth.models import User

class OurUser(models.Model):
	user = models.OneToOneField(User, on_delete = models.CASCADE)
	name = models.CharField(max_length=30)
	last_name = models.CharField(max_length=50)
	profile_pic = models.TextField()
	about = models.TextField()
	def to_json(self):
	
		return {
		  'id': self.id,
		  'name': self.name,
		  'last_name': self.last_name,
		  'profile_pic': self.profile_pic,
		  'about': self.about
		}


class Event(models.Model):
	image = models.TextField()
	location = models.TextField()
	organizer = models.ForeignKey(OurUser, related_name = 'organizerId')
	going = models.PositiveIntegerField()
	date = models.DateField()
	title = models.CharField(max_length=100)
	startTime = models.TimeField()
	endTime = models.TimeField()
	description = models.TextField()
	media_list = models.TextField()
	attendees = models.ManyToManyField(OurUser, through='junctionEventUser', related_name = 'attendeesId')
	def to_json(self):
		return {
		  'id': self.id,
		  'image': self.image,
		  'location': json.loads(self.location),
		  'title': self.title,
		  'organizer': self.organizer.to_json(),
		  'going': self.going,
		  'date': datetime.datetime.strptime(str(self.date), "%Y-%m-%d").strftime('%m-%d-%Y'),
		  'startTime': datetime.datetime.strptime(str(self.startTime), "%H:%M:%S").strftime('%I:%M %p'),
		  'endTime': datetime.datetime.strptime(str(self.endTime), "%H:%M:%S").strftime('%I:%M %p'),
		  'description': self.description,
		  'media_list': json.loads(self.media_list)
		}

class Comment(models.Model):
	userId = models.ForeignKey(OurUser)
	eventId = models.ForeignKey(Event)
	body = models.TextField()
	liked = models.PositiveIntegerField()
	disliked = models.PositiveIntegerField()
	def to_json(self):
		return {
		  'id': self.id,
		  'eventId': self.eventId,
		  'userId': self.userId,
		  'body': self.body,
		  'liked': self.liked,
		  'disliked': self.disliked
		}

class junctionEventUser(models.Model):
		userId = models.ForeignKey(OurUser)
		eventId = models.ForeignKey(Event)


