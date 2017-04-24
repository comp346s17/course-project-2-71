var myApp = angular.module('myApp', ['ngRoute', 'ngResource']);



myApp.service('eventsService', function($resource) {
	return $resource('/api/events/:id', {});
	/* var events = [{
			id:1,
			image: "/static/main/img/eventImage.png",
			title: "The greatest event ever",
			location: "St. Paul",
			organizer: "Sarah Lee",
			going: 100,
			date: "12/23",
			time: "12:00pm",
			description: "This event will be awesome",
			mediaList: [{
				id: 1,
				path: "/static/main/img/eventMedia1.jpg",
				description: "Shiny trees",				
				},{
				id: 2,
				path: "/static/main/img/eventMedia2.jpg",
				description: "Cake!",	
			
				},{
				id: 3,
				path: "/static/main/img/eventMedia2.jpg",
				description: "Cake!",	
			
				},{
				id: 4,
				path: "/static/main/img/img1.jpg",
				description: "Cake!",	
			
				},{
				id: 5,
				path: "/static/main/img/img2.jpg",
				description: "Cake!",	
			
				}]
		}, {
			id: 2,
			image: "/static/main/img/eventImage.png",
			title: "2nd greatest event ever",
			location: "Minneapolis",
			organizer: "Marylou",
			going: 92,
			date: "1/10",
			time: "11:00am",
			description: "This event will be less awesome, but I want a really long descripition so I end up in my second line",
			mediaList: [{
				id: 3,
				path: "/static/main/img/eventMedia3.png",
				description: "Scary dragon",				
				}]
		}];
	return {
		all: function() { return events; },
		get: function(eventId) {
			return events.find(function(event) {
				return event.id == eventId;
			});
		},
	}; */
});

myApp.service('userService', function($resource){
	return $resource('/api/users/:id', {});
});

myApp.service('commentService', function(){
	var comments = [{
		id:1,
		userId: 1,
		eventId:1,
		commentTitle: "great people!",
		commentText: "I met some many woke people!",
		liked: 2,
		disliked: 0,
		
		
	},{
		id:2,
		userId: 2,
		eventId:2,
		commentTitle: "Excited!",
		commentText: "I\'m looking forward to this",
		liked: 2,
		disliked: 0,
		
		
	},{
		id:3,
		userId: 2,
		eventId:1,
		commentTitle: "I agree!",
		commentText: "I was very inspired by everyone I met! definitely greatest even ever!",
		liked: 4,
		disliked: 0,
		
		
	}];
	return {
		all: function() { return comments; },
		get: function(eventId) {
			return comments.filter(function(comment) {
				return comment.eventId == eventId;
			});
		}

	};
});

myApp.service('userService', function(){
	var users = [{
		id:1,
		userName: "OurVeryFirstUser",
		password: "123324",
		eventsGoing: [1],
		profilepic: "/static/main/img/user-profile.png"
		
		
	},{
		id:2,
		userName: "ImOnlySecond",
		password: "123324",
		eventsGoing: [2],
		profilepic: "/static/main/img/profile-pic2.jpg"
		
		
	}];
	return {
		all: function() { return users; },
		get: function(userId) {
			return users.find(function(user) {
				return user.id == userId;
			});
		}

	};
});


myApp.component('eventThumbnails', {
	templateUrl: '/static/main/eventThumbnail.template.html',
	controller: function($scope, eventsService, $routeParams) {
		eventsService.query(function(resp){
			
			$scope.events = resp;
		});
	}
});



myApp.component('newEventForm', {
	templateUrl: '/static/main/newEventForm.template.html',
	controller: function($scope, eventsService){
		//nothing goes here yet: access form content: $scope.name, etc
			$scope.submitEvent = function(){
				var mydate = $('#date').val()
				var mystartTime = $('#startTime').val()
				var myendTime = $('#endTime').val()
				var mylocation = '{\"street_number\": \"' + $scope.streetnumber + '\", \"street_name\": \"' + $scope.streetname + '\", \"city\": \"' + $scope.city
				+ '\", \"zip_code\": \"' + $scope.zip + '\"}';
				console.log(mystartTime)
				eventsService.save({title: $scope.name,descripition: $scope.detail, date: mydate, startTime: mystartTime, 
				endTime:myendTime, location: mylocation, organizer:1, image: $scope.image }, function(resp) {
				// executed on successful response
			});
			
		
		}
		
	}
})


myApp.component('eventDetail', {
	templateUrl: '/static/main/eventpage.template.html',
	controller: function($scope, eventsService, $routeParams, commentService, userService) {
		eventsService.get({id: $routeParams.eventId}, function(resp){
			$scope.event = resp;
			console.log($scope.event.media_list)
		});
		
		$scope.comments = commentService.get($routeParams.eventId);
		
		
		$scope.users = userService;
		$scope.getImage = function(){
		
		}
		
		
		
	}
});

myApp.component('signUp', {
	templateUrl: '/static/main/signup.template.html',
	controller: function($scope){
		//nothing here yet
	}
});

myApp.component('logIn', {
	templateUrl: '/static/main/login.template.html',
	controller: function($scope){
		//nothing here yet
	}
});


myApp.component('userProfile', {
	templateUrl: '/static/main/profile.template.html',
	controller: function($scope, userService){
		userService.get({id: $routeParams.userId}, function(resp){
			$scope.user = resp.user;
			$scope.events_org = resp.events_org;
			$scope.events_go = resp.events_go;
		})
	}
});

myApp.component('advSearch', {
	templateUrl: '/static/main/advsearch.template.html',
	controller: function($scope){
		//nothing here yet
	}
});

myApp.config(function($routeProvider, $httpProvider, $resourceProvider ) {
	$httpProvider.defaults.xsrfCookieName = 'csrftoken';
	$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
	$resourceProvider.defaults.stripTrailingSlashes = false;

	$routeProvider.
	   when('/', {
			template: '<event-thumbnails></event-thumbnails>'
	   }).
	   when('/event/:eventId', {
			template: '<event-detail></event-detail>'
	   }).
	   when('/user-profile', {
			template: '<user-profile></user-profile>'
	   }).
	   when('/new-event', {
			template: '<new-event-form></new-event-form>'
	   }).
		otherwise('/');
	});


myApp.directive('mediaJcarousel', function(){
	 return {
        // Restrict it to be an attribute in this case
        restrict: 'A',
	
        // responsible for registering DOM listeners as well as updating the DOM
        link: function(scope, element, attrs) {
			
            $(element).on('jcarousel:reload jcarousel:create', function () {
                var carousel = $(this),
                    width = carousel.innerWidth();

                if (width >= 600) {
                    width = width / 3;
                } else if (width >= 350) {
                    width = width / 2;
                }

                carousel.jcarousel('items').css('width', Math.ceil(width) + 'px');
            })
            .jcarousel({
                wrap: 'circular'
            });
        }
    };
});

myApp.directive('mediaContentArrows', function(){
	 return {
        // Restrict it to be an attribute in this case
        restrict: 'A',
	
        // responsible for registering DOM listeners as well as updating the DOM
        link: function(scope, element, attrs) {
			
            $(element).jcarouselControl(scope.$eval(attrs.mediaContentArrows));
        }
    };
});

myApp.directive('mediaContentPagination', function(){
	 return {
        // Restrict it to be an attribute in this case
        restrict: 'A',
	
        // responsible for registering DOM listeners as well as updating the DOM
        link: function(scope, element, attrs) {
			
            $(element).on('jcarouselpagination:active', 'a', function() {
                $(this).addClass('active');
            })
            .on('jcarouselpagination:inactive', 'a', function() {
                $(this).removeClass('active');
            })
            .on('click', function(e) {
                e.preventDefault();
            })
            .jcarouselPagination({
                perPage: 1,
                item: function(page) {
                    return '<a href="#' + page + '">' + page + '</a>';
                }
            });
        }
    };
});

myApp.directive('datetimePicker', function(){
	 return {
        // Restrict it to be an attribute in this case
        restrict: 'A',
	
        // responsible for registering DOM listeners as well as updating the DOM
        link: function(scope, element, attrs) {
			
            $(element).datetimepicker(scope.$eval(attrs.datetimePicker));
			if(attrs.id == 'date'){
				scope.date == $(element).data('date')
			}else if(attrs.id == 'startTime'){
				scope.startTime == $(element).val()
			}else{
				scope.endTime == $(element).val()
			}
			
        }
    };
});


