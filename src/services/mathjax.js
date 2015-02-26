var texapp = require('../controllers/main.js');

texapp.factory('mathjaxservice', ['$sanitize', 'markdownConverter', '$rootScope', function($sanitize, markdownConverter, $rootScope) {
	var sTimeout, typesetting = false;

	$rootScope.$on('jax-preprocess', function(e, args){
		MathJax.Hub.Queue(['PreProcess', MathJax.Hub, args[0]]);
	});

	$rootScope.$on('jax-typeset', function(e, args){
		typesetting = true;
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, args[0]]);
		MathJax.Hub.Queue(function(){
			typesetting = false;
			$rootScope.$broadcast('jax-typeset-done');
		});
	});

	function replaceSlashes(value){
		//adds slash before \#, so we can use hashes in latex syntax
		return value.replace(/\\#/g,'\\\\#');
	}

	return {
		markdown: function(d){
			if(d === undefined || d.length === 0)
				return '';

			//return markdowned html
			return $sanitize(markdownConverter.makeHtml(replaceSlashes(d)));
		}
	};
}]);