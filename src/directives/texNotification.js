var texapp = require('../main.js');

texapp.directive('texNotification', [function() {
	return {
		restrict: 'A',
		scope: { 'texNotification': '=' },
        templateUrl: 'templates/directives/texNotification.html',
        controller: ['$scope', '$timeout', function($scope, $timeout){
        	$scope.notifications = [];

        	$scope.closeNotification = function($index){
        		$scope.notifications.splice($index, 1);
        	};

	        $scope.$on('global-notification', function(event, err) {
			    $scope.notifications.push(err);

			    if(err.timeout !== undefined && err.timeout > 0)
			    	$timeout(function(){
			    		var index = $scope.notifications.indexOf(err);
			    		if (index > -1)
						    $scope.notifications.splice(index, 1);
			    	}, err.timeout);
			});
        }]
	};
}]);