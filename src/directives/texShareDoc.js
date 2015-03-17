var texapp = require('../main.js');

texapp.directive('texShareDoc', [function() {
	return {
		restrict: 'A',
		scope: { 'texShareDoc': '=', 'ngModel': '=', 'onChange': '=', 'placeholder': '=' },
		templateUrl: 'templates/directives/texShareDoc.html',
		controller: ['$scope', function($scope){

			var hiddenuserids = ['54fed7ff7abcd73c56bfb4f6'];

			if(hiddenuserids && hiddenuserids.length > 0)
				angular.forEach($scope.ngModel, function(user){
					if(hiddenuserids.indexOf(user._id) > -1)
						user.locked = true;
				});

			$scope.$watch('ngModel', function(newVal, oldVal){
				if(typeof($scope.onChange) !== 'function' || newVal === oldVal)
					return;

				$scope.onChange();
			});
		}]
	};
}]);