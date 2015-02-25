var texapp = angular.module('texapp', ['btford.markdown', 'ui.bootstrap', 'ui.layout', 'ui.ace', 'ngRoute']);
var config = require('../config.js');

texapp.config(['markdownConverterProvider', function (markdownConverterProvider) {
	markdownConverterProvider.config({
		extensions: ['mathjax']
	});
}]);

texapp.controller('mainController', ['$scope', 'mathjaxservice', '$sce', '$compile', '$routeParams',
							function( $scope,   mathjaxservice,   $sce,   $compile,   $routeParams) {

	var sjs = new sharejs.Connection(new BCSocket(config.serverurl, { reconnect: true }));

	//occurs when ace editor is loaded. will initialize a document afterwards
	var aceLoaded = function(_editor) {
		var docname = document.location.href.substring(document.location.href.indexOf('#/') + 2);
		var doc = sjs.get('docs', docname);
		doc.subscribe();

		doc.whenReady(function() {
			if (!doc.type)
				doc.create('text');

			doc.attach_ace(_editor);
		});
	};

	//listen to sharejs socket state changes
	var socketStateChanged = function(){ $scope.state = sjs.socket.readyState; $scope.$apply(); };
	sjs.socket.onclose 	 = socketStateChanged;
	sjs.socket.onerror 	 = socketStateChanged;
	sjs.socket.onopen 	 = socketStateChanged;
	sjs.socket.onmessage = socketStateChanged;

	$scope.state = 0; //conecting
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