var texapp = require('../main.js');
var config = require('config');

texapp.factory('documentservice', ['$http', function($http) {
	return {
		list: function(){
			return $http.get(config.urls.document, { withCredentials: true });
		},
		create: function(title){
			return $http.post(config.urls.document, { title: title }, { withCredentials: true });
		},
		remove: function(id){
			return $http.delete(config.urls.document, { id: id }, { withCredentials: true });
		},
		update: function(doc){
			return $http.put(config.urls.document, doc, { withCredentials: true });
		}
	};
}]);