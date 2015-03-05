var texapp = require('../main.js');

texapp.filter('rstotext', [function() {
	return function(input){
		switch(input){
			case 0: return 'Connecting';
			case 1: return 'Connected';
			case 2: return 'Closing';
			case 3: return 'Disconnected';
		}
	};
}]);

texapp.filter('rstolabel', [function() {
	return function(input){
		switch(input){
			case 0: return 'label label-info';
			case 1: return '';
			case 2: return 'label label-warning';
			case 3: return 'label label-danger';
		}
	};
}]);