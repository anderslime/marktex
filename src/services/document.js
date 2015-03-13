var texapp = require('../main.js');
var config = require('config');

texapp.factory('documentservice', ['$http', function($http) {
	var resourceUrl = function(id) {
		return [config.urls.document, id].join('/');
	};
	return {
		list: function(){
			return $http.get(config.urls.document, { withCredentials: true });
		},
		create: function(title){
			return $http.post(config.urls.document, { title: title }, { withCredentials: true });
		},
		remove: function(id){
			return $http.delete(resourceUrl(id), { withCredentials: true });
		},
		update: function(doc){
			return $http.put(resourceUrl(doc._id), doc, { withCredentials: true });
		}
	};
}]);
