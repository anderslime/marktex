var texapp = require('../main.js');

texapp.directive('texShareDoc', [function() {
	return {
		restrict: 'A',
		scope: { 'texShareDoc': '=', 'ngModel': '=', 'onChange': '=' },
		templateUrl: 'templates/directives/texShareDoc.html',
		controller: ['$scope', function($scope){
			$scope.$watch('ngModel', function(newVal, oldVal){
				if(typeof($scope.onChange) !== 'function' || newVal === oldVal)
					return;

				$scope.onChange();
			});
		}]
	};
}]);