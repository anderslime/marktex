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
require('ngFacebook');
require('../components/sharejs/text');
require('../components/sharejs/ace');
require('../components/jaxconfig');

var texapp = angular.module('texapp', ['btford.markdown', 'ui.bootstrap', 'ui.layout', 'ui.ace', 'ngRoute', 'ngFacebook']);
module.exports = texapp;

require('../tmp/templates');

texapp.config(['markdownConverterProvider', function (markdownConverterProvider) {
	markdownConverterProvider.config({
		extensions: ['mathjax']
	});
}]);

texapp.config(['$facebookProvider', function (facebookProvider) {
  var config = require('config');
  facebookProvider.setAppId(config.facebook.appID);
  facebookProvider.setAppId('878282388901735');
  facebookProvider.setVersion('v2.2');
  facebookProvider.setPermissions("email");
}]).run(function() {
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
});



texapp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
    	when('/editor/:docId?', {
	        templateUrl: 'templates/controllers/editor.html',
	        controller: 'editorController'
    	}).
    	when('/documents', {
	        templateUrl: 'templates/controllers/documentlist.html',
	        controller: 'documentListController'
    	}).
    	otherwise({
        	redirectTo: '/editor'
    	});

    $locationProvider.html5Mode(true);
}]);

require('./controllers/editor');
require('./controllers/documentlist');

require('./services/mathjax');

require('./directives/texList');
require('./directives/texLoader');
require('./directives/texStateAsHtml');
require('./directives/texMarkdown');

var config = require('config');
console.log('MarkTex version: ' + config.gitrev + '\n\n');
