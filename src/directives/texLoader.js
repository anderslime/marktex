var texapp = require('../main.js');

texapp.directive('texLoader', [function() {
	return {
		restrict: 'A',
        scope: { 'texLoader': '=' },
        templateUrl: 'templates/directives/texLoader.html'
	};
}]);