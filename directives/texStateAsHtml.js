texapp.directive('texStateAsHtml', ['$compile', 'mathjaxservice', function($compile, mathjaxservice) {

	function stateAsHtml(state){
		return state.map(function(val, i) {
			if(val != undefined){
				if(val.dirty)
					return mathjaxservice.typeset(val, i);
				return val.html;
			}
		}).join('');
	}

	return {
		restrict: "A",
        scope: { 'texStateAsHtml': '=' },
		link: function(scope, element, attrs) {
			scope.$watch('texStateAsHtml', function(state) {
				var elements = stateAsHtml(state);
				elements = elements.replace(new RegExp('ng-transclude', 'g'), '');
		        element.html(elements);
		        $compile(element.contents())(scope);
			}, true);
	    }
	};
}]);