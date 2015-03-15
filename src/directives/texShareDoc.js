var texapp = require('../main.js');

texapp.directive('texShareDoc', [function() {
	return {
		restrict: 'A',
        scope: { 'texShareDoc': '=', 'ngModel': '=', 'onSelect': '=', 'onRemove': '=' },
        templateUrl: 'templates/directives/texShareDoc.html'
	};
}]);