(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var Range, applyToShareJS;

  Range = ace.require("ace/range").Range;

  applyToShareJS = function(editorDoc, delta, doc) {
    var getStartOffsetPosition, pos, text;
    getStartOffsetPosition = function(range) {
      var i, line, lines, offset, _len;
      lines = editorDoc.getLines(0, range.start.row);
      offset = 0;
      for (i = 0, _len = lines.length; i < _len; i++) {
        line = lines[i];
        offset += i < range.start.row ? line.length : range.start.column;
      }
      return offset + range.start.row;
    };
    pos = getStartOffsetPosition(delta.range);
    switch (delta.action) {
      case 'insertText':
        doc.insert(pos, delta.text);
        break;
      case 'removeText':
        doc.del(pos, delta.text.length);
        break;
      case 'insertLines':
        text = delta.lines.join('\n') + '\n';
        doc.insert(pos, text);
        break;
      case 'removeLines':
        text = delta.lines.join('\n') + '\n';
        doc.del(pos, text.length);
        break;
      default:
        throw new Error("unknown action: " + delta.action);
    }
  };

  window.sharejs.Doc.prototype.attach_ace = function(editor, keepEditorContents) {
    var check, doc, docListener, editorDoc, editorListener, offsetToPos, suppress;
    if (!this.provides['text']) {
      throw new Error('Only text documents can be attached to ace');
    }
    doc = this;
    editorDoc = editor.getSession().getDocument();
    editorDoc.setNewLineMode('unix');
    check = function() {
      return window.setTimeout(function() {
        var editorText, otText;
        editorText = editorDoc.getValue();
        otText = doc.getText();
        if (editorText !== otText) {
          console.error("Text does not match!");
          console.error("editor: " + editorText);
          return console.error("ot:     " + otText);
        }
      }, 0);
    };
    if (keepEditorContents) {
      doc.del(0, doc.getText().length);
      doc.insert(0, editorDoc.getValue());
    } else {
      editorDoc.setValue(doc.getText());
    }
    check();
    suppress = false;
    editorListener = function(change) {
      if (suppress) return;
      applyToShareJS(editorDoc, change.data, doc);
      return check();
    };
    editorDoc.on('change', editorListener);
    docListener = function(op) {
      suppress = true;
      applyToDoc(editorDoc, op);
      suppress = false;
      return check();
    };
    offsetToPos = function(offset) {
      var line, lines, row, _len;
      lines = editorDoc.getAllLines();
      row = 0;
      for (row = 0, _len = lines.length; row < _len; row++) {
        line = lines[row];
        if (offset <= line.length) break;
        offset -= lines[row].length + 1;
      }
      return {
        row: row,
        column: offset
      };
    };
    doc.on('insert', function(pos, text) {
      suppress = true;
      editorDoc.insert(offsetToPos(pos), text);
      suppress = false;
      return check();
    });
    doc.on('delete', function(pos, text) {
      var range;
      suppress = true;
      range = Range.fromPoints(offsetToPos(pos), offsetToPos(pos + text.length));
      editorDoc.remove(range);
      suppress = false;
      return check();
    });
    doc.detach_ace = function() {
      doc.removeListener('remoteop', docListener);
      editorDoc.removeListener('change', editorListener);
      return delete doc.detach_ace;
    };
  };

}).call(this);

},{}],2:[function(require,module,exports){
var texapp = angular.module('texapp', ['btford.markdown', 'ui.bootstrap', 'ui.layout', 'ui.ace']);

texapp.controller('mainController', ['$scope', 'mathjaxservice', '$sce', '$compile',
							function( $scope,   mathjaxservice,   $sce,   $compile) {

	$scope.color = 'black';

	//defalt state
	$scope.document = '$$line1 \\sqrt{b^2-4ac}$$\n## line2';

	//ace options
	$scope.aceOptions = {
		useWrapMode : true,
		showGutter: false,
		theme:'twilight',
		mode: 'markdown'
	};

	var scaleTimeout;
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

	function wrapTextNodes(e, wrapelm) {
	    e.contents().filter(function() {
		    return this.nodeType === 3 && this.parentNode.nodeName !== 'P';
		}).wrap(wrapelm);

		if(!e.hasClass('mathjax'))
			angular.forEach(e.children(), function(c){
				wrapTextNodes($(c), wrapelm);
			});
	}

	//this will mark states as no longer being dirty, as they were now typeset
	//it will fire another $watch roundtrip, but it will be quickly processed
	//as states are not dirty
	$scope.$on('typeset', function(e, args){
		//for states only markdowned
		if(args){
			args.state.html = args.html;
			args.state.dirty = false;
			return;
		}

		//for states being markdowned and mathjaxed
		angular.forEach($scope.state, function(s){
			var e = $('#' + s.oid);
			if(s.oid !== undefined && e[0] !== undefined){
				wrapTextNodes(e, '<p/>');
				s.html = e[0].outerHTML; // html must contain the full html, now it only holds the jax element
				s.dirty = false;
			}
		});

	});
}]);

module.exports = texapp;
},{}],3:[function(require,module,exports){
var texapp = require('../controllers/main.js');

texapp.directive('texList', [function() {
	return {
	    restrict: 'A',
	    priority: 100,
	    require: 'ngModel',
	    link: function(scope, element, attr, ctrl) {

			var texList = element.attr(attr.$attr.texList) || ', ';
			var trimValues = attr.ngTrim !== 'false';
			var separator = trimValues ? angular.trim(texList) : texList;

			var parse = function(viewValue) {
				var state = scope.$eval(attr.ngModel);

				if (angular.isUndefined(viewValue))
					return;

				var list = [];

				var c = 0;
				var values = viewValue.split(separator);
				var removed = state.length > values.length;
				angular.forEach(values, function(value) {

					// horrible code, only here as proof of concept. merges very incorrect
					if (!angular.isUndefined(value) && !angular.isUndefined(state[c])){
						//line was updated
						if(state[c].text !== value){
							state[c] = {
								text: trimValues ? trim(value) : value,
								html: '',
								dirty: true
							};
							if(state[c].text === '')
								state[c].text = '<br />';
						}
						c++;
					}
					else if (value && !state[c] && !removed){
						//line was added
						state.splice(c, 0, {
								text: trimValues ? trim(value) : value,
								html: '',
								dirty: true
							});
						c++;
					}
					else if (value && removed){
						//line was removed
						state[c] = undefined;
					}
				});

				if(c < state.length)
					for(c; c < state.length; c++)
						delete state[c];
				
				return state;
			};

			ctrl.$parsers.push(parse);
			ctrl.$formatters.push(function(value) {
				if (angular.isArray(value)) {
					return value.map(function(x){
						return x.text;
					}).join('\n');
				}

				return undefined;
			});

			// Override the standard $isEmpty because an empty array means the input is empty.
			ctrl.$isEmpty = function(value) {
				return !value || !value.length;
			};
		}
	};
}]);
},{"../controllers/main.js":2}],4:[function(require,module,exports){
var texapp = require('../controllers/main.js');

texapp.directive('texLoader', ['$compile', '$templateCache', '$http', function($compile, $templateCache, $http) {
	return {
		restrict: "A",
		transclude: true,
   		replace: true,
        scope: { 'texLoader': '=' },
        templateUrl: '/templates/texLoader.html'
	};
}]);
},{"../controllers/main.js":2}],5:[function(require,module,exports){
var texapp = require('../controllers/main.js');

texapp.directive('texMarkdown', ['$compile', 'mathjaxservice', function($compile, mathjaxservice) {
	return {
		restrict: "A",
        scope: { 'texMarkdown': '=' },
        link: function(scope, element, attrs) {
			scope.$watch('texMarkdown', function(newVal, oldVal) {
				element.html(mathjaxservice.typeset(newVal));
			    $compile(element.contents())(scope);
			});
	    }
	};
}]);
},{"../controllers/main.js":2}],6:[function(require,module,exports){
var texapp = require('../controllers/main.js');

texapp.directive('texStateAsHtml', ['$compile', 'mathjaxservice', function($compile, mathjaxservice) {

	function stateAsHtml(state){
		return state.map(function(val, i) {
			if(val != undefined){
				if(val.dirty)
					return mathjaxservice.typeset(val, i);
				return val.html;
			}
		}).join('');
	}

	return {
		restrict: "A",
        scope: { 'texStateAsHtml': '=' },
		link: function(scope, element, attrs) {
			var time;
			scope.$watch('texStateAsHtml', function(state, oldstate) {

				if(state.every(function(k){ return !k.dirty }))
					return;

				if(time)
					clearTimeout(time);

				time = setTimeout(function(){
					console.log('watch change!');
					var elements = stateAsHtml(state);
					elements = elements.replace(new RegExp('ng-transclude', 'g'), '');
			        element.html(elements);
			        $compile(element.contents())(scope);
				}, 100);
				
			}, true);
	    }
	};
}]);
},{"../controllers/main.js":2}],7:[function(require,module,exports){
var sharejsace = require('./components/sharejs/ace.js');

var main = require('./controllers/main.js');
var mathjaxservice = require('./services/mathjax.js');

var texlist = require('./directives/texList.js');
var texloader = require('./directives/texLoader.js');
var texstateashtml = require('./directives/texStateAsHtml.js');
var texmarkdown = require('./directives/texMarkdown.js');
},{"./components/sharejs/ace.js":1,"./controllers/main.js":2,"./directives/texList.js":3,"./directives/texLoader.js":4,"./directives/texMarkdown.js":5,"./directives/texStateAsHtml.js":6,"./services/mathjax.js":8}],8:[function(require,module,exports){
var texapp = require('../controllers/main.js');

texapp.factory('mathjaxservice', ['$sanitize', 'markdownConverter', '$rootScope', function($sanitize, markdownConverter, $rootScope) {
	var page = angular.element('.page');
	var body = angular.element('body');
	var toolbox = angular.element('.toolbox');
	var splitbar = angular.element('.ui-splitbar');
	var scale = false;
	var scaled = false;
	var sTimeout;
	$rootScope.typesetting = true;

	//signal to mathjax that we are interested in hearing everything it does
	MathJax.Hub.signal.Interest(function (message) {
		//maintain a scope property for typesetting state
		if(message.indexOf('Begin PreProcess') > -1)
			$rootScope.typesetting = true;
		if(message.indexOf('End Process') > -1){
			$rootScope.typesetting = false;
			//apply, as this is outside angular cycle
			$rootScope.$broadcast('typeset');
			$rootScope.$apply();
		}
	});

	function replaceSlashes(value){
		//adds slash before \#, so we can use hashes in latex syntax
		return value.replace(/\\#/g,'\\\\#');
	}

	function guid() {
		//generates something of the form of a guid, but is technically not.
    	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); });
    }

    function wrapTextNodes(e, wrapelm) {
	    e.contents().filter(function() {
		    return this.nodeType === 3;
		}).wrap(wrapelm);
		angular.forEach(e.children(), function(c){
			wrapTextNodes($(c), wrapelm);
		});
	}

    function postprocessMathJaxState(html){
    	var e = $(html)
		var oid = guid(); // id of outer element
		var iid = $(html).find('.mathjax').attr('href'); // id of inner element, the one with the jax

		//put the id on the outer div of the html returned from markdownConverter. also, put a scope variable
		//that allows for dirty tracking in loader directive. this will allow for toggling the loading animation
		//html = html.replace('><div ', '><div ');
		//put another id on the inner div, this is used for mathjax typeset tracking
		html = '<div id="' + oid + '" class="mathjax-wrapper">' + html + '</div>';
		html = html.replace(new RegExp('href', 'g'), 'id');

		//we should have some logic for reprocessing, as a full typeset might be too expensive. maybe.
		if(e.find('.MathJax_Preview')[0]){
			console.log('reprocessing');
			//MathJax.Hub.Queue(['Reprocess', MathJax.Hub, id]);
		}
		else{
			//debounce the typesetting. mathjax handles throttling badly.
			if(sTimeout)
				clearTimeout(sTimeout);

			sTimeout = setTimeout(function(){
				console.log('typesetting');
				
				//inform mathjax to typeset the element with id = iid
				MathJax.Hub.Queue(['Typeset', MathJax.Hub, iid]);
			}, 200);
		}
		return html;
    }

	function typeset(d){
		if(d == undefined || d.length === 0)
			return '';

		//get markdowned value
		var html = d == undefined ? "" : $sanitize(markdownConverter.makeHtml(replaceSlashes(d)));

		//if markdowned value contains the class mathjax, we know we have to deal with something that must be jaxxed.
		//several ugly hacks will be made here, like manipulating html manually and so on. this is because it is
		//impossible to control what comes back from the markdownConverter, except for classes and href's
		if(html.indexOf('><div class="mathjax ') >= 0)
			html = postprocessMathJaxState(html);
		else
			$rootScope.$broadcast('typeset');

		return html;
	}

	return {
		typeset: function(d){
			return typeset(d);
		},
		updateZoom: function(){
			var zoom = (body.width() - toolbox.width() - splitbar.width()) / page.outerWidth();
			page.css('zoom', zoom);
		}
	};
}]);
},{"../controllers/main.js":2}]},{},[7]);
