var texapp = require('../controllers/main.js');

texapp.directive('texMarkdown', ['$rootScope', '$compile', 'mathjaxservice', function($rootScope, $compile, mathjaxservice) {
	var timeout;
	return {
		restrict: "A",
        scope: { 'texMarkdown': '=' },
        link: function(scope, element, attrs) {
			scope.$watch('texMarkdown', function(newVal, oldVal) {
				if(timeout)
					clearTimeout(timeout);

				element.html(mathjaxservice.markdown(newVal));
			    $compile(element.contents())(scope);
			    $rootScope.$broadcast('jax-preprocess');
			    
				timeout = setTimeout(function(){
					$rootScope.$broadcast('jax-typeset');
				}, 500);
				
			});
	    }
	};
}]);