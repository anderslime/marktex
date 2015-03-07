require('../bower_components/ace-builds/src-min-noconflict/ace');
require('../bower_components/ace-builds/src-min-noconflict/theme-chrome.js');
require('../bower_components/ace-builds/src-min-noconflict/mode-markdown.js');
require('jquery');
require('angular');
require('angularsanitize');
require('angularroute');
require('angularanimate');
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

var texapp = angular.module('texapp', ['btford.markdown', 'ui.bootstrap', 'ui.layout', 'ui.ace', 'ngRoute', 'ngAnimate']);
module.exports = texapp;

require('../tmp/templates');

texapp.config(['markdownConverterProvider', function (markdownConverterProvider) {
	markdownConverterProvider.config({
		extensions: ['mathjax']
	});
}]);

texapp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
    	when('/editor/:docId?', {
            templateUrl: 'templates/controllers/editor.html',
            controller: 'editorController',
            title: 'Write',
            url: '/editor'
        }).
    	when('/documents', {
	        templateUrl: 'templates/controllers/documentlist.html',
	        controller: 'documentListController',
            title: 'Documents',
            url: '/documents'
    	}).
    	otherwise({
        	redirectTo: '/editor'
    	});

    $locationProvider.html5Mode(true);
}]);

require('./controllers/editor');
require('./controllers/documentlist');

require('./services/debounce');
require('./services/mathjax');
require('./services/scrollsync');

require('./directives/texMenu');
require('./directives/texLoader');
require('./directives/texMarkdown');

require('./filters/readystate');

var config = require('config');
console.log('MarkTex version: ' + config.gitrev + '\n\n');

//disable logging if desired
if(!config.logging){
    (function () {
        var log = console.log;
        console.log = function () {
            //void
        };
    }());
}
