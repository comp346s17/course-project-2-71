var myApp = angular.module('myApp', ['ngRoute', 'ngResource']);



myApp.service('eventsService', function($resource) {
	return $resource('/api/events/:id',{}, {
		'update': { method:'PUT' }
	});
	
});

myApp.service('userService', function($resource){
	return $resource('/api/users/:id', {});
});


myApp.service('commentService', function($resource){
	return $resource('/api/comments/:eventId/:commentId',{}, {
		'update': { method:'PUT' }
	});
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
		});
		
		commentService.query({eventId:$routeParams.eventId}, function(resp){
			$scope.comments = resp;
		});
		
		
		
		$scope.getImage = function(){
			console.log($scope.event.id)
			var newMedia = "{ \"path\": \"" + $scope.image + "\"}";
			
			eventsService.update({id: $routeParams.eventId}, {"media_list": newMedia}, function(){
				var newMediaDic = { "path": $scope.image};
				$scope.event.media_list.push(newMediaDic);
			});
			
		};
		$scope.going = function(){
			//should be current user
			userService.get({id: 1}, function(resp){
				user = resp;				
				console.log(user.events_go);
			}); 
		}
		$scope.submitComment = function(){
			commentService.save({eventId:$scope.event.id},{"body": $scope.newComment, "userId":1}, function(){
							
				commentService.query({eventId:$scope.event.id}, function(resp){
					$scope.comments = resp;
				});
			});
		};
		
		//come back to this
		/* $scope.submitLike = function(like, comment){
			if(like == 1){
				var currentLike = comment.liked + 1;
			}
			else if(like == 0){
				var currentDislike = comment.disliked + 1;
			}
		};
		 */
		
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
	controller: function($scope, userService, $routeParams){
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
	   when('/user-profile/:userId', {
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


