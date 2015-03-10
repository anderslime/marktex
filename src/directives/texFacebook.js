var texapp = require('../main.js');
var config = require('config');

texapp.directive('texFacebook', ['$http', '$facebook', 'userservice', function($http, $facebook, userservice) {
	return {
		restrict: 'A',
		replace: true,
		transclude: true,
        scope: { 'texFacebook': '=' },
        templateUrl: 'templates/directives/texFacebook.html',
        controller: ['$scope', function($scope){

       		$scope.isLoggedIn = false;
			$scope.isLoginStatusReady = false;

        	var fetchUserCredentials = function() {
				userservice.me().success(function(user) {
					$scope.username = user.name;
				});
			};

			$scope.onFacebookLoginClick = function() {
				$facebook.login().then(function(res) {
					if (res.authResponse)
						window.location = config.urls.fbCallbackUrl;
					else
						console.log('Something went wrong');
					
				}, function(error) {
					console.log('Something went wrong trying to login');
				});
			};

			$scope.onFacebookLogoutClick = function() {
				$facebook.logout().then(function(res) {
					console.log('You are logged out!');
				}, function(error) {
					console.log('Something bad happened here');
				});
			};

			$scope.$on('fb.auth.statusChange', function(event, res, FB) {
				$scope.isLoggedIn = res.status === 'connected';
				$scope.isLoginStatusReady = true;

				if (res.status === 'connected')
				  fetchUserCredentials();
			});
        }]
	};
}]);