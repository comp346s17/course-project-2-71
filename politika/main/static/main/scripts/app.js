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
    currentUser: function() { return currentUser; },
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

myApp.controller('newEventCtrl', function($scope, AuthService){
	$scope.checkPermission = function(){
		if(AuthService.isLoggedIn()){
			$scope.link = '#!/new-event';
		}else{
			$scope.target = '#alertModal';
			$scope.alertMsg = "Please log in or sign up to add new events!";
			console.log($scope.target)
		}
	}
})


myApp.component('newEventForm', {
	templateUrl: '/static/main/newEventForm.template.html',
	controller: function($scope, eventsService, AuthService){
			$scope.submitEvent = function(){
				var mydate = $('#date').val()
				var mystartTime = $('#startTime').val()
				var myendTime = $('#endTime').val()
				var mylocation = '{\"street_number\": \"' + $scope.streetnumber + '\", \"street_name\": \"' + $scope.streetname + '\", \"city\": \"' + $scope.city
				+ '\", \"zip_code\": \"' + $scope.zip + '\"}';
				eventsService.save({title: $scope.name,descripition: $scope.detail, date: mydate, startTime: mystartTime, 

				endTime:myendTime, location: mylocation, organizer:AuthService.currentUser().id, image: $scope.image }, function(resp) {
				console.log("event created!")

				endTime:myendTime, location: mylocation, organizer:2, image: $scope.image }, 
				function(resp) {
					$scope.newEventForm.$setPristine();
					$scope.newEventForm.$setUntouched();
					$scope.name = "";
					$scope.detail='';
					$scope.date='';
					$scope.startTime='';
					$scope.endTime='';
					$scope.streetnumber='';
					$scope.streetname='';
					$scope.zip='';
					$scope.city='';
					$scope.image='';

				// executed on successful response
			});
			
		
		}
		
	}
})


myApp.component('eventDetail', {
	templateUrl: '/static/main/eventpage.template.html',
	controller: function($scope, eventsService, $routeParams, commentService, userService, AuthService) {
		eventsService.get({id: $routeParams.eventId}, function(resp){
			$scope.event = resp;
			console.log('========>>>>',$scope.event);
		});
		
		commentService.query({eventId:$routeParams.eventId}, function(resp){
			$scope.comments = resp;
		});

		var loggedInUserId;
		console.log(AuthService.currentUser())
		if(AuthService.currentUser()){
			loggedInUserId = AuthService.currentUser().id;
			console.log(AuthService.currentUser())
		}

		$scope.checkPermission = function(){
			if(loggedInUserId){
				$scope.targetComment = '#addCommentModal';
				$scope.targetMedia = "#addImageModal";
			}else{
				$scope.targetComment = '#alertModal';
				$scope.targetMedia = "#alertModal";
				$scope.alertMsg = 'Please sign up or log in to edit event'
			}
		}
		
		
		$scope.getImage = function(){
			console.log($scope.event.id)
			var newMedia = "{ \"path\": \"" + $scope.image + "\"}";
			
			eventsService.update({id: $routeParams.eventId}, {"media_list": newMedia}, function(){
				var newMediaDic = { "path": $scope.image};
				$scope.event.media_list.push(newMediaDic);
			});
			
		};
		$scope.going = function(){
			if(loggedInUserId){
				userService.get({id: loggedInUserId}, function(resp){
					user = resp;				
				}); 

				eventsService.update({id: $routeParams.eventId},{going: ($scope.event.going + 1)}, 
					function(resp){
						if ($scope.event.going == resp.going){
							$scope.alertMsg = "You are already going to this event!"
						}else{
				 			$scope.alertMsg = "Event added to your event list. See you there!"
						}
						$scope.event = resp;
					});
			}else{
				$scope.alertMsg = "Please sign up or log in to attend event"
			}
		}
		$scope.submitComment = function(){
			commentService.save({eventId:$scope.event.id},{"body": $scope.newComment, "userId": loggedInUserId}, function(){
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
	controller: function($scope, userService, AuthService){
		$scope.$watch( AuthService.isLoggedIn, function (isLoggedIn) {
			$scope.isLoggedIn = isLoggedIn;
			$scope.signupForm.$setPristine();
			$scope.signupForm.$setUntouched();
			$scope.username = "";
			$scope.password1='';
			$scope.password2='';
			$scope.profile_pic='';
			$scope.about='';
			isLoggedIn ? $scope.modal = "modal" : $scope.modal=""
		});
		$scope.register = function(){
			console.log("ABOUT???!",$scope.about);
			userService.save({
				form: 'signup',
				username : $scope.username,
				password1 : $scope.password1,
				password2 : $scope.password2,
				first_name : $scope.first_name,
				last_name : $scope.last_name,
				profile_pic : $scope.profile_pic,
				about : $scope.about,
			}, function(resp){
				$scope.resp = resp;
				console.log("NEW USER", resp);
				AuthService.login(resp.user);
			});
		};

	}
});

myApp.component('logIn', {
	templateUrl: '/static/main/login.template.html',
	controller: function($scope, userService, AuthService){

		$scope.$watch(AuthService.isLoggedIn, function (isLoggedIn) {
			$scope.isLoggedIn = isLoggedIn;
			$scope.loginForm.$setPristine();
			$scope.loginForm.$setUntouched();
			$scope.username="";
			$scope.password="";
			isLoggedIn ? $scope.modal = "modal" : $scope.modal=""
		});

		$scope.login = function(){
			userService.save({
				form: 'login',
				username : $scope.username,
				password : $scope.password,
			}, function(resp){
				$scope.resp = resp;
				AuthService.login(resp.user);
				
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
	controller: function($scope, userService, $routeParams, AuthService, $rootScope, $location){
		userService.get({id: $routeParams.userId}, function(resp){
			$scope.user = resp.user;
			if($scope.user.first_name === null){
				$scope.user.first_name = 'Anonymous'
			}
			if($scope.user.profile_pic === null){
				$scope.user.profile_pic = '/static/main/img/user-profile.png'
			}
			$scope.events_org = resp.events_org;
			$scope.events_go = resp.events_go;
		})

		$scope.isAuthorized = false;
		if(AuthService.isLoggedIn()){
			if( $routeParams.userId == AuthService.currentUser().id){
				$scope.isAuthorized = true;
			}
		}

		$scope.editProfile = function(){
			userService.update({
				id : AuthService.currentUser().id},
				{first_name: $scope.first_name,
				last_name: $scope.last_name,
				about: $scope.about,
				profile_pic: $scope.profile_pic
			}, function(resp) {
				$scope.resp = resp;
				$scope.user = resp.user;
				console.log($scope.user);
				$scope.editProfileForm.$setPristine();
				$scope.editProfileForm.$setUntouched();
				$scope.about='';
			});
		}

		$scope.deleteProfile = function(){
			userService.delete({id: AuthService.currentUser().id},
				function(resp) {
					AuthService.logout();
					$location.path('/');
				})
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
	   when('/user-profile/:userId', {
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

