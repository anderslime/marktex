var texapp = require('../main.js');

texapp.factory('mathjaxservice', ['$q', '$sanitize', 'markdownConverter', '$rootScope', '$timeout',
						function(  $q,   $sanitize,   markdownConverter,   $rootScope,   $timeout) {

	function replaceSlashes(value){
		if(value === undefined)
			return '';
		//adds slash before \#, so we can use hashes in latex syntax
		return value.replace(/\\#/g,'\\\\#');
	}

	function markdown(text){				
		var mdstart = performance.now();
		console.log('markdowning...');

		var mdtext = $sanitize(markdownConverter.makeHtml(replaceSlashes(text)));

		console.log('markdowned in ' + ((performance.now() - mdstart)/1000).toFixed(2) + ' seconds');
		
		return mdtext;
	}

	var mdDef;
	return {
		markdown: function(text, imm){
			var deferred = $q.defer();

			var immediate = imm || false;
			if(text === undefined || text.length === 0)
				immediate = true;

			if(mdDef)
				clearTimeout(mdDef);

			mdDef = setTimeout(function(){
				deferred.resolve(markdown(text));
			}, immediate ? 0 : 300);

			return deferred.promise;
		},
		typeset: function(element, mdtext){
			return $q(function(resolve, reject) {
				if(!(new RegExp(/ class="mj /)).test(mdtext)){
					// do not waste time on typesetting, if there is no mathjax
					resolve();
				}

				var tsstart = performance.now();
				console.log('typesetting...');

				MathJax.Hub.Queue(['Typeset', MathJax.Hub, element[0]]);
				MathJax.Hub.Queue(function(x){
					console.log('typesat in ' + ((performance.now() - tsstart)/1000).toFixed(2) + ' seconds');
					resolve();
				});
		    });
		}
	};
}]);