var texapp = require('../main.js');

texapp.factory('notificationservice', ['$rootScope', function($rootScope) {
	var durationToInteger = function(duration){
		switch(duration){
			case 'short': return 3000;
			case 'long': return 10000;
		}
	};

	var broadcastNotification = function(text, duration, type){
		$rootScope.$broadcast('global-notification', { text: text, timeout: durationToInteger(duration), type: type });
	};

	return {
		error: function(text, duration){
			broadcastNotification(text, duration, 'danger');

			//if(config.persistentLogging)
			//	$http.post(config.urls.logging, { text: text });
		},
		warning: function(text, duration){
			broadcastNotification(text, duration, 'warning');
		},
		info: function(text, duration){
			broadcastNotification(text, duration, 'info');
		}
	};
}]);