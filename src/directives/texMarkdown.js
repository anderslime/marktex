var texapp = require('../main.js');

texapp.directive('texMarkdown', ['$rootScope', '$compile', 'mathjaxservice', 'scrollsyncservice',
						function( $rootScope,   $compile,   mathjaxservice,   scrollsyncservice) {

	return {
		restrict: 'A',
        scope: { 'texMarkdown': '=' },
        templateUrl: 'templates/directives/texMarkdown.html',
        link: function(scope, element, attrs) {

        	//interesting elements
        	scope.$previewDoc = element.find('.document-preview');
			scope.$container = element.find('.document-container');
			scope.$document = element.find('.document');

        	scope.state = 0; //connecting
			scope.document = '';
			scope.docloaded = false;

			//listen for scroll events
			scope.$container.scroll(function(){
				scrollsyncservice.scrollFromDocument(scope.ace, scope.$document);
			});

			//watch for editor changes
			scope.$watch('document', function(newVal, oldVal) {
				var mdtextPromise = mathjaxservice.markdown(newVal);

				mdtextPromise.then(function(mdtext) {
				    scope.$previewDoc.html(mdtext);
			    	var typesetPromise = mathjaxservice.typeset(scope.$previewDoc, mdtext);

			    	//occurs when mathjax completes typesetting the document
			    	typesetPromise.then(function(){
			    		scope.$document.html(scope.$previewDoc.html());
						scrollsyncservice.updateScrollSync(scope.ace, scope.$document, scope.$container);
			    	});
				});
			});
	    },
	    controller: ['$scope', function($scope){
	    	$scope.aceLoaded = function aceLoaded(editor) {
	    		if($scope.texMarkdown.onAceLoaded)
	    			$scope.texMarkdown.onAceLoaded(editor);

	    		$scope.ace = editor;
				editor.setOption('showPrintMargin', false);
				editor.setOption('highlightActiveLine', false);
				editor.setAnimatedScroll(true);

				var $container = $('.document-container');
				var $document = $('.document');

				editor.getSession().on('changeScrollTop', function(s){
					scrollsyncservice.scrollFromEditor(s, editor, $container);
				});

				//fired on page resize, both window and columns
				$scope.onPageResize = function(){
					scrollsyncservice.updateScrollSync(scope.aceEditor, $document, $container, 100);
				};
			};
	    }]
	};
}]);