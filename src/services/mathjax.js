var texapp = require('../controllers/main.js');

texapp.factory('mathjaxservice', ['$sanitize', 'markdownConverter', '$rootScope', function($sanitize, markdownConverter, $rootScope) {
	var sTimeout, typesetting = false;
	var editorLines = [];
	var docElements = [];
	var docContainer;
	var scrollTimer;
	var pindex = {};
	var docHeight = 0, editorHeight = 0;
	var editorScrolling = false, docScrolling = false;
	var topScrollMargin = 64;

	$rootScope.$on('jax-preprocess', function(e, args){
		MathJax.Hub.Queue(['PreProcess', MathJax.Hub, args[0]]);
	});

	$rootScope.$on('jax-typeset', function(e, args){
		typesetting = true;
		if(!(new RegExp(/p class="mj /)).test(args.mdtext)){
			// do not waste time on typesetting, if there is no mathjax
			$rootScope.$broadcast('jax-typeset-done');
			return;
		}

		MathJax.Hub.Queue(['Typeset', MathJax.Hub, args.pdoc[0]]);
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
			docContainer.stop(true);
	    	docContainer.animate({
	    		scrollTop: docContainer.scrollTop() + elm.offset().top + e.scrollOffset - topScrollMargin
	    	},{ 
	    		queue: false,
	    		duration: 200
	    	});
		}
	}

	function lineStartsWithListToken(line, listmode){
		if(line === undefined)
			return false;

		if(listmode)
			return new RegExp(/^\ {0,}(\*\ )/).test(line); // allow indents if already in listmode
		else
			return new RegExp(/^(\*|-)\ /).test(line); // true if list
	}

	function lineStartsOrEndsWithJaxToken(line, jaxmode){
		if(line === undefined)
			return false;

		if(jaxmode)
			return new RegExp(/\$\$$/).test(line); // true if jax ending
		else
			return new RegExp(/^\$\$/).test(line); // true if jax starting
	}

	function lineStartsAndEndsWithJaxToken(line){
		if(line === undefined)
			return false;
		return new RegExp(/^\$\$(.*)\$\$$/).test(line); // true if jax starting and ending
	}

	function shouldCombineWithPreviousLine(prev, curr){
		if(prev === undefined)
			return true; //first line should have index 0

		var r = new RegExp(/^\ {0,3}(\*\ |#|\$\$)/); // true if header or list or jax
		var prevIsNotHeaderOrList = !r.test(prev) && !isBlank(prev);
		var prevIsNotBlank = !isBlank(prev);
		var currIsNotHeaderOrListOrJax = !r.test(curr) && !isBlank(curr);

		var currIsLink = new RegExp(/^\ {1,3}(\[.+\]):\s/).test(curr);

		if(currIsLink)
			return true;

		if(prevIsNotBlank && currIsNotHeaderOrListOrJax)
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

	function isElementInViewport (el) {
	    var rect = el.getBoundingClientRect();
	    rect.bottom = rect.top + $(el).outerHeight(true); // consider margin also
	    return (
	    	rect.bottom >= topScrollMargin &&
	        rect.top >= 0 &&
	        rect.left >= 0 &&
	        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
	        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	    );
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
				return; // if the editor is not yet ready, but an index was requested

			//check that height of both document and editor has changed, before (re)indexing
			//this delays a reindex until strictly necessary
			var eh = $('.ace_scrollbar-inner').height();
			var dh = $('.document').height();
			if(editorHeight === eh && docHeight === dh)
				return; // no height was changed

			editorHeight = eh;
			docHeight = dh;

			//performance logging
			var start = performance.now();
			console.log('indexing scroll...');
			
			//index document elements
			//this will find all elements that can be scrolled to
			//some elements will be unwrapped, like lists or code. for more fine grained
			//scroll experience, other elements could be unwrapped if desired, otherwise
			//it will fall back to the outermost element.
			docElements = [];
			var skipNextP = false;
			for(var e = 0; e < doc.children().length; e++){
				var tagname = doc.children()[e].tagName;
				var classnames = doc.children()[e].className;

				if(skipNextP && tagname === 'P'){
					skipNextP = false;
					continue;
				}

				if(tagname === 'UL' || tagname === 'OL')
					docElements.push.apply(docElements, $(doc.children()[e]).find('li'));
				else if(tagname === 'PRE')
					docElements.push.apply(docElements, $(doc.children()[e]).find('code'));
				else if(tagname === 'SCRIPT'){
					skipNextP = true; 	// mathjax inserts nasty paragraphs after equations
				}else if(tagname === 'DIV' && classnames.indexOf('MathJax_Display') > -1){
					docElements.pop();  // mathjax inserts nasty paragraphs before equations
					docElements.push(doc.children()[e]);
				}else if(tagname === 'SPAN' && classnames.indexOf('mj loader') > -1){
					skipNextP = true; 	//skip more nasty mathjax elements
				}
				else
					docElements.push(doc.children()[e]);
			}

			//index ace editorlines
			//this will validate each line in the editor, to see if it maps to an actual
			//element in the document - or if it is just meta info.
			//all meta info will be mapped to the previous line that mapped to an element
			//all lines are considered, this runs in O(n) time
			editorLines = editor.getSession().doc.getAllLines();
			var p, listmode = false, jaxmode = false, cIsCodeLine = false, li = 0, pli = -1, prevLineBreaks = false, pIsCodeLine = false, stack = [];
			for(var i = 0; i < editorLines.length; i++){
				var c = editorLines[i];										//c is current line, p is previous
				cIsCodeLine = isCodeLine(p, c, listmode);					//check if current line is a code block

				if(cIsCodeLine && !pIsCodeLine && !isBlank(c)){				//if beginning code block
					li++;													//beginning a code block maps to an element
				}else if(cIsCodeLine && pIsCodeLine){ 						//if continuing code block
																			//continuing a code block does not map to an element
				}else if(lineStartsOrEndsWithJaxToken(c, jaxmode)){			//check if line is starting/ending jax block
					if(!jaxmode)
						li++;
					if(!lineStartsAndEndsWithJaxToken(c))
						jaxmode = !jaxmode;
				}else if (jaxmode){
				}else if(lineStartsWithListToken(c, listmode)){				//check if line is a list
					li++;													//we can map each list item to an element
					listmode = true;
				}else{
					if(isBlank(c)){											//blank lines do not map to elements
						listmode = false; 									
						cIsCodeLine = false;
					}else{
						if(!shouldCombineWithPreviousLine(p, c))			//make sure that line breaks in the editor, that does not
							li++;											//break in the document, are not mapped to elements
					}
				}
				pIsCodeLine = cIsCodeLine;									//insert object with mapping between editor line and document element
				editorLines[i] = { index: li, editorIndex: i, element: docElements[li]/*, value: editorLines[i]*/ };
				if(li > pli){												//if we mapped to a new element, we want to !guess! a scroll position
					if(stack.length > 0){									//for all lines grouped into the previous element.
						//get the height of the element that the last group maps to. Divide this height by the group size.
						//this makes all lines that did not map to anything, to scroll by a percentage
						var elementHeight = $(docElements[stack[0].index]).outerHeight() / (stack.length);
						for(var s = 0; s < stack.length; s++)
							stack[s].scrollOffset = s * elementHeight;
					}
					stack = [];
					stack.push(editorLines[i]);
				}else
					stack.push(editorLines[i]);

				p = c;
				pli = li;
			}

			//console.log(editorLines.map(function(e){ return e. index + ' ' + e.value; }).join('\n'));

			//scroll to editor position after an index
			this.scrollFromEditor(0, editor);
			console.log('scroll indexed in ' + ((performance.now() - start)/1000).toFixed(2) + ' seconds');
		},
		scrollFromEditor: function(offset, aceEditor){
			if((performance.now() - docScrolling) < 1000)
				return;
			editorScrolling = performance.now();

			var visiblerow = aceEditor.getFirstVisibleRow();
			if(editorLines.length <= visiblerow)
				return; // this will happen if scroll was invoked before scrolling was indexed

			//debounce
			if(scrollTimer)
				clearTimeout(scrollTimer);
			scrollTimer = setTimeout(function(){
				goToByScroll(editorLines[visiblerow]);
			}, 10);
		},
		scrollFromDocument: function(aceEditor){
			if((performance.now() - editorScrolling) < 1000)
				return;
			docScrolling = performance.now();

			//debounce
			if(scrollTimer)
				clearTimeout(scrollTimer);
			scrollTimer = setTimeout(function(){
				var elementsInViewport = $('.document').children().filter(function(i, c){ return isElementInViewport(c); });
				
				if(elementsInViewport.length === 0)
					return;
				
				var matchingEditorLines = editorLines.filter(function(c){
					return c.element === elementsInViewport[0];
				});
				
				if(matchingEditorLines.length === 0)
					return;

				var i = matchingEditorLines[0].editorIndex;
				aceEditor.setAnimatedScroll(true);
				aceEditor.scrollToLine(i, false, true, function(){});
				//todo, scroll to specific line, not just the first

			}, 10);
		}
	};
}]);