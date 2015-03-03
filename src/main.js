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
//require('showdownlinebreak');
require('bootstrap');
require('uibootstrap');
require('raf');
require('uilayout');
require('../components/sharejs/text');
require('../components/sharejs/ace');
require('../components/jaxconfig');

require('./controllers/main');
require('./services/mathjax');
require('./directives/texList');
require('./directives/texLoader');
require('./directives/texStateAsHtml');
require('./directives/texMarkdown');
require('./filters/readystate');