var texapp = require('../controllers/main.js');

texapp.factory('mathjaxservice', ['$sanitize', 'markdownConverter', '$rootScope', function($sanitize, markdownConverter, $rootScope) {
	var sTimeout, typesetting = false;
	var editorLines = [];
	var docElements = [];
	var docContainer;
	var scrollTimer;
	var pindex = {};

	$rootScope.$on('jax-preprocess', function(e, args){
		MathJax.Hub.Queue(['PreProcess', MathJax.Hub, args[0]]);
	});

	$rootScope.$on('jax-typeset', function(e, args){
		typesetting = true;
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, args[0]]);
		MathJax.Hub.Queue(function(x){
			typesetting = false;
			$rootScope.$broadcast('jax-typeset-done');
		});
	});

	function replaceSlashes(value){
		//adds slash before \#, so we can use hashes in latex syntax
		return value.replace(/\\#/g,'\\\\#');
	}

	function goToByScroll(e){
		if(docContainer === undefined)
			docContainer = $('.document-container');

		var elm = $(docElements[e.index]);
		if(elm[0] !== undefined){
			docContainer.stop();
	    	docContainer.animate({scrollTop: docContainer.scrollTop() + elm.offset().top + e.scrollOffset - 64 }, 'slow');
		}
	}

	function lineStartsWithListToken(line, listmode){
		if(line === undefined)
			return false;

		var r;
		if(listmode)
			r = new RegExp(/^\ {0,}(\*\ )/); // allow indents if already in listmode
		else
			r = new RegExp(/^(\*|-)\ /); // true if list

		return r.test(line);
	}

	function shouldCombineWithPreviousLine(prev, curr){
		if(prev === undefined)
			return true; //first line should have index 0

		var r = new RegExp(/^\ {0,3}(\*\ |#)/); // true if header or list
		var prevIsNotHeaderOrList = !r.test(prev) && !isBlank(prev);
		var prevIsNotBlank = !isBlank(prev);
		var currIsNotHeaderOrList = !r.test(curr) && !isBlank(curr);

		var currIsLink = new RegExp(/^\ {1,3}(\[.+\]):\s/).test(curr);

		if(currIsLink)
			return true;

		if(prevIsNotBlank && currIsNotHeaderOrList)
			return true;
		
		return false;
	}

	function isCodeLine(prev, curr, listmode){
		var r = RegExp(/(^\t|\ {4,})/);

		if(!listmode && r.test(curr)) 		// if current line is indented
			return true;
		if(isBlank(curr) && r.test(prev)) 	//if current line is blank, but prev is indented
			return true;
		return false;
	}

	function isBlank(line){
		return new RegExp(/^\s*$/).test(line);
	}

	return {
		markdown: function(d){
			if(d === undefined || d.length === 0)
				return '';

			//return markdowned html
			return $sanitize(markdownConverter.makeHtml(replaceSlashes(d)));
		},
		updateScrollSync: function(editor, doc){
			if(editor === undefined)
				return;

			//index the document elements
			docElements = [];
			for(var e = 0; e < doc.children().length; e++){
				var tagname = doc.children()[e].tagName;
				if(tagname === 'UL' || tagname === 'OL')
					docElements.push.apply(docElements, $(doc.children()[e]).find('li'));
				else if(tagname === 'PRE')
					docElements.push.apply(docElements, $(doc.children()[e]).find('code'));
				else
					docElements.push(doc.children()[e]);
			}

			//index ace editorlines
			editorLines = editor.getSession().doc.getAllLines();

			var listmode = false;
			var cIsCodeLine = false;
			var li = 0, pli = -1;
			var prevLineBreaks = false;
			var pIsCodeLine = false;
			var p;
			var stack = [];
			for(var i = 0; i < editorLines.length; i++){
				var c = editorLines[i];
				cIsCodeLine = isCodeLine(p, c, listmode);

				if(cIsCodeLine && !pIsCodeLine && !isBlank(c)){				//if beginning code
					li++;
				}else if(cIsCodeLine && pIsCodeLine){ 						//if continuing code
					
				}else if(lineStartsWithListToken(c, listmode)){
					li++;
					listmode = true;
				}else{
					if(isBlank(c)){
						listmode = false; 									//if blank line
						cIsCodeLine = false;
					}else{
						if(!shouldCombineWithPreviousLine(p, c))
							li++; //if 
					}
				}
				pIsCodeLine = cIsCodeLine;
				var lheight = $('.ace_line').first().height();
				editorLines[i] = { value: c.trim(), index: li };
				if(li > pli){
					if(stack.length > 0){
						//calculate height of stack
						var elementHeight = $(docElements[stack[0].index]).outerHeight() / (stack.length);
						for(var s = 0; s < stack.length; s++){
							stack[s].scrollOffset = s * elementHeight;
						}
					}
					stack = [];
					stack.push(editorLines[i]);
				}else
					stack.push(editorLines[i]);

				p = c;
				pli = li;
			}
			this.scroll(0, editor);
		},
		scroll: function(offset, aceEditor){
			var visiblerow = aceEditor.getFirstVisibleRow();
			
			if(editorLines.length <= visiblerow)
				return;

			var e = editorLines[visiblerow];
			var cindex = e.index;
			pindex = cindex;

			if(scrollTimer)
				clearTimeout(scrollTimer);

			scrollTimer = setTimeout(function(){
				goToByScroll(e);
			}, 100);
		}
	};
}]);