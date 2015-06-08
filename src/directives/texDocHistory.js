var texapp = require('../main.js');
//var config = require('config');

texapp.directive('texDocHistory', [
						 function() {
	return {
		restrict: 'A',
		replace: false,
		transclude: false,
		scope: { 'texDocHistory': '=' },
		templateUrl: 'templates/directives/texDocHistory.html',
		controller: ['$scope', 'documentservice', function($scope, documentservice){
			documentservice.listHistory($scope.texDocHistory.docId).success(function(data){
				$scope.operations = data;
			});

			$scope.travel = function(){
				var operation = $scope.operations[$scope.operations.length - $scope.history - 1];
				var doc = $scope.texDocHistory.doc.editingContexts[0];

				var ops = [];
				for(var i = $scope.operations.length - 1; i >= 0; i--){
					ops.push($scope.operations[i]);
					if($scope.operations[i] === operation)
						break;
				}

				doc.applyOperationsFromClean(ops);
			};
		}]
	};
}]);
