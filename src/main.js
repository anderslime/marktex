var config = require('config');

function requireDependencies(){
	require('../bower_components/ace-builds/src-min-noconflict/ace');
	require('../bower_components/ace-builds/src-min-noconflict/theme-chrome.js');
	require('../bower_components/ace-builds/src-min-noconflict/mode-markdown.js');
	require('jquery');
	require('angular');
	require('angularsanitize');
	require('angularroute');
	require('angularanimate');
	require('angularcookies');
	require('moment');
	require('angular-moment');
	require('uiselect');
	require('uiace');
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
}

function bootstrapAngularApp(){
	var texapp = angular.module('texapp', [
		'btford.markdown',
		'ui.bootstrap',
		'ui.layout',
		'ui.ace',
		'ngRoute',
		'ngAnimate',
		'ngFacebook',
		'ngCookies',
		'ui.select',
		'angularMoment'
	]);

	module.exports = texapp;

	require('../tmp/templates');

	texapp.config(['markdownConverterProvider', function (markdownConverterProvider) {
		markdownConverterProvider.config({
			extensions: ['mathjax']
		});
	}]);

	texapp.config(['$facebookProvider', function (facebookProvider) {
		facebookProvider.setAppId(config.facebook.appID);
		facebookProvider.setVersion('v2.2');
		facebookProvider.setPermissions('email,user_friends');
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
			when('/editor/:docId?/:docName?', {
				templateUrl: 'templates/controllers/editor.html',
				controller: 'editorController',
				title: 'Write',
				url: '/editor',
				authorization: false
			}).
			when('/documents', {
				templateUrl: 'templates/controllers/documentlist.html',
				controller: 'documentListController',
				title: 'Documents',
				url: '/documents',
				authorization: true
			}).
			otherwise({
				redirectTo: '/editor'
			});

		$locationProvider.html5Mode(true);

		console.log('MarkTex version: ' + config.gitrev + '\n\n');
		//disable logging if desired
		if(!config.logging){
			(function () {
				console.log = function () {
					//if(config.persistentLogging)
					//	$http.post(config.urls.logging, { text: text, obj: obj });
				};
			}());
		}
	}]);
}

function requireAngularAppDependencies(){
	require('./controllers/editor');
	require('./controllers/documentlist');

	require('./services/mathjax');
	require('./services/scrollsync');
	require('./services/user');
	require('./services/document');
	require('./services/notification');

	require('./directives/texMenu');
	require('./directives/texLoader');
	require('./directives/texMarkdown');
	require('./directives/texFacebook');
	require('./directives/texNotification');
	require('./directives/texShareDoc');

	require('./filters/readystate');
	require('./filters/withoutselfifcreator');
}

requireDependencies();
bootstrapAngularApp();
requireAngularAppDependencies();
