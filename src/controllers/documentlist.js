var texapp = require('../main.js');

texapp.controller('documentListController', ['$scope', 'documentservice', 'notificationservice',
									 function($scope,   documentservice,   notificationservice) {
	$scope.loading = true;
	$scope.documents = [];

	documentservice.list().success(function(documents){
		$scope.documents = documents;
		$scope.loading = false;
	}).error(function(){
		notificationservice.error('Unable to fetch documents');
		$scope.loading = false;
	});
}]);