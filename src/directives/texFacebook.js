var texapp = require('../main.js');
var config = require('config');

texapp.directive('texFacebook', ['$http', '$facebook', 'userservice', 'notificationservice', '$rootScope',
						 function($http,   $facebook,	userservice,   notificationservice,	  $rootScope) {
	return {
		restrict: 'A',
		replace: true,
		transclude: true,
		scope: { 'texFacebook': '=' },
		templateUrl: 'templates/directives/texFacebook.html',
		controller: ['$scope', function($scope){
			$scope.isLoggedIn = $rootScope.isLoggedIn = false;
			$scope.loading = false;
			var unknownError = 'Unknown error encountered when authing with Facebook'; // lets not have this!

			$scope.onFacebookLoginClick = function() {
				$facebook.login().then(function(res) {
					if (res.authResponse)
						window.location = config.urls.fbCallbackUrl;
					else
						notificationservice.error(unknownError); // what excactly happens here?
				}, function() {
					notificationservice.error(unknownError); // what excactly happens here?
				});
			};

			$scope.onFacebookLogoutClick = function() {
				$facebook.getLoginStatus(true).then(function(res) {
					if (res.status === 'connected') {
						$facebook.logout().then(function() {
							//user is logged out
							window.location = config.urls.logout;
						}, function() {
							notificationservice.error(unknownError); // what excactly happens here?
						});
					} else {
						// We are not logged in and the local information is not updated
						console.log("already logged out");
						window.location.reload();
					}
				}, function() {
					notificationservice.error(unknownError); // what excactly happens here?
				});
			};

			$scope.$on('fb.auth.statusChange', function(event, res) {
				$scope.loading = true;
				if (res.status !== 'connected')
					return; // i don't know what this status means, but its apparently bad

				//we are now in a state where Facebook says the user authorized our app, but it
				//is not guaranteed that we have info about him. if we are running with a clean
				//database, that will be the case. we will handle this.
				var facebookToken = res.authResponse.accessToken;

				//see if we have user data
				userservice.me(facebookToken).success(function(user) {
					$scope.isLoggedIn = $rootScope.isLoggedIn = true;
					$scope.loading = false;
					$scope.username = user.name;
					$scope.id = $rootScope.selfId = user.id;
					//everything is cool

					//this should probably be added to the already made request. will move when not lazy
					$facebook.api('/me/picture?width=30&height=30').then(
						function(response) {
							$scope.imgurl = response.data.url;
						},
						function(err) {
							notificationservice.error(err);
						});

				}).error(function(){
					$scope.loading = false;
					//facebook data about the user was not found. we must fetch it
					//apparently, this is also where we arrive for users not logged in. At least in Chrome Canary. Strange.

					//notificationservice.error('You are logged in, and we though we had data about you, but we don\'t. This will be fixed!');
				});

			});
		}]
	};
}]);
