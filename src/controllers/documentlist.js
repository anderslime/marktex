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

texapp.controller('optionsModalController', ['$scope', '$modalInstance', 'doc', '$facebook', 'notificationservice', 'documentservice',
									function ($scope,    $modalInstance,  doc,   $facebook,   notificationservice,   documentservice) {
	$scope.doc = doc;
	$scope.connections = [];

	$facebook.api('/me/friends').then( 
		function(response) {
			$scope.connections = response.data;
		},
		function(err) {
			notificationservice.error(err);
		});

	$scope.remove = function(doc){
		doc.loading = true;

		documentservice.remove(doc._id).success(function(){
			doc.loading = false;
			//delete
			$modalInstance.close(true);
		}).error(function(){
			notificationservice.error('Unable to delete document, please try again', 'long');
			doc.loading = false;
		});
	};

	$scope.update = function(doc){
		doc.loading = true;

		documentservice.update(doc).success(function(updatedDoc){
			doc.name = updatedDoc.name;
			doc.loading = false;
		}).error(function(){
			notificationservice.error('Unable to update document, please try again', 'long');
			doc.loading = false;
		});
	};

	$scope.close = function () {
		$modalInstance.close();
	};
}]);
