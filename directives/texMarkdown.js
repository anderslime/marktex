texapp.directive('texMarkdown', ['$compile', 'mathjaxservice', function($compile, mathjaxservice) {
	return {
		restrict: "A",
        scope: { 'texMarkdown': '=' },
        link: function(scope, element, attrs) {
			scope.$watch('texMarkdown', function(newVal, oldVal) {
				element.html(mathjaxservice.typeset(newVal));
			    $compile(element.contents())(scope);
			});
	    }
	};
}]);