var texapp = require('../main.js');

texapp.controller('documentListController', ['$scope', '$location', 'documentservice', 'notificationservice', '$modal', 'FileUploader',
									 function($scope,   $location,   documentservice,   notificationservice,   $modal,   FileUploader) {
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

	$scope.uploader = new FileUploader({
		url: '#',
		method: ''
	});

	$scope.uploader.onAfterAddingAll = function() {
		$scope.uploading = true;
		$scope.upload = false;
		$scope.uploader.uploadAll();
	};

	$scope.uploader.onCompleteItem = function(fileItem) {
		var reader = new FileReader();
		reader.addEventListener('loadend', function() {

			documentservice.create(fileItem.file.name.replace('.mdtex', '')).success(function(doc){
				var config = require('config');
				var Primus = require('primus-client');
				var primus = new Primus(config.urls.sharejscollab + '?docId=' + doc._id);
				var sharejs = require('sharejs');

				var sjs = new sharejs.Connection(primus.substream('share'));
				var sjsdoc = sjs.get('docs', doc._id);
				sjsdoc.subscribe();

				sjsdoc.whenReady(function() {
					sjsdoc.create('text');
					var ctx = sjsdoc.createContext();
					ctx.insert(reader.result, 0);
					$scope.uploading = false;
					$scope.$apply(function() {
						$scope.gotoDoc(doc);
					});
				});
			}).error(function(){
				$('#uploader')[0].value = null;
				$scope.uploading = false;
				notificationservice.error('Unable to create new document, please try again', 'long');
			});
		});
		reader.readAsText(fileItem._file);
	};

	$scope.spawnUploadDialog = function(){
		$('#uploader').click();
	};

	$scope.openOptions = function (doc) {
		var modal = $modal.open({
			templateUrl: 'templates/controllers/optionsModal.html',
			controller: 'optionsModalController',
			resolve: {
				doc: function () { return doc; }
			}
		});

		modal.result.then(function (deleted) {
			if(!deleted)
				return;
			var index = $scope.documents.indexOf(doc);
			$scope.documents.splice(index, 1);
		});
	};

	$scope.openLeaveSharing = function (doc, selfId) {
		var modal = $modal.open({
			templateUrl: 'templates/controllers/leaveSharingModal.html',
			controller: 'leaveSharingModalController',
			resolve: {
				doc: function () { return doc; },
				selfId: function () { return selfId; }
			}
		});

		modal.result.then(function (left) {
			if(!left)
				return;
			var index = $scope.documents.indexOf(doc);
			$scope.documents.splice(index, 1);
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

texapp.controller('optionsModalController', ['$scope', '$modalInstance', 'doc', '$facebook', 'notificationservice', 'documentservice', '$timeout', 'userservice',
									function ($scope,   $modalInstance,   doc,   $facebook,   notificationservice,   documentservice,   $timeout,   userservice) {
	$scope.doc = doc;
	$scope.connections = [];
	var timeout = null;

	$facebook.api('/me/friends').then( 
		function(response) {

			userservice.facebookIdsToUsers(response.data.map(function(f){ return f.id; }))
				.success(function(users){

					 //remove creator
					for(var i = users.length -1; i >= 0; i--)
						if(doc.creatorId === users[i]._id)
							users.splice(i, 1);
	
					$scope.connections = users;
				})
				.error(function(){
					notificationservice.error('Unable to fetch connections/friends', 'long');
					$scope.doc.loading = false;
				});
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

	$scope.download = function(){
		var config = require('config');
		var Primus = require('primus-client');
		var primus = new Primus(config.urls.sharejscollab + '?docId=' + $scope.doc._id);
		var sharejs = require('sharejs');
		var filesaver = require('filesaver');

		var sjs = new sharejs.Connection(primus.substream('share'));
		var doc = sjs.get('docs', $scope.doc._id);
		doc.subscribe();

		doc.whenReady(function() {
			var blob = new Blob([doc.snapshot], {type: 'text/plain;charset=utf-8'});
			filesaver.saveAs(blob, $scope.doc.name + '.mdtex');
		});
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

texapp.controller('leaveSharingModalController', ['$scope', '$modalInstance', 'doc', 'selfId', 'notificationservice', 'documentservice',
										 function ($scope,   $modalInstance,   doc,   selfId,	notificationservice,   documentservice) {
	$scope.doc = doc;

	$scope.leave = function(){
		$scope.doc.loading = true;

		var index = -1;
		angular.forEach($scope.doc.permittedUsers, function(p, i){
			if(p._id === selfId)
				index = i;
		});
		$scope.doc.permittedUsers.splice(index, 1);
		
		documentservice.leave($scope.doc._id).success(function(){
			$scope.doc.loading = false;
			$modalInstance.close(true);
		}).error(function(){
			notificationservice.error('Unable to leave document, please try again', 'long');
			$scope.doc.loading = false;
		});
	};

	$scope.close = function () {
		$modalInstance.close();
	};
}]);
