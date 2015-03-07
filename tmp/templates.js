angular.module('texapp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/controllers/documentlist.html',
    "<div>\n" +
    "\t<h1>Show me all the documents!</h1>\n" +
    "\t<img src=\"https://imgflip.com/readImage?iid=61533\"  style=\"position: absolute; bottom: 0; right: 0;\"/>\n" +
    "</div>"
  );


  $templateCache.put('templates/controllers/editor.html',
    "<div class=\"editor\">\n" +
    "\t<div tex-markdown=\"tmOptions\" ng-show=\"docloaded\" class=\"tex-markdown\"></div>\n" +
    "\t<div ng-hide=\"docloaded\" class=\"docloading\">\n" +
    "\t\t<div class=\"container\"><span tex-loader></span> <span class=\"text\">Loading {{ docname }}...</span></div>\n" +
    "\t</div>\n" +
    "</div>"
  );


  $templateCache.put('templates/directives/texFacebook.html',
    "<span>\n" +
    "\t<a ng-click=\"onFacebookLoginClick()\" ng-if=\"!isLoggedIn\">Facebook</a>\n" +
    "\t<a ng-click=\"onFacebookLogoutClick()\" ng-if=\"isLoggedIn\">Log Out</a>\n" +
    "</span>"
  );


  $templateCache.put('templates/directives/texLoader.html',
    "<div class=\"tex-loader\">\n" +
    "\t<div class=\"spinner\">\n" +
    "\t\t<div class=\"dot1\"></div>\n" +
    "\t\t<div class=\"dot2\"></div>\n" +
    "\t</div>\n" +
    "</div>"
  );


  $templateCache.put('templates/directives/texMarkdown.html',
    "<div ui-layout=\"{flow : 'column', onresize: onPageResize }\" class=\"tex-markdown-container\" >\n" +
    "\t\n" +
    "\t<div ui-layout-container class=\"editor-container\">\n" +
    "\t\t<div ui-ace=\"{ useWrapMode : true, showGutter: false, theme:'chrome',mode: 'markdown', highlightActiveLine: false, onLoad: aceLoaded }\"\n" +
    "\t\t\tng-model=\"document\" ng-readonly=\"texMarkdown.readonly\"></div>\n" +
    "\t</div>\n" +
    "\n" +
    "\t<div ui-layout-container class=\"document-container\">\n" +
    "\t\t<div class=\"tex-document\">\n" +
    "\t\t\t<div class=\"document\"></div>\n" +
    "\t\t\t<div class=\"document-preview\"></div>\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "\n" +
    "</div>"
  );


  $templateCache.put('templates/directives/texMenu.html',
    "<div class=\"topbar\" ng-hide=\"nomenu\">\n" +
    "\t<nav class=\"navbar navbar-default\">\n" +
    "\t\t<div class=\"container-fluid\">\n" +
    "\t\t\t<div class=\"navbar-header\">\n" +
    "\t\t\t\t<a class=\"navbar-brand\" href=\"#\">MarkTex</a>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<ul class=\"nav navbar-nav\" ng-repeat=\"item in items\">\n" +
    "\t\t\t\t<li ng-class=\"item.active ? 'active' : ''\"><a href=\"{{ item.url }}\">{{ item.title }}</a></li>\n" +
    "\t\t\t</ul>\n" +
    "\t\t\t<ul class=\"nav navbar-nav navbar-right\">\n" +
    "\t\t\t\t<li>\n" +
    "\t\t\t\t\t<span tex-facebook></span>\n" +
    "\t\t\t\t</li>\n" +
    "\t\t\t</ul>\n" +
    "\t\t\t<div class=\"collapse navbar-collapse navbar-right\">\n" +
    "\t\t\t\t<p class=\"navbar-text\">\n" +
    "\t\t\t\t\t<span ng-class=\"state | rstolabel\">{{ state | rstotext }}</span>\n" +
    "\t\t\t\t\t<span>{{ pendingdata }}</span>\n" +
    "\t\t\t\t</p>\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\t</nav>\n" +
    "</div>"
  );


  $templateCache.put('templates/includes/fbroot.html',
    "<div id=\"fb-root\" class=\" fb_reset\">\n" +
    "\t<div style=\"position: absolute; top: -10000px; height: 0px; width: 0px;\">\n" +
    "\t\t<div>\n" +
    "\t\t\t<iframe name=\"fb_xdm_frame_http\" frameborder=\"0\" allowtransparency=\"true\" scrolling=\"no\" id=\"fb_xdm_frame_http\" aria-hidden=\"true\" title=\"Facebook Cross Domain Communication Frame\" tabindex=\"-1\" src=\"http://static.ak.facebook.com/connect/xd_arbiter/rFG58m7xAig.js?version=41#channel=f8678170&amp;origin=http%3A%2F%2Flocalhost%3A9000\" style=\"border: none;\"></iframe>\n" +
    "\t\t\t<iframe name=\"fb_xdm_frame_https\" frameborder=\"0\" allowtransparency=\"true\" scrolling=\"no\" id=\"fb_xdm_frame_https\" aria-hidden=\"true\" title=\"Facebook Cross Domain Communication Frame\" tabindex=\"-1\" src=\"https://s-static.ak.facebook.com/connect/xd_arbiter/rFG58m7xAig.js?version=41#channel=f8678170&amp;origin=http%3A%2F%2Flocalhost%3A9000\" style=\"border: none;\"></iframe>\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "</div>"
  );

}]);
