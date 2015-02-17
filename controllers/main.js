var texapp = angular.module('texapp', ['btford.markdown', 'ui.bootstrap', 'ui.layout']);

texapp.controller('mainController', ['$scope', 'mathjaxservice', '$sce', '$compile',
							function( $scope,   mathjaxservice,   $sce,   $compile) {

	$scope.color = 'black';

	//defalt state
	$scope.state = [ { text: '$$line1 \\sqrt{b^2-4ac}$$', html: '', dirty: true }, { text: '## line2', html: '', dirty: true }];

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
			if(s.oid !== undefined){
				wrapTextNodes($('#' + s.oid), '<p/>');
				s.html = $('#' + s.oid)[0].outerHTML; // html must contain the full html, now it only holds the jax element
				s.dirty = false;
			}
		});

	});
}]);