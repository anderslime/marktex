texapp.directive('loader', ['$compile', '$templateCache', '$http', function($compile, $templateCache, $http) {
	return {
		restrict: "A",
		transclude: true,
   		replace: true,
        scope: { 'loader': '=' },
        templateUrl: '/templates/loader.html'
	};
}]);