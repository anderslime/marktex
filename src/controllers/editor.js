var texapp = require('../main.js');

texapp.controller('editorController', ['$scope', '$routeParams', '$http', '$q', '$timeout',
							   function($scope,   $routeParams,   $http,   $q,	  $timeout) {

	$scope.docloaded = false;
	var config = require('config');
	var BCSocket = require('../../components/sharejs/channel/bcsocket.js').BCSocket;
	var sharejs = require('sharejs');
	var socket = new BCSocket(config.urls.sharejscollab, { reconnect: true });
	var sjs = new sharejs.Connection(socket);
	var defAceLoaded = $q.defer();
	var defDocLoaded = $q.defer();

	//listen to sharejs socket state changes
	function socketStateChanged(doc){
		$scope.state = (!$scope.docloaded ? 0 : sjs.socket.readyState);
		$scope.pendingdata = ((!$scope.docloaded || doc === undefined) ? false : (doc.pendingData.length > 0 && sjs.socket.readyState !== 1)) ? 'You have unsynchronized changes to this document!' : '';
	}

	$scope.onAceLoaded = function(aceEditor){
		defAceLoaded.resolve(aceEditor);
	};

	$scope.tmOptions = { onAceLoaded: $scope.onAceLoaded, readonly: true };
	$scope.docname = docname = $routeParams.docId || 'dojo';
	var doc = sjs.get('docs', docname);
	doc.subscribe();
	
	/*doc.connection.on('connected', function(){
			socketStateChanged(doc);
	});
	doc.connection.on('open', function(){
			socketStateChanged(doc);
	});
	doc.connection.on('close', function(){
			socketStateChanged(doc);
	});
	doc.connection.on('error', function(){
			socketStateChanged(doc);
	});*/

	//note that the connection state will remain 'connecting' at least until this method has fired
	doc.whenReady(function() {
		if (!doc.type)
			doc.create('text');
		defDocLoaded.resolve();
	});

	$q.all([
		defAceLoaded.promise,
		defDocLoaded.promise
	]).then(function(data) {
		$timeout(function(){
			var ae = data[0];
			doc.attach_ace(ae);
			ae.scrollToLine(0, false, false, function(){});
			ae.focus();
			socketStateChanged();
			
			$scope.docloaded = true;
			$scope.tmOptions.readonly = false;
		}, 0);
	});

}]);

module.exports = texapp;
