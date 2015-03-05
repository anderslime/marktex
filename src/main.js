require('../bower_components/ace-builds/src-min-noconflict/ace');
require('../bower_components/ace-builds/src-min-noconflict/theme-chrome.js');
require('../bower_components/ace-builds/src-min-noconflict/mode-markdown.js');
require('jquery');
require('angular');
require('angularsanitize');
require('angularroute');
require('uiace');
window.Showdown = require('showdown');
require('markdown');
require('showdownmathjax');
require('bootstrap');
require('uibootstrap');
require('raf');
require('uilayout');
require('../components/sharejs/text');
require('../components/sharejs/ace');
require('../components/jaxconfig');

var texapp = angular.module('texapp', ['btford.markdown', 'ui.bootstrap', 'ui.layout', 'ui.ace', 'ngRoute']);
module.exports = texapp;

require('../tmp/templates');

texapp.config(['markdownConverterProvider', function (markdownConverterProvider) {
	markdownConverterProvider.config({
		extensions: ['mathjax']
	});
}]);

texapp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    	when('/editor', {
	        templateUrl: 'templates/controllers/editor.html',
	        controller: 'editorController'
    	}).
    	when('/documents', {
	        templateUrl: 'templates/controllers/documentlist.html',
	        controller: 'documentListController'
    	}).
    	otherwise({
        	redirectTo: '/documents'
    	});
}]);

require('./controllers/editor');
require('./controllers/documentlist');

require('./services/mathjax');

require('./directives/texList');
require('./directives/texLoader');
require('./directives/texStateAsHtml');
require('./directives/texMarkdown');

require('./filters/readystate');

var config = require('config');
console.log('MarkTex version: ' + config.gitrev + '\n\n');