var myApp = angular.module('myApp', []);


myApp.service('eventsService', function() {
    // move your list of posts here;
	var events = [{
			image: "eventImage.png",
			title: "The greatest event ever",
			location: "St. Paul",
			organizer: "Sarah Lee",
			going: 100,
		}, {
			image: "eventImage.png",
			title: "2nd greatest event ever",
			location: "Minneapolis",
			organizer: "Marylou",
			going: 92,
		}];
    return events;
});

myApp.component('eventThumbnails', {
	templateUrl: 'eventThumbnail.template.html',
	controller: function($scope, eventsService) {
		
		
		$scope.events = eventsService;
		
		
	}
});


myApp.controller('formCtrl', function($scope) {
    $scope.firstname = "";
    $scope.location = "";
});