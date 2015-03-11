var texapp = require('../main.js');

texapp.directive('texMenu', [function() {
	return {
		restrict: 'A',
		scope: { 'texMenu': '=' },
        templateUrl: 'templates/directives/texMenu.html',
        controller: ['$scope', '$route', '$location', function($scope, $route, $location){
        	function updateMenu(){
	        	$scope.items = [];
	        	var path = $location.path();
	        	angular.forEach($route.routes,function (route) {
	        		if(route.title !== undefined)
				    	$scope.items.push({
				    		title: route.title,
				    		url: route.url,
				    		active: path.indexOf(route.url) === 0
				    	});
			    });
	        }

	        $scope.$on('$locationChangeStart', function() {
			    updateMenu();
			});

			updateMenu();
        }]
	};
}]);