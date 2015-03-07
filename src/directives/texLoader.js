var texapp = require('../main.js');

texapp.directive('texLoader', [function() {
	return {
		restrict: "A",
		transclude: true,
   		replace: true,
        scope: { 'texLoader': '=' },
        templateUrl: '/templates/texLoader.html'
	};
}]);