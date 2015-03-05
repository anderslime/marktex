angular.module('texapp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/controllers/documentlist.html',
    "<h1>Documents will be listed here</h1>\n"
  );


  $templateCache.put('templates/controllers/editor.html',
    "<div ng-controller=\"editorController\" ng-class=\"color\" ui-layout=\"{ dividerSize: 0 }\">\n" +
    "\t<div ui-layout-container size=\"50px\" class=\"topbar\">\n" +
    "\t\t<nav class=\"navbar navbar-default\">\n" +
    "\t\t\t<div class=\"container-fluid\">\n" +
    "\t\t\t\t<div class=\"navbar-header\">\n" +
    "\t\t\t\t\t<a class=\"navbar-brand\" href=\"#\">\n" +
    "\t\t\t\t\t\tMarkTex\n" +
    "\t\t\t\t\t</a>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t<div class=\"collapse navbar-collapse navbar-right\">\n" +
    "\t\t\t\t\t<p class=\"navbar-text\">\n" +
    "\t\t\t\t\t\t<span ng-class=\"state | rstolabel\">{{ state | rstotext }}</span>\n" +
    "\t\t\t\t\t\t<span>{{ pendingdata }}</span>\n" +
    "\t\t\t\t\t</p>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div>\n" +
    "\t\t</nav>\n" +
    "\t</div>\n" +
    "\t<div ui-layout-container> \n" +
    "\t\t<div ui-layout=\"{flow : 'column', onresize: onPageResize }\">\n" +
    "\t\t\t\n" +
    "\t\t\t<div ui-layout-container class=\"editor-container\">\n" +
    "\t\t\t\t<div ui-ace=\"aceOptions\" ng-model=\"document\" ng-readonly=\"!docloaded\"></div>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div ui-layout-container class=\"document-container\">\n" +
    "\t\t\t\t<div tex-markdown=\"document\" ace=\"aceEditor\" class=\"tex-document\"></div>\n" +
    "\t\t\t</div>\n" +
    "\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "</div>"
  );


  $templateCache.put('templates/directives/texLoader.html',
    "<div>\n" +
    "  <svg width=\"70\" height=\"20\" class=\"loader\" ng-show=\"texLoader\">\n" +
    "    <rect width=\"20\" height=\"20\" x=\"0\" y=\"0\" rx=\"3\" ry=\"3\">\n" +
    "      <animate attributeName=\"width\" values=\"0;20;20;20;0\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "      <animate attributeName=\"height\" values=\"0;20;20;20;0\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "      <animate attributeName=\"x\" values=\"10;0;0;0;10\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "      <animate attributeName=\"y\" values=\"10;0;0;0;10\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "    </rect>\n" +
    "    <rect width=\"20\" height=\"20\" x=\"25\" y=\"0\" rx=\"3\" ry=\"3\">\n" +
    "      <animate attributeName=\"width\" values=\"0;20;20;20;0\" begin=\"200ms\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "      <animate attributeName=\"height\" values=\"0;20;20;20;0\" begin=\"200ms\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "      <animate attributeName=\"x\" values=\"35;25;25;25;35\" begin=\"200ms\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "      <animate attributeName=\"y\" values=\"10;0;0;0;10\" begin=\"200ms\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "    </rect>\n" +
    "    <rect width=\"20\" height=\"20\" x=\"50\" y=\"0\" rx=\"3\" ry=\"3\">\n" +
    "      <animate attributeName=\"width\" values=\"0;20;20;20;0\" begin=\"400ms\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "      <animate attributeName=\"height\" values=\"0;20;20;20;0\" begin=\"400ms\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "      <animate attributeName=\"x\" values=\"60;50;50;50;60\" begin=\"400ms\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "      <animate attributeName=\"y\" values=\"10;0;0;0;10\" begin=\"400ms\" dur=\"1000ms\" repeatCount=\"indefinite\"/>\n" +
    "    </rect>\n" +
    "  </svg>\n" +
    "  <div ng-transclude ng-show=\"!texLoader\"></div>\n" +
    "</div>"
  );

}]);
