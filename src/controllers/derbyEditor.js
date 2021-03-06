var texapp = require('../main.js');

texapp.controller('derbyEditorController', ['$scope', '$routeParams', '$http', '$q', '$timeout',
							   function($scope,   $routeParams,   $http,   $q,	 $timeout) {

	$scope.docloaded = false;
	$scope.docname = $routeParams.docName || 'dojo';
	$scope.docId = $routeParams.docId || 'dojo';
	$scope.tmOptions = { onAceLoaded: $scope.onAceLoaded, readonly: true, docId: $scope.docId };

	$scope.docloaded = true;
	$scope.tmOptions.readonly = false;

	//var config = require('config');
	//var Primus = require('primus-client');
	//var primus = new Primus(config.urls.sharejscollab + '?docId=' + docId);
	//var derby = require('derby');

	/*var sjs = new sharejs.Connection(primus.substream('share'));
	primus.on('data', function message(data) {
		if(data === 'Unauthorized')
			$scope.unauthorized = true;
	});*/

	/*$scope.$on('$locationChangeStart', function() {
	    primus.end();
	});*/

	var defAceLoaded = $q.defer();
	var defDocLoaded = $q.defer();

	//listen to sharejs socket state changes
	/*function socketStateChanged(doc){
		$scope.state = (!$scope.docloaded ? 0 : sjs.socket.readyState);
		$scope.pendingdata = ((!$scope.docloaded || doc === undefined) ? false : (doc.pendingData.length > 0 && sjs.socket.readyState !== 1)) ? 'You have unsynchronized changes to this document!' : '';
	}*/

	$scope.onAceLoaded = function(aceEditor){
		defAceLoaded.resolve(aceEditor);
	};


	
	
	/*var doc = sjs.get('docs', docId);
	doc.subscribe();
	//note that the connection state will remain 'connecting' at least until this method has fired
	doc.whenReady(function() {
		if (!doc.type)
			doc.create('text');
		defDocLoaded.resolve();
	});*/

	$q.all([
		defAceLoaded.promise,
		defDocLoaded.promise
	]).then(function(data) {
		$timeout(function(){
			var ae = data[0];
			//doc.attach_ace(ae);
			//$scope.tmOptions.doc = doc;
			ae.scrollToLine(0, false, false, function(){});
			ae.focus();
			//socketStateChanged();
			
			$scope.docloaded = true;
			$scope.tmOptions.readonly = false;
		}, 0);
	});

}]);

module.exports = texapp;
