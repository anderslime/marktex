var texapp = require('../main.js');

texapp.directive('texMenu', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		scope: { 'texMenu': '=' },
        templateUrl: 'templates/directives/texMenu.html',
        controller: ['$scope', '$route', '$location', '$routeParams', function($scope, $route, $location, $routeParams){
        	$scope.doctitle = '';
			
        	function updateMenu(){
				var path = $location.path();
	        	$scope.items = [];
	        	angular.forEach($route.routes,function (route) {
	        		if(route.title !== undefined && (!route.authorization || (route.authorization && $rootScope.isLoggedIn)) && (!route.publicOnly || (route.publicOnly && !$rootScope.isLoggedIn))){
				    	$scope.items.push({
				    		title: route.title,
				    		url: route.url,
				    		active: path.indexOf(route.url) === 0
				    	});
				    }
			    });
	        }

	        $scope.$on('$routeChangeSuccess', function() {
	        	if($location.path().indexOf('/editor') === 0)
		    		$scope.doctitle = $routeParams.docName;
		    	else
		    		$scope.doctitle = null;
		    	updateMenu();
			});
			
			$rootScope.$watch('isLoggedIn', function(){
				updateMenu();
			});

			updateMenu();

			$scope.test = false;

			function insertChar(editor, session){
				if(!$scope.test)
					return;

				session.insert({
					row: session.getLength(),
					column: 0
				}, 'a ');

				setTimeout(function(){insertChar(editor, session); }, 500);
			}

			$scope.loadtest = function(){
				var editor = window.ace.edit("aceditor");
				var session = editor.session;

				$scope.test = !$scope.test;

				insertChar(editor, session);
			};
        }]
	};
}]);