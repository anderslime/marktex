var texapp = require('../controllers/main.js');

texapp.directive('texMarkdown', ['$rootScope', '$compile', 'mathjaxservice', function($rootScope, $compile, mathjaxservice) {
	var timeout;
	return {
		restrict: "A",
        scope: { 'texMarkdown': '=', 'ace': '=' },
        template: '<div class="document"></div><div class="document-preview"></div>',
        link: function(scope, element, attrs) {
        	var pdocElem = element.find('.document-preview');
			var docElem = element.find('.document');
			var start;

			$('.document-container').scroll(function(){
				mathjaxservice.scrollFromDocument(scope.ace);
			});

			$rootScope.$on('jax-typeset-done', function(e, args){
				docElem.html(pdocElem.html());
				$rootScope.$apply();

				console.log('typesat in ' + ((performance.now() - start)/1000).toFixed(2) + ' seconds');

				mathjaxservice.updateScrollSync(scope.ace, docElem);
			});

			scope.$watch('texMarkdown', function(newVal, oldVal) {
				if(timeout)
					clearTimeout(timeout);

			    //$rootScope.$broadcast('jax-preprocess', pdocElem);
			    
				timeout = setTimeout(function(){
					start = performance.now();
					console.log('markdowning...');
					pdocElem.html(mathjaxservice.markdown(newVal));
			    	$compile(element.contents())(scope);
			    	console.log('markdowned in ' + ((performance.now() - start)/1000).toFixed(2) + ' seconds');
			    	console.log('typesetting...');
					$rootScope.$broadcast('jax-typeset', pdocElem);
				}, 300);

			});

	    }
	};
}]);