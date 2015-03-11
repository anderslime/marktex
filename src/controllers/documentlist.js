var texapp = require('../main.js');

texapp.controller('documentListController', ['$scope', '$location', 'documentservice', 'notificationservice',
									 function($scope,   $location,   documentservice,   notificationservice) {
	$scope.loading = true;
	$scope.documents = [];

	documentservice.list().success(function(documents){
		$scope.documents = documents;
		$scope.loading = false;
	}).error(function(){
		notificationservice.error('Unable to fetch documents');
		$scope.loading = false;
	});

	$scope.gotoDoc = function(doc){
		$location.path('/editor/' + doc._id + '/' + doc.name);
	};

}]);