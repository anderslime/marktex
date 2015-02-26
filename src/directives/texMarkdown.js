var texapp = require('../controllers/main.js');

texapp.directive('texMarkdown', ['$rootScope', '$compile', 'mathjaxservice', function($rootScope, $compile, mathjaxservice) {
	var timeout;
	return {
		restrict: "A",
        scope: { 'texMarkdown': '=' },
        template: '<div class="document"></div><div class="document-preview"></div>',
        link: function(scope, element, attrs) {
        	var pdocElem = element.find('.document-preview');
			var docElem = element.find('.document');

			scope.$watch('texMarkdown', function(newVal, oldVal) {
				if(timeout)
					clearTimeout(timeout);

			    //$rootScope.$broadcast('jax-preprocess', pdocElem);
			    
				timeout = setTimeout(function(){
					pdocElem.html(mathjaxservice.markdown(newVal));
			    	$compile(element.contents())(scope);
					$rootScope.$broadcast('jax-typeset', pdocElem);
				}, 300);

				$rootScope.$on('jax-typeset-done', function(e, args){
					docElem.html(pdocElem.html());
					$rootScope.$apply();
				});
				
			});
	    }
	};
}]);