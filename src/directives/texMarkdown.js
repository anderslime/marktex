var texapp = require('../main.js');

texapp.directive('texMarkdown', ['$rootScope', '$compile', 'typesettingservice', 'scrollsyncservice',
						function( $rootScope,   $compile,   typesettingservice,   scrollsyncservice) {

	return {
		restrict: 'A',
        scope: { 'texMarkdown': '='},
        templateUrl: 'templates/directives/texMarkdown.html',
        link: function(scope, element) {

        	//interesting elements
        	scope.$previewDoc = element.find('.document-preview');
			scope.$container = element.find('.document-container');
			scope.$document = element.find('.document');

        	scope.state = 0; //connecting

			//listen for scroll events
			scope.$container.scroll(function(){
				scrollsyncservice.scrollFromDocument(scope.ace, scope.$document);
			});

			//watch for editor changes
			scope.$watch('document', function(newVal) {
				if(newVal === undefined)
					return;
				
				var mdtextPromise = typesettingservice.markdown(newVal);

				mdtextPromise.then(function(mdtext) {
				    //scope.$previewDoc.html(mdtext);
			    	//var typesetPromise = typesettingservice.typeset(scope.$previewDoc, mdtext);

			    	//occurs when mathjax completes typesetting the document
			    	//typesetPromise.then(function(){
			    	var r = /\$\$([^\$]+?[^\$])\$\$/;
			    	var match = r.exec(mdtext);
			    	var math;
					while (match !== null) {
						try{
							math = window.katex.renderToString(match[1], { displayMode: true, throwOnError: false, errorColor: '#ff0000' });
						}catch(err){
							math = '<span class="matherror">math err</span>';
						}
						mdtext = mdtext.replace(match[0], math);
					    match = r.exec(mdtext);
					}

			    	r = /(^|[^\$\d\w;:\-_æøå<>!]?)\$([^\$]+?[^\$])\$($|[^\$\d\w;:\-_æøå<>!]?)/;
			    	match = r.exec(mdtext);
					while (match !== null) {
						try{
							math = window.katex.renderToString(match[2], { throwOnError: false, errorColor: '#ff0000' });
						}catch(err){
							math = '<span class="matherror">math err</span>';
						}
						mdtext = mdtext.replace(match[0], ' ' + math + ' ');
					    match = r.exec(mdtext);
					}

		    		scope.$document.html(mdtext);
		    		//scope.$document.html(scope.$previewDoc.html());
					scrollsyncservice.updateScrollSync(scope.ace, scope.$document, scope.$container);
			    //	});
				});
			});
	    },
	    controller: ['$scope', function($scope){
	    	var $container = $('.document-container');
			var $document = $('.document');

			//fired on page resize, both window and columns
			$scope.onPageResize = function(){
				scrollsyncservice.updateScrollSync($scope.ace, $document, $container, 100);
			};

	    	$scope.aceLoaded = function aceLoaded(editor) {
	    		if($scope.texMarkdown.onAceLoaded)
	    			$scope.texMarkdown.onAceLoaded(editor);

	    		$scope.ace = editor;
				editor.setOption('showPrintMargin', false);
				editor.setOption('highlightActiveLine', false);
				editor.setAnimatedScroll(true);
				editor.getSession().on('changeScrollTop', function(s){
					scrollsyncservice.scrollFromEditor(s, editor, $container);
				});
			};
	    }]
	};
}]);