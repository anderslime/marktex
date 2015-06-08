var texapp = require('../main.js');

texapp.directive('texMenu', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		scope: { 'texMenu': '=' },
        templateUrl: 'templates/directives/texMenu.html',
        controller: ['$scope', '$route', '$location', '$routeParams', function($scope, $route, $location, $routeParams){
        	$scope.doctitle = 'test';
			var path = $location.path();

        	function updateMenu(){
	        	$scope.items = [];
	        	angular.forEach($route.routes,function (route) {
	        		if(route.title !== undefined && (!route.authorization || (route.authorization && $rootScope.isLoggedIn))){
				    	$scope.items.push({
				    		title: route.title,
				    		url: route.url,
				    		active: path.indexOf(route.url) === 0
				    	});
				    }
			    });
	        }

	        $scope.$on('$routeChangeSuccess', function() {
	        	if(path.indexOf('/editor') === 0)
		    		$scope.doctitle = $routeParams.docName;
			});

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