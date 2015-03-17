var texapp = require('../main.js');

texapp.filter('withoutselfifcreator', [function() {
	return function(input, creatorId, userId){
		return input.filter(function(user){
			if(user._id !== userId)
				return user;
		});
	};
}]);