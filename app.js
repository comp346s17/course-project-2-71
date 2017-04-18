var myApp = angular.module('myApp', ['ngRoute']);


myApp.service('eventsService', function() {
  
	var events = [{
			id:1,
			image: "eventImage.png",
			title: "The greatest event ever",
			location: "St. Paul",
			organizer: "Sarah Lee",
			going: 100,
			date: "12/23",
			time: "12:00pm",
			description: "This event will be awesome"
		}, {
			id: 2,
			image: "eventImage.png",
			title: "2nd greatest event ever",
			location: "Minneapolis",
			organizer: "Marylou",
			going: 92,
			date: "1/10",
			time: "11:00am",
			description: "This event will be less awesome, but I want a really long descripition so I end up in my second line"
		}];
	return {
		all: function() { return events; },
		get: function(eventId) {
			return events.find(function(event) {
				return event.id == eventId;
			});
		}

	};
});

myApp.component('eventThumbnails', {
	templateUrl: 'eventThumbnail.template.html',
	controller: function($scope, eventsService) {
		
		
		$scope.events = eventsService.all();
		
		
	}
});



myApp.component('newEventForm', {
	templateUrl: 'newEventForm.template.html',
	controller: function($scope){
		//nothing goes here yet: access form content: $scope.name, etc
	}
})


myApp.component('eventDetail', {
	templateUrl: 'eventpage.template.html',
	controller: function($scope, eventsService, $routeParams) {
		
		console.log('get here');
		$scope.event = eventsService.get($routeParams.eventId);
		
		
	}
});

myApp.component('signUp', {
	templateUrl: 'signup.template.html',
	controller: function($scope){
		//nothing here yet
	}
})

myApp.config(function($routeProvider) {
	
  $routeProvider.
    when('/', {
      template: '<event-thumbnails></event-thumbnails>'
    }).
    when('/event/:eventId', {
      template: '<event-detail></event-detail>'
    }).
    when('/new-event', {
    	template: '<new-event-form></new-event-form>'
    }).
    otherwise('/');
});


