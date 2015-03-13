var texapp = require('../main.js');

texapp.controller('documentListController', ['$scope', '$location', 'documentservice', 'notificationservice',
									 function($scope,   $location,   documentservice,   notificationservice) {
	$scope.loading = true;
	$scope.creating = false;
	$scope.documents = [];

	documentservice.list().success(function(documents){
		$scope.documents = documents;
		$scope.loading = false;
	}).error(function(){
		notificationservice.error('Unable to fetch documents');
		$scope.loading = false;
	});

	$scope.gotoDoc = function(doc){
		$location.path('/editor/' + doc._id + '/' + doc.title);
	};

	$scope.removeDoc = function(doc){
		var index = $scope.documents.indexOf(doc);
		doc.loading = true;

		documentservice.remove(doc._id).success(function(doc){
			doc.loading = false;
			doc.options = false;
			$scope.documents.splice(index, 1);
		}).error(function(){
			notificationservice.error('Unable to delete document, please try again', 'long');
			doc.loading = false;
		});
	};

	$scope.renameDoc = function(doc){
		var index = $scope.documents.indexOf(doc);
		doc.loading = true;

		documentservice.update(doc).success(function(updatedDoc){
			doc.loading = false;
			doc.options = false;
			$scope.documents[index] = updatedDoc;
		}).error(function(){
			notificationservice.error('Unable to update document, please try again', 'long');
			doc.loading = false;
		});
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
