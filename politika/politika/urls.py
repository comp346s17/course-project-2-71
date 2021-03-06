"""politika URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""

# https://thinkster.io/django-angularjs-tutorial#registering-new-users

from django.conf.urls import url,include
from django.contrib import admin
from main import views


urlpatterns = [
    url(r'^admin/', admin.site.urls),
	url(r'^api/events/$', views.eventsApi),
	url(r'^api/events/(?P<eventId>[0-9]+)$', views.eventsApi),
	url(r'^api/comments/(?P<eventId>[0-9]+)/$', views.commentsApi),
	url(r'^api/comments/(?P<eventId>[0-9]+)/(?P<commentId>[0-9]+)/$', views.commentsApi),
    url(r'^api/users/$', views.usersApi),
    url(r'^api/users/(?P<userId>[0-9]+)$', views.usersApi),
    url(r'^$', views.index, name = 'home_page'),
	url(r'^api/search/?$', views.search, name = 'search_view'),
]
