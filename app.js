var myApp = angular.module('myApp', []);


myApp.component('eventThumbnails', {
	templateUrl: 'eventThumbnail.template.html',
	controller: function($scope) {
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
		
		$scope.events = events;
		
		
	}
});

