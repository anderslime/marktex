require('../bower_components/ace-builds/src-min-noconflict/ace');
require('../bower_components/ace-builds/src-min-noconflict/theme-chrome.js');
require('../bower_components/ace-builds/src-min-noconflict/mode-markdown.js');
require('jquery');
require('angular');
require('angularsanitize');
require('angularroute');
require('angularanimate');
require('uiace');
//require('katex');
window.Showdown = require('showdown');
require('markdown');
require('showdownmathjax');
require('bootstrap');
require('uibootstrap');
require('raf');
require('uilayout');
require('ngFacebook');
require('../components/sharejs/text');
require('../components/sharejs/ace');
require('../components/jaxconfig');

var texapp = angular.module('texapp', ['btford.markdown', 'ui.bootstrap', 'ui.layout', 'ui.ace', 'ngRoute', 'ngAnimate', 'ngFacebook']);
module.exports = texapp;

require('../tmp/templates');

var config = require('config');
texapp.config(['markdownConverterProvider', function (markdownConverterProvider) {
	markdownConverterProvider.config({
		extensions: ['mathjax']
	});
}]);

texapp.config(['$facebookProvider', function (facebookProvider) {
	facebookProvider.setAppId(config.facebook.appID);
	facebookProvider.setAppId('878282388901735');
	facebookProvider.setVersion('v2.2');
	facebookProvider.setPermissions("email");
}]).run(function() {
	(function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];

		if (d.getElementById(id))
			return;
		js = d.createElement(s); js.id = id;
		js.src = '//connect.facebook.net/en_US/sdk.js';
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
});

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

require('./services/mathjax');
require('./services/scrollsync');

require('./directives/texMenu');
require('./directives/texLoader');
require('./directives/texMarkdown');
require('./directives/texFacebook');

require('./filters/readystate');

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
