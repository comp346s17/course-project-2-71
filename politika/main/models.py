from __future__ import unicode_literals

from django.db import models
import json
import datetime

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.models import BaseUserManager

# https://thinkster.io/django-angularjs-tutorial#registering-new-users
class OurUserManager(BaseUserManager):
	use_in_migrations = True
	def create_user(self, username, password=None, **kwargs):

		if not username:
			raise ValueError('Users must have valid username')

		ouruser = self.model(
			username= username,
			first_name=kwargs.get('first_name'),
			last_name=kwargs.get('last_name'),
			profile_pic=kwargs.get('profile_pic'),
			about=kwargs.get('about')
		)

		ouruser.set_password(password)
		ouruser.save(using=self._db)
		return ouruser

	def create_superuser(self,username, password, **kwargs):
		ouruser = self.create_user(username, password=password, **kwargs)
		ouruser.is_admin = True
		ouruser.save(using=self._db)
		return ouruser


class OurUser(AbstractBaseUser, PermissionsMixin):
	username = models.CharField(max_length=40, unique=True)
	first_name = models.CharField(max_length=40, default="Anonymous")
	last_name = models.CharField(max_length=40, blank=True, null=True)
	profile_pic = models.TextField(blank=True, null=True)
	about = models.TextField(blank=True, null=True)
	is_admin = models.BooleanField(default=False)


	objects = OurUserManager()

	USERNAME_FIELD = 'username'

	# display username when viewed in console
	def __unicode__(self):
		return self.username

	#Django convention
	def get_full_name(self):
		return ' '.join([self.first_name, self.last_name])

	def get_short_name(self):
		return self.first_name

	def to_json(self):
		return {
		  'id': self.id,
		  'first_name': self.first_name,
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
	category = models.TextField(null=True, blank=True)
	attendees = models.ManyToManyField(OurUser, through='junctionEventUser', related_name = 'event_set')
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
		  'eventId': self.eventId.to_json(),
		  'userId': self.userId.to_json(),
		  'body': self.body,
		  'liked': self.liked,
		  'disliked': self.disliked
		}

class junctionEventUser(models.Model):
		userId = models.ForeignKey(OurUser)
		eventId = models.ForeignKey(Event)


