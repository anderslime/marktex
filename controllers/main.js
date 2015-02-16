texapp.controller('mainController', ['$scope', 'mathjaxservice', '$sce', '$compile', function($scope, mathjaxservice, $sce, $compile) {
	$scope.color = 'black';
	$scope.loading = false;

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
		//must be made faster
		angular.forEach(angular.element('.mathjax'), function(e){
			var $e = angular.element(e);
			var id = $e.attr('id');

			angular.forEach($scope.state, function(s){
				if(s.jaxid === id){
					s.html = $e.html();
					s.dirty = false;
				}
			});
		});
	});
}]);