var texapp = require('../controllers/main.js');

texapp.factory('mathjaxservice', ['$sanitize', 'markdownConverter', '$rootScope', function($sanitize, markdownConverter, $rootScope) {
	var sTimeout, typesetting = false;

	$rootScope.$on('typeset', function(e, args){
		typesetting = true;
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, $('.document')[0]]);
		MathJax.Hub.Queue(function(){
			typesetting = false;
			$rootScope.$broadcast('typeset-done');
		});
	});

	function replaceSlashes(value){
		//adds slash before \#, so we can use hashes in latex syntax
		return value.replace(/\\#/g,'\\\\#');
	}

	function typeset(d){
		if(d === undefined || d.length === 0)
			return '';

		//return markdowned html
		return $sanitize(markdownConverter.makeHtml(replaceSlashes(d)));
	}

	return {
		typeset: function(d){
			return typeset(d);
		}
	};
}]);