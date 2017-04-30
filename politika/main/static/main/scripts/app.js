var myApp = angular.module('myApp', ['ngRoute', 'ngResource']);

myApp.service('userService', function($resource){
	return $resource('/api/users/:id', {}, {
		'update': {method: 'PUT'}
	});
});

myApp.factory('AuthService', function() {
  var currentUser;

  return {
    login: function(user) {currentUser = user},
    logout: function() {currentUser = null},
    isLoggedIn: function() {return (currentUser) ? true : false; },
    currentUser: function() { return currentUser; }
  };
});

myApp.controller('myCtrl', function($scope, $rootScope, AuthService) {

	$scope.submitQuery = function(){
		$rootScope.query = $scope.query
		console.log($rootScope.query)
		console.log($scope.query)
		console.log('gethere')
	}

	$scope.$watch( AuthService.isLoggedIn, function (isLoggedIn) {
		console.log("update logged in and current user variable in scope")
		$scope.isLoggedIn = isLoggedIn;
		$scope.isNotLoggedIn = !isLoggedIn;
		$scope.currentUser = AuthService.currentUser();
	});

});

myApp.service('eventsService', function($resource) {
	return $resource('/api/events/:id',{}, {
		'update': { method:'PUT' }
	});
	
});
myApp.service('searchService', function($resource) {
	return $resource('/api/search/',{}, {
	});
	
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
			if(resp.length == 0) {
				$scope.noEvents = 1;
			}
			$scope.events = resp;
		});
	}
});

myApp.component('searchResults', {
	templateUrl: '/static/main/eventThumbnail.template.html',
	controller: function($scope, searchService, $routeParams, $rootScope) {
		console.log($rootScope.query)
		var query = {"q": $rootScope.query}
		console.log(query)
		searchService.query(query, function(resp){
			if(resp.length == 0) {
				$scope.noResults = 1;
			}
			$scope.events = resp;
		}); 
	}
});


myApp.component('newEventForm', {
	templateUrl: '/static/main/newEventForm.template.html',
	controller: function($scope, eventsService){
			$scope.submitEvent = function(){
				var mydate = $('#date').val()
				var mystartTime = $('#startTime').val()
				var myendTime = $('#endTime').val()
				var mylocation = '{\"street_number\": \"' + $scope.streetnumber + '\", \"street_name\": \"' + $scope.streetname + '\", \"city\": \"' + $scope.city
				+ '\", \"zip_code\": \"' + $scope.zip + '\"}';
				eventsService.save({title: $scope.name,descripition: $scope.detail, date: mydate, startTime: mystartTime, 
				endTime:myendTime, location: mylocation, organizer:2, image: $scope.image }, function(resp) {
				console.log("event created!")
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
			userService.get({id: 2}, function(resp){
				user = resp;				
				console.log(user.events_go);
			}); 
		}
		$scope.submitComment = function(){
			commentService.save({eventId:$scope.event.id},{"body": $scope.newComment, "userId":2}, function(){
				console.log('get here')	
				commentService.query({eventId:$scope.event.id}, function(resp){
					$scope.comments = resp;
					console.log(resp)
					console.log(resp.userId)
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
	controller: function($scope, userService, AuthService){
		$scope.register = function(){
			userService.save({
				form: 'signup',
				username : $scope.username,
				password1 : $scope.password1,
				password2 : $scope.password2,
				first_name : $scope.first_name,
				last_name : $scope.last_name,
				profile_pic : $scope.profile_pic,
				about : $scope.about
			}, function(resp){
				$scope.resp = resp;
				AuthService.login(resp.user);
			});
		};

	}
});

myApp.component('logIn', {
	templateUrl: '/static/main/login.template.html',
	controller: function($scope, userService, AuthService){
		$scope.login = function(){
			userService.save({
				form: 'login',
				username : $scope.username,
				password : $scope.password,
			}, function(resp){
				$scope.resp = resp;
				AuthService.login(resp.user);
				console.log(AuthService.currentUser());
			});
		};
	}
});

myApp.controller('logoutCtrl', function($scope, userService, AuthService){
	$scope.logout = function(){
		userService.save({
			action: 'logout'
		}, function(resp){
			AuthService.logout();
		})
	}
})

myApp.component('userProfile', {
	templateUrl: '/static/main/profile.template.html',
	controller: function($scope, userService, $routeParams, AuthService){
		userService.get({id: AuthService.currentUser().id}, function(resp){
			$scope.user = resp.user;
			$scope.events_org = resp.events_org;
			$scope.events_go = resp.events_go;
		})

		$scope.editProfile = function(){
			userService.update({
				id : $scope.user.id},
				{first_name: $scope.first_name,
				last_name: $scope.last_name,
				about: $scope.about,
				profile_pic: $scope.profile_pic
			}, function(resp) {
				$scope.resp = resp;
				$scope.user = resp.user;
			});
		}
	}
});

myApp.component('advSearch', {
	templateUrl: '/static/main/advsearch.template.html',
	controller: function($scope){
		//nothing here yet
	}
});

myApp.config(function($routeProvider, $httpProvider, $resourceProvider, $qProvider) {
	$httpProvider.defaults.xsrfCookieName = 'csrftoken';
	$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
	$resourceProvider.defaults.stripTrailingSlashes = false;
    $qProvider.errorOnUnhandledRejections(false);

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
	   when('/search/',{
		  template: '<search-results></search-resuls>'
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

