var texapp = angular.module('texapp', ['btford.markdown', 'ui.bootstrap', 'ui.layout', 'ui.ace', 'ngRoute']);

texapp.config(['markdownConverterProvider', function (markdownConverterProvider) {
	markdownConverterProvider.config({
		extensions: ['mathjax']
	});
}]);

texapp.controller('mainController', ['$scope', 'mathjaxservice', '$sce', '$compile', '$routeParams',
							function( $scope,   mathjaxservice,   $sce,   $compile,   $routeParams) {

	$scope.state = 0; //connecting
	$scope.color = 'white';
	$scope.document = '';
	$scope.docloaded = false;

	var scaleTimeout;
	var config = require('../config.dev.js');
	var BCSocket = require('../../components/sharejs/channel/bcsocket.js').BCSocket;
	var sharejs = require('sharejs');
	var socket = new BCSocket(config.serverurl, { reconnect: true });
	var sjs = new sharejs.Connection(socket);
	var documentLine = 0;
	var aceEditor, aceSession, scrollTimer, doc = $('.document'), docContainer = $('.document-container');

	//listen to sharejs socket state changes
	function socketStateChanged(doc){
		$scope.state = (!$scope.docloaded ? 0 : sjs.socket.readyState);
		$scope.pendingdata = ((!$scope.docloaded || doc === undefined) ? false : (doc.pendingData.length > 0 && sjs.socket.readyState !== 1)) ? 'You have unsynchronized changes to this document!' : '';
		$scope.$apply();
	}

	function goToByScroll(elm){
		if(elm !== undefined)
	    	docContainer.animate({scrollTop: docContainer.scrollTop() + elm.offset().top - 64 }, 'slow');
	}

	function onAceScroll() {
		if(scrollTimer)
			clearTimeout(scrollTimer);

		if(aceEditor === undefined || aceSession === undefined)
			return;

		scrollTimer = setTimeout(function(){
			var firstVisibleLine = aceEditor.getFirstVisibleRow();
			if(firstVisibleLine === documentLine)
				return;

			documentLine = firstVisibleLine;

			var editorLines = aceSession.doc.getAllLines();
			var token = ' $$$ ';

			function lineStartsWithListToken(line, listmode){
				if(line === undefined)
					return false;

				var r;
				if(listmode)
					r = new RegExp(/^\ {0,}(\*\ )/); // allow indents if already in listmode
				else
					r = new RegExp(/^\*\ /); // true if list

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

			var listmode = false;
			var cIsCodeLine = false;
			var lastLineWithElement = 0;
			var prevLineBreaks = false;
			var pIsCodeLine = false;
			var p;
			for(var i = 0; i < editorLines.length; i++){
				var c = editorLines[i];
				cIsCodeLine = isCodeLine(p, c, listmode);

				if(cIsCodeLine && !pIsCodeLine && !isBlank(c)){				//if beginning code
					lastLineWithElement++;
				}else if(cIsCodeLine && pIsCodeLine){ 						//if continuing code
					
				}else if(lineStartsWithListToken(c, listmode)){
					lastLineWithElement++;
					listmode = true;
				}else{
					if(isBlank(c)){
						listmode = false; 							//if blank line
						cIsCodeLine = false;
					}else{
						if(!shouldCombineWithPreviousLine(p, c))
							lastLineWithElement++; //if 
					}
				}
				pIsCodeLine = cIsCodeLine;
				editorLines[i] = { value: c.trim(), index: lastLineWithElement };
				p = c;
			}

			console.log(editorLines.map(function(o){return o.index + ' ' + o.value; }).join('\n'));

			/*editorLines[firstVisibleLine] += token;
			token = editorLines[firstVisibleLine];

			editorLines = editorLines.join('\n');

			editorLines = editorLines.replace(/(^\s*\n)|(\ {0,3}\[.+\]:\s.*\n)|(((?!\ |\t|>\])\n(?!\n|\ |\*|\t|\#|<|[0-9]\.\s)))/gm,'');
			editorLines = editorLines.replace(/((\ {4,}|\t).+\n{1,2})+/g,'code\n');

			editorLines = editorLines.split('\n');

			var visibleIndexInDocument = -1;
			for(i = 0; i < editorLines.length; i++){
				if(editorLines[i].indexOf(token) > -1)
				{
					visibleIndexInDocument = i;
					break;
				}
			}*/

			
			var docElements = [];
			for(var e = 0; e < doc.children().length; e++){
				var tagname = doc.children()[e].tagName;
				if(tagname === 'UL' || tagname === 'OL')
					docElements.push.apply(docElements, $(doc.children()[e]).find('li'));
				else if(tagname === 'PRE')
					docElements.push.apply(docElements, $(doc.children()[e]).find('code'));
				else
					docElements.push(doc.children()[e]);
			}

			goToByScroll($(docElements[editorLines[documentLine].index]));

			//console.log('matching: ' + editorLines[visibleIndexInDocument] + '\nto:' + $(docElements[visibleIndexInDocument]).text().replace(/\n/g,'') + '\n\n');
		}, 100);
		
	}

	//occurs when ace editor is loaded. will initialize a document afterwards
	var aceLoaded = function(_editor) {
		aceEditor = _editor;
		aceSession = _editor.getSession();
		aceSession.on('changeScrollTop', function(){ onAceScroll(_editor); });
		aceSession.on('change', function(){


		});

		_editor.setOption("showPrintMargin", false);
		_editor.setOption("highlightActiveLine", false);
		var docname = document.location.href.substring(document.location.href.indexOf('#/') + 2);
		var doc = sjs.get('docs', docname);
		
		doc.connection.on('connected', function(){
			socketStateChanged(doc);
		});
		doc.connection.on('open', function(){
			socketStateChanged(doc);
		});
		doc.connection.on('close', function(){
			socketStateChanged(doc);
		});
		doc.connection.on('error', function(){
			socketStateChanged(doc);
		});

		//note that the connection state will remain 'connecting' at least until this method has fired
		doc.whenReady(function() {
			$scope.docloaded = true;
			if (!doc.type)
				doc.create('text');

			doc.attach_ace(_editor);
			socketStateChanged();
		});

		doc.subscribe();
	};

	//ace options
	$scope.aceOptions = {
		useWrapMode : true,
		showGutter: false,
		theme:'chrome',
		mode: 'markdown',
		highlightActiveLine: false,
  		onLoad: aceLoaded
	};

	var specialElementHandlers = {
	    '.toolbox': function (element, renderer) {
	        return true;
	    }
	};

	//fired on page resize, both window and columns
	//updates zoom ratio and typesets afterwards
	$scope.onPageResize = function(){
		mathjaxservice.updateZoom();
		mathjaxservice.typeset($scope.expression, 300);
	};

	//controls black/white theme by inverting colors
	$scope.toggleColors = function(){
		$scope.color = ($scope.color === 'white' ? 'black' : 'white');
	};

}]);

module.exports = texapp;