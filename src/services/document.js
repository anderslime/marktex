var texapp = require('../main.js');
var config = require('config');

texapp.factory('documentservice', ['$http', function($http) {
	return {
		list: function(){
			return $http.get(config.urls.document.list, { withCredentials: true });
		}
	};
}]);