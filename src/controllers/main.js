var texapp = angular.module('texapp', ['btford.markdown', 'ui.bootstrap', 'ui.layout', 'ui.ace', 'ngRoute']);

texapp.config(['markdownConverterProvider', function (markdownConverterProvider) {
	markdownConverterProvider.config({
		extensions: ['mathjax']
	});
}]);

texapp.controller('mainController', ['$scope', 'mathjaxservice', '$sce', '$compile', '$routeParams',
							function( $scope,   mathjaxservice,   $sce,   $compile,   $routeParams) {

	var config = require('../config.dev.js');
	var BCSocket = require('../../components/sharejs/channel/bcsocket.js').BCSocket;
	var sharejs = require('sharejs');

	var docloaded = false;
	var socket = new BCSocket(config.serverurl, { reconnect: true });
	var sjs = new sharejs.Connection(socket);

	//listen to sharejs socket state changes
	function socketStateChanged(){ $scope.state = (!docloaded ? 0 : sjs.socket.readyState); $scope.$apply(); }

	//occurs when ace editor is loaded. will initialize a document afterwards
	var aceLoaded = function(_editor) {
		var docname = document.location.href.substring(document.location.href.indexOf('#/') + 2);
		var doc = sjs.get('docs', docname);
		
		doc.connection.on('connected', function(){
			socketStateChanged();
		});
		doc.connection.on('open', function(){
			socketStateChanged();
		});
		doc.connection.on('close', function(){
			socketStateChanged();
		});
		doc.connection.on('error', function(){
			socketStateChanged();
		});

		//note that the connection state will remain 'connecting' at least until this method has fired
		doc.whenReady(function() {
			docloaded = true;
			if (!doc.type)
				doc.create('text');

			doc.attach_ace(_editor);
			socketStateChanged();
		});

		doc.subscribe();
	};

	$scope.state = 0; //connecting
	$scope.color = 'black';

	//defalt document content
	$scope.document = '';

	//ace options
	$scope.aceOptions = {
		useWrapMode : true,
		showGutter: false,
		theme:'twilight',
		mode: 'markdown',
  		onLoad: aceLoaded
	};

	var scaleTimeout;
	var specialElementHandlers = {
	    '.toolbox': function (element, renderer) {
	        return true;
	    }
	};

	//fired on page resize, both window and columns
	//updates zoom ratio and typesets afterwards
	$scope.onPageResize = function(){
		mathjaxservice.updateZoom();
		mathjaxservice.typeset($scope.expression, 300);
	};

	//controls black/white theme by inverting colors
	$scope.toggleColors = function(){
		$scope.color = ($scope.color === 'white' ? 'black' : 'white');
	};

}]);

module.exports = texapp;