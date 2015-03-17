var texapp = require('../main.js');

texapp.directive('texShareDoc', [function() {
	return {
		restrict: 'A',
		scope: { 'texShareDoc': '=', 'ngModel': '=', 'onChange': '=', 'placeholder': '=' },
		templateUrl: 'templates/directives/texShareDoc.html',
		controller: ['$scope', function($scope){

			// PIECE OF SHIT DIRECTIVE DOES NOT OFFER CUSTOM COMPARISON ON MATCHES TO CHOICES: YUCK!!!

			var connections = angular.copy($scope.texShareDoc);
			var filterChoices = function(){
				//remove choices already selected. this is done manually, to allow for custom comparers
				$scope.texShareDoc = angular.copy(connections);

				var modelIds = $scope.ngModel.map(function(u){ return u._id; });
				for(var i = $scope.texShareDoc.length -1; i >= 0; i--)
					if(modelIds.indexOf($scope.texShareDoc[i]._id) > -1)
						$scope.texShareDoc.splice(i, 1);
			};

			angular.forEach($scope.ngModel, function(user){
				if($scope.$root.selfId === user._id){
					user.locked = true;
				}
			});

			var skipNextDigestCycle = false;
			$scope.$watch('ngModel', function(newVal, oldVal){
				if(typeof($scope.onChange) !== 'function' || newVal === oldVal)
					return;

				if(skipNextDigestCycle){
					skipNextDigestCycle = false;
					return;
				}

				skipNextDigestCycle = true;
				filterChoices();
				$scope.onChange();
			});

			$scope.$watch('texShareDoc', function(newVal, oldVal){
				if(oldVal === newVal)
					return;

				if(skipNextDigestCycle){
					skipNextDigestCycle = false;
					return;
				}

				connections = angular.copy($scope.texShareDoc);
				skipNextDigestCycle = true;
				filterChoices();
			});
		}]
	};
}]);