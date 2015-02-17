texapp.directive('texLoader', ['$compile', '$templateCache', '$http', function($compile, $templateCache, $http) {
	return {
		restrict: "A",
		transclude: true,
   		replace: true,
        scope: { 'texLoader': '=' },
        templateUrl: '/templates/texLoader.html'
	};
}]);