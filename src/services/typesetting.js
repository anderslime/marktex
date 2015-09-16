var texapp = require('../main.js');

texapp.factory('typesettingservice', ['$q', '$sanitize', 'markdownConverter',
						function(  $q,   $sanitize,   markdownConverter) {

	function replaceSlashes(value){
		if(value === undefined)
			return '';
		//adds slash before \#, so we can use hashes in latex syntax
		return value.replace(/\\#/g,'\\\\#');
	}

	function markdown(text){				
		var mdstart = (new Date()).getTime();
		console.log('markdowning...');

		var mdtext = $sanitize(markdownConverter.makeHtml(replaceSlashes(text)));

		console.log('markdowned in ' + (((new Date()).getTime() - mdstart)/1000).toFixed(2) + ' seconds');
		
		return mdtext;
	}

	var mdDef;
	var kDef;
	var lastMarkdownTime;
	return {
		markdown: function(text, imm){
			var deferred = $q.defer();

			var immediate = imm || false;
			if(text === undefined || text.length === 0 || (new Date() - lastMarkdownTime) > 700)
				immediate = true;

			if(mdDef)
				clearTimeout(mdDef);

			mdDef = setTimeout(function(){
				lastMarkdownTime = new Date();
				deferred.resolve(markdown(text));
			}, immediate ? 0 : 100);

			return deferred.promise;
		},
		katex: function(text, imm){
			var deferred = $q.defer();

			var immediate = imm || false;
			if(text === undefined || text.length === 0 || (new Date() - lastMarkdownTime) > 700)
				immediate = true;

			if(kDef)
				clearTimeout(kDef);

			kDef = setTimeout(function(){
				lastMarkdownTime = new Date();
				deferred.resolve(window.katex.renderToString(text));
			}, immediate ? 0 : 100);

			return deferred.promise;
		},
		typeset: function(element, mdtext){
			return $q(function(resolve) {
				if(!(new RegExp(/ class="mj /)).test(mdtext)){
					// do not waste time on typesetting, if there is no mathjax
					resolve();
				}

				var tsstart = (new Date()).getTime();
				console.log('typesetting...');

				MathJax.Hub.Queue(['Typeset', MathJax.Hub, element[0]]);
				MathJax.Hub.Queue(function(){
					console.log('typesat in ' + (((new Date()).getTime() - tsstart)/1000).toFixed(2) + ' seconds');
					resolve();
				});
		    });
		}
	};
}]);