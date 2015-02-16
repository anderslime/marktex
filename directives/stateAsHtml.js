texapp.directive('stateAsHtml', ['$compile', 'mathjaxservice', function($compile, mathjaxservice) {

	function stateToHtml(state){
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
        scope: { 'stateAsHtml': '=' },
		link: function(scope, element, attrs) {
			scope.$watch('stateAsHtml', function(state) {
				var elements = stateToHtml(state);
				elements = elements.replace(new RegExp('ng-transclude', 'g'), '');
		        element.html(elements);
		        $compile(element.contents())(scope);
			}, true);
	    }
	};
}]);