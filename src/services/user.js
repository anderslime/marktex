var texapp = require('../main.js');
var config = require('config');

texapp.factory('userservice', ['$http', function($http) {
	return {
		me: function(){
			return $http.get(config.urls.me, { withCredentials: true });
		}
	};
}]);