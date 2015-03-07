var texapp = require('../main.js');

texapp.controller('editorController', ['$scope', '$routeParams', function($scope, $routeParams) {

	$scope.docloaded = false;
	var config = require('config');
	var BCSocket = require('../../components/sharejs/channel/bcsocket.js').BCSocket;
	var sharejs = require('sharejs');
	var socket = new BCSocket(config.serverurl, { reconnect: true });
	var sjs = new sharejs.Connection(socket);

	//listen to sharejs socket state changes
	function socketStateChanged(doc){
		$scope.state = (!$scope.docloaded ? 0 : sjs.socket.readyState);
		$scope.pendingdata = ((!$scope.docloaded || doc === undefined) ? false : (doc.pendingData.length > 0 && sjs.socket.readyState !== 1)) ? 'You have unsynchronized changes to this document!' : '';
		$scope.$apply();
	}

	$scope.onAceLoaded = function(aceEditor){
		doc.attach_ace(aceEditor);
		aceEditor.scrollToLine(0, false, false, function(){});
	};

	$scope.tmOptions = { onAceLoaded: $scope.onAceLoaded, readonly: true };
	$scope.docname = docname = $routeParams.docId || 'dojo';
	var doc = sjs.get('docs', docname);
	
	doc.connection.on('connected', function(){
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
	});

	//note that the connection state will remain 'connecting' at least until this method has fired
	doc.whenReady(function() {
		$scope.docloaded = true;
		$scope.tmOptions.readonly = false;
		if (!doc.type)
			doc.create('text');
		
		socketStateChanged();
	});

	doc.subscribe();

}]);