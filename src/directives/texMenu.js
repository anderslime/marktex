var texapp = require('../main.js');

texapp.directive('texMenu', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		scope: { 'texMenu': '=' },
        templateUrl: 'templates/directives/texMenu.html',
        controller: ['$scope', '$route', '$location', function($scope, $route, $location){
        	function updateMenu(){
	        	$scope.items = [];
	        	var path = $location.path();
	        	angular.forEach($route.routes,function (route) {
	        		if(route.title !== undefined && (!route.authorization || (route.authorization && $rootScope.isLoggedIn)))
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

			$rootScope.$watch('isLoggedIn', function(){
				updateMenu();
			});

			updateMenu();
        }]
	};
}]);