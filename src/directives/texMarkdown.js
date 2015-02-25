var texapp = require('../controllers/main.js');

texapp.directive('texMarkdown', ['$rootScope', '$compile', 'mathjaxservice', function($rootScope, $compile, mathjaxservice) {
	return {
		restrict: "A",
        scope: { 'texMarkdown': '=' },
        link: function(scope, element, attrs) {
			scope.$watch('texMarkdown', function(newVal, oldVal) {
				element.html(mathjaxservice.typeset(newVal));
			    $compile(element.contents())(scope);
			    $rootScope.$broadcast('typeset');
			});
	    }
	};
}]);