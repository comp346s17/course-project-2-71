var myApp = angular.module('myApp', ['ngRoute', 'ngResource']);

// A service that keeps track of the authentication status of user. 
// Other controllers can use the returning functions to access or change authenticaiton status of user. 
myApp.factory('AuthService', function() {
  var currentUser;

  return {
    login: function(user) {currentUser = user},
    logout: function() {currentUser = null},
    isLoggedIn: function() {return (currentUser) ? true : false; },
    currentUser: function() { return currentUser; },
  };
});


// The main controller for the root scope
myApp.controller('myCtrl', function($scope, $rootScope, AuthService, $location) {
	$scope.currentPage = $location.path()

	//store search query string
	$scope.submitQuery = function(){
		$rootScope.query = $scope.query
	}

	//update current logged in status and current user everytime the authentication service changes
	$scope.$watch( AuthService.isLoggedIn, function (isLoggedIn) {
		$scope.isLoggedIn = isLoggedIn;
		$scope.isNotLoggedIn = !isLoggedIn;
		$scope.currentUser = AuthService.currentUser();
	});
	
	//records the previous page the user has visited. Uses this information to redirect user back to that page after they have perfomed
	//certain actions. i. g. delete an event
	 $rootScope.$on('$locationChangeStart', function() {
        $rootScope.previousPage = $scope.currentPage;
		$scope.currentPage = $location.path();
    });
	

});


myApp.service('userService', function($resource){
	return $resource('/api/users/:id', {}, {
		'update': {method: 'PUT'}
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

//component that renders the information for all future events in our db to the home page
myApp.component('eventThumbnails', {
	templateUrl: '/static/main/eventThumbnail.template.html',
	controller: function($scope, eventsService, $routeParams, AuthService, $rootScope, $location) {
		
		//get all events
		eventsService.query(function(resp){
			if(resp.length == 0) {
				$scope.noEvents = 1;
			}
			
			$scope.events = resp;
			checkIfUserIsOrganizer();
		});
		
		//watch for if a user is logged in
		$scope.$watch( AuthService.isLoggedIn, function (isLoggedIn) {

			checkIfUserIsOrganizer();
			

		});
		//method that goes through list of events to be displayed and checks if the current user is the organizer for those events
		//if the user is organizer the I'm going button turns into a Edit event button
		var checkIfUserIsOrganizer = function(){
			if($scope.events){
				$scope.events.forEach(function(event){
						if(AuthService.currentUser().id == event.organizer.id){
							event.isOrganizer = true;
							
						}else{
							event.isOrganizer = null;
						}
						
					})
			}
		}
		//method that allow user to select the I'm going button and interact witht ht api to rsvp to the event
		$scope.going = function(event){
			if(AuthService.isLoggedIn()){			
				
				eventsService.update({id: event.event.id},{going: (event.event.going + 1)}, 
					function(resp){
						if (event.event.going == resp.going){
							$rootScope.alertMsg = "You are already going to this event!"
						}else{
				 			$rootScope.alertMsg = "Event added to your event list. See you there!";
				 			$scope.events.forEach(function(event){
				 				if(event.id==resp.id){
				 					event.going = resp.going;
				 				}
				 			});
						}
					});
			}else{
				$rootScope.alertMsg = "Please sign up or log in to attend event"
			}
		}
	}
});

//takes selection from advanced search modal, creates a new query and redirects to search result component
myApp.component('advSearch', {
	templateUrl: '/static/main/advsearch.template.html',
	controller: function($scope, searchService, $routeParams, $rootScope, $location){
		$scope.search = function(){
			var query = $scope.city +' '+ $scope.category;
			$rootScope.query = query;
			$location.path('/search');
		}
	}
});


//component that deals with user search requests and send them to the search api. It renders the results to the screen
myApp.component('searchResults', {
	templateUrl: '/static/main/eventThumbnail.template.html',
	controller: function($scope, searchService, $routeParams, $rootScope, AuthService, eventsService) {
		console.log($rootScope.query)
		var query = {"q": $rootScope.query}
		console.log(query)
		searchService.query(query, function(resp){
			if(resp.length == 0) {
				$scope.noResults = 1;
			}
			$scope.events = resp;
			checkIfUserIsOrganizer();
		}); 
		$scope.$watch( AuthService.isLoggedIn, function (isLoggedIn) {
			checkIfUserIsOrganizer();
			
		});
		var checkIfUserIsOrganizer = function(){
			if($scope.events){
				$scope.events.forEach(function(event){
						if(AuthService.currentUser().id == event.organizer.id){
							event.isOrganizer = true;
							
							
						}else{
							event.isOrganizer = null;
						}
						
					})
			}
		}
		$scope.going = function(event){
			if(AuthService.isLoggedIn()){			
				
				eventsService.update({id: event.event.id},{going: (event.event.going + 1)}, 
					function(resp){
						if (event.event.going == resp.going){
							$rootScope.alertMsg = "You are already going to this event!"
						}else{
				 			$rootScope.alertMsg = "Event added to your event list. See you there!";
				 			$scope.events.forEach(function(event){
				 				if(event.id==resp.id){
				 					event.going = resp.going;
				 				}
				 			});
						}
					});
			}else{
				$rootScope.alertMsg = "Please sign up or log in to attend event"
			}
		}
	}
	
});

//only allows logged in user to create new events
myApp.controller('newEventCtrl', function($scope, AuthService){
	$scope.checkPermission = function(){
		if(AuthService.isLoggedIn()){
			$scope.link = "#!/new-event";
			$scope.target='';
		}else{ //if not logged in, display msg with directions
			$scope.link =''; 
			$scope.target = '#alertModal';
			$scope.alertMsg = "Please log in or sign up to add new events!";
		}
	}
})

//component with form, user can use it to create a new event or update an already existing event for which they organize. 
myApp.component('newEventForm', {
	templateUrl: '/static/main/newEventForm.template.html',
	controller: function($scope, eventsService, AuthService, $location, $rootScope,$routeParams){
		
			//this function is a form validation, it checks that all fields are filled. User cannot submit form otherwise.
			var fieldIsEmpty = function(){
				if(!$scope.name || !$scope.detail || $('#date').val() == '' || $('#startTime').val()=='' || $('#endTime').val()=='' || !$scope.streetnumber ||
				!$scope.streetname || !$scope.zip || !$scope.city){
					$scope.resp = {'error': 'Please fill all fields'}
					console.log($('#date').val()=='')
					console.log($('#startTime').val()=='')
					console.log($('#endTime').val()=='')
					console.log(!$scope.name)
					console.log( !$scope.detail)
					console.log(!$scope.streetnumber)
					console.log(!$scope.streetname)
					console.log( !$scope.city)
					console.log( !$scope.zip)
					console.log(!$scope.name || !$scope.detail || $('#date').val() == '' || !$('#startTime').val()=='' || !$('#endTime').val()=='' || !$scope.streetnumber ||
				!$scope.streetname || !$scope.zip || !$scope.city)
					return true;
				}
				return false;
			}
			
			//This is when user is editing a already existing event they organize
			if($routeParams.eventId){
				eventsService.get({id: $routeParams.eventId}, function(resp){
					$scope.name = resp.title;
					$scope.detail=resp.description;
					$scope.date=resp.date;
					$scope.startTime=resp.startTime;
					$scope.endTime=resp.endTime;
					$scope.streetnumber=resp.location.street_number;
					$scope.streetname=resp.location.street_name;
					$scope.zip=resp.location.zip_code;
					$scope.city=resp.location.city;
					$scope.image=resp.image;
					$scope.hasEvent = true;
					$scope.updateEvent = function(){
						if(!fieldIsEmpty()){
							var mydate = $('#date').val() //ng-model does not work with the date and time pickers for some reason.
							var mystartTime = $('#startTime').val()
							var myendTime = $('#endTime').val()
							var mylocation = '{\"street_number\": \"' + $scope.streetnumber + '\", \"street_name\": \"' + $scope.streetname + '\", \"city\": \"' + $scope.city
							+ '\", \"zip_code\": \"' + $scope.zip + '\"}';
							params = {title: $scope.name,description: $scope.detail, date: mydate, startTime: mystartTime, 
							endTime:myendTime, location: mylocation, organizer:AuthService.currentUser().id, image: $scope.image }
							eventsService.update({id: $routeParams.eventId},params,function(resp){
								$location.path($rootScope.previousPage)
								console.log('id');
							})
					}
				}
					
				});
			};
			
			//This is when user is editing a already existing event they organize
			$scope.submitEvent = function(){
				if(!fieldIsEmpty()){
					var mydate = $('#date').val()
					var mystartTime = $('#startTime').val()
					var myendTime = $('#endTime').val()
					var mylocation = '{\"street_number\": \"' + $scope.streetnumber + '\", \"street_name\": \"' + $scope.streetname + '\", \"city\": \"' + $scope.city
					+ '\", \"zip_code\": \"' + $scope.zip + '\"}';
					var mycategory = $scope.val1 +" "+ $scope.val2 +' '+ $scope.val3 +' '+ $scope.val4 +' '+ $scope.val5 +' '+ $scope.val6

					params = {title: $scope.name,description: $scope.detail, date: mydate, startTime: mystartTime, 
					endTime:myendTime, location: mylocation, organizer:AuthService.currentUser().id, image: $scope.image, category: mycategory};
					console.log('submit EVENT');
					console.log($scope.title)
					eventsService.save(params,	function(resp) {

						

						if(!resp.error){
							$location.path($rootScope.previousPage)
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
						}
						$scope.resp = resp;
					
						console.log(resp);
					});
				}	
			}	

					
			}

		
});

//component that renders the event a particular event information to the screen
myApp.component('eventDetail', {
	templateUrl: '/static/main/eventpage.template.html',
	controller: function($scope, eventsService, $routeParams, commentService, userService, AuthService, $location, $rootScope) {
		var loggedInUserId;
		eventsService.get({id: $routeParams.eventId}, function(resp){
			$scope.event = resp;
			$scope.isNotOrganizer =  true;
			
			if(AuthService.currentUser()){
				
				loggedInUserId = AuthService.currentUser().id;
				// checks if the current user is the organizer of the event. If yes allows user to edit and delete the event
				if(loggedInUserId == $scope.event.organizer.id){ 
					$scope.isOrganizer = true;
					$scope.isNotOrganizer = null;
				}
			}
		}
		)
		//get all comments for this event
		commentService.query({eventId:$routeParams.eventId}, function(resp){
			$scope.comments = resp;
		});

		//checks if the user is logged in, if yes allows then to add comments and media content, otherwise pop up shows up, asking then to log in or sign up
		$scope.checkPermission = function(){
			if(loggedInUserId){
				$scope.targetComment = '#addCommentModal';
				$scope.targetMedia = "#addImageModal";
			}else{
				$scope.alertMsg = 'Please sign up or log in to edit event'
				$scope.targetComment = '#alertModal';
				$rootScope.alertMsg = 'Please sign up or log in to edit event';

			}
		}
		
		//allows users to add images to the media sections
		$scope.getImage = function(){
			
			var newMedia = "{ \"path\": \"" + $scope.image + "\"}";
			
			eventsService.update({id: $routeParams.eventId}, {"media_list": newMedia}, function(){
				var newMediaDic = { "path": $scope.image};
				$scope.event.media_list.push(newMediaDic);
			});
			
		};
		//allows user to rsvp (say Im going) to an event
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
				$rootScope.alertMsg = "Please sign up or log in to attend event"
			}
		}
		
		//Creates new comment to event
		$scope.submitComment = function(){
			commentService.save({eventId:$scope.event.id},{"body": $scope.newComment, "userId": loggedInUserId}, function(){
				commentService.query({eventId:$scope.event.id}, function(resp){
					$scope.comments = resp;
				});
			});
		};

		//deletes event
		$scope.deleteEvent = function(){
			eventsService.delete({id: $scope.event.id}, function(resp) {
					
					$location.path($rootScope.previousPage);
				})
		}
	}
});


// component handles registration by sending requests to the user API and displays errors or success message
myApp.component('signUp', {
	templateUrl: '/static/main/signup.template.html',
	controller: function($scope, userService, AuthService){

		// Resets the form after user logs in or out
		$scope.$watch( AuthService.isLoggedIn, function (isLoggedIn) {
			$scope.isLoggedIn = isLoggedIn; //condition to display success message
			$scope.signupForm.$setPristine();
			$scope.signupForm.$setUntouched();
			$scope.username = "";
			$scope.password1='';
			$scope.password2='';
			$scope.profile_pic='';
			$scope.about='';
			isLoggedIn ? $scope.modal = "modal" : $scope.modal="" //if logged in, allow user to press enter to dismiss modal
		});

		$scope.register = function(){
			userService.save({
				form: 'signup', //to differentiate from log in request
				username : $scope.username,
				password1 : $scope.password1,
				password2 : $scope.password2,
				first_name : $scope.first_name,
				last_name : $scope.last_name,
				profile_pic : $scope.profile_pic,
				about : $scope.about,
			}, function(resp){
				$scope.resp = resp;
				AuthService.login(resp.user); //if success, log user in
			});
		};

	}
});


myApp.component('logIn', {
	templateUrl: '/static/main/login.template.html',
	controller: function($scope, userService, AuthService, $location){

		//Reset form after user logs in or out
		$scope.$watch(AuthService.isLoggedIn, function (isLoggedIn) {
			$scope.isLoggedIn = isLoggedIn; //condition to display log in success msg
			$scope.loginForm.$setPristine();
			$scope.loginForm.$setUntouched();
			$scope.username="";
			$scope.password="";
			isLoggedIn ? $scope.modal = "modal" : $scope.modal="" //if log in succeeds, allow user to dismiss modal by Enter key

		});

		$scope.login = function(){
			userService.save({
				form: 'login',
				username : $scope.username,
				password : $scope.password,
			}, function(resp){
				$scope.resp = resp;
				AuthService.login(resp.user);//change authorizations status to logged in 
				
			});
		};
	}
});

//Called when user click logout link
myApp.controller('logoutCtrl', function($scope, userService, AuthService, $rootScope){
	$scope.logout = function(){
		userService.save({
			action: 'logout'
		}, function(resp){
			AuthService.logout();
			$location.redirect('/'); //redirect user back to home page
		})
	}
})

//component displaying the user profile page
myApp.component('userProfile', {
	templateUrl: '/static/main/profile.template.html',
	controller: function($scope, userService, $routeParams, AuthService, $rootScope, $location){

		//get user profile info from user API
		userService.get({id: $routeParams.userId}, function(resp){
			$scope.user = resp.user;
			if($scope.user.first_name == ''){ //if user hasn't provided a first name, display Anonymous by default
				$scope.user.first_name = 'Anonymous'
			}
			if($scope.user.profile_pic == ''){ 
				$scope.user.profile_pic = '/static/main/img/user-profile.png' //display default user avatar
			}
			//get events current user organized or is going
			$scope.events_org = resp.events_org;  
			$scope.events_go = resp.events_go;
			//prepopulate profile edit form with current info
			$scope.first_name = $scope.user.first_name; 
			$scope.last_name = $scope.user.last_name;
			$scope.about = $scope.user.about;
			$scope.profile_pic = $scope.user.profile_pic;
		})

		$scope.isAuthorized = false; //condition to display edit and delete profile button

		if(AuthService.isLoggedIn()){ //if logged in user is the same as owner of profile
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
	   when('/new-event/:eventId', {
			template: '<new-event-form></new-event-form>'
	   }).
	   when('/search/',{
		  template: '<search-results></search-resuls>'
	   }).
	   otherwise('/');
	});

//directive that allows the media section of the event page to work. 
//it connects the elements in the dom to an external jQuery library.
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

//directive that allows the media section of the event page to work. 
//it connects the elements in the dom to an external jQuery library.
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

//directive that allows the media section of the event page to work. 
//it connects the elements in the dom to an external jQuery library.
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

//directive that allows the date and time pickers in the newEventForm component to work. 
//it connects the elements in the dom to an external jQuery library.
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


