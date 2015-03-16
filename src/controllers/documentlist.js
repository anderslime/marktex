var texapp = require('../main.js');

texapp.controller('documentListController', ['$scope', '$location', 'documentservice', 'notificationservice', '$modal',
									 function($scope,   $location,   documentservice,   notificationservice,   $modal) {
	$scope.loading = true;
	$scope.creating = false;
	$scope.documents = [];
	$scope.friends = [];

	documentservice.list().success(function(documents){
		$scope.documents = documents;
		$scope.loading = false;
	}).error(function(){
		notificationservice.error('Unable to fetch documents');
		$scope.loading = false;
	});

	$scope.openOptions = function (doc) {
		var modal = $modal.open({
			templateUrl: 'templates/controllers/optionsModal.html',
			controller: 'optionsModalController',
			resolve: {
				doc: function () {
					return doc;
				}
			}
		});

		modal.result.then(function (deleted) {
			if(deleted)
			{
				var index = $scope.documents.indexOf(doc);
				$scope.documents.splice(index, 1);
			}
		});
	};

	$scope.gotoDoc = function(doc){
		$location.path('/editor/' + doc._id + '/' + doc.name);
	};

	$scope.createDoc = function(){
		$scope.creating = true;
		var title = $scope.createTitle;

		documentservice.create(title).success(function(doc){
			$scope.gotoDoc(doc);
			$scope.creating = false;
		}).error(function(){
			notificationservice.error('Unable to create new document, please try again', 'long');
			$scope.creating = false;
		});
	};

}]);

texapp.controller('optionsModalController', ['$scope', '$modalInstance', 'doc', '$facebook', 'notificationservice', 'documentservice', '$timeout',
									function ($scope,    $modalInstance,  doc,   $facebook,   notificationservice,   documentservice,   $timeout) {
	$scope.doc = doc;
	$scope.connections = [];
	var timeout = null;

	$facebook.api('/me/friends').then( 
		function(response) {
			$scope.connections = response.data;
		},
		function(err) {
			notificationservice.error(err);
		});

	var update = function() {
		$scope.doc.loading = true;

		documentservice.update($scope.doc).success(function(updatedDoc){
			$scope.doc.name = updatedDoc.name;
			$scope.doc.loading = false;
		}).error(function(){
			notificationservice.error('Unable to update document, please try again', 'long');
			$scope.doc.loading = false;
		});
	};

	var debounceUpdate = function() {
		if (timeout)
			$timeout.cancel(timeout);

		timeout = $timeout(update, 1000);
	};

	$scope.remove = function(){
		$scope.doc.loading = true;

		documentservice.remove($scope.doc._id).success(function(){
			$scope.doc.loading = false;
			//delete
			$modalInstance.close(true);
		}).error(function(){
			notificationservice.error('Unable to delete document, please try again', 'long');
			$scope.doc.loading = false;
		});
	};

	$scope.update = function(){
		if($scope.document.$invalid)
			return;
		debounceUpdate();
	};

	$scope.close = function () {
		$modalInstance.close();
	};

	$scope.$watch('doc.name', debounceUpdate);

}]);
