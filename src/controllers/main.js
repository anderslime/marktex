var texapp = angular.module('texapp', ['btford.markdown', 'ui.bootstrap', 'ui.layout', 'ui.ace', 'ngRoute']);

texapp.controller('mainController', ['$scope', 'mathjaxservice', '$sce', '$compile', '$routeParams',
							function( $scope,   mathjaxservice,   $sce,   $compile,   $routeParams) {

	var socket = new BCSocket('http://enigmatic-citadel-9501.herokuapp.com/channel', { reconnect: true });
	var sjs = new sharejs.Connection(socket);

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

	function wrapTextNodes(e, wrapelm) {
	    e.contents().filter(function() {
		    return this.nodeType === 3 && this.parentNode.nodeName !== 'P';
		}).wrap(wrapelm);

		if(!e.hasClass('mathjax'))
			angular.forEach(e.children(), function(c){
				wrapTextNodes($(c), wrapelm);
			});
	}

	//this will mark states as no longer being dirty, as they were now typeset
	//it will fire another $watch roundtrip, but it will be quickly processed
	//as states are not dirty
	$scope.$on('typeset', function(e, args){
		//for states only markdowned
		if(args){
			args.state.html = args.html;
			args.state.dirty = false;
			return;
		}

		//for states being markdowned and mathjaxed
		angular.forEach($scope.state, function(s){
			var e = $('#' + s.oid);
			if(s.oid !== undefined && e[0] !== undefined){
				wrapTextNodes(e, '<p/>');
				s.html = e[0].outerHTML; // html must contain the full html, now it only holds the jax element
				s.dirty = false;
			}
		});

	});
}]);

module.exports = texapp;