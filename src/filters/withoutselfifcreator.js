var texapp = require('../main.js');

texapp.filter('withoutselfifcreator', [function() {
	return function(input, creatorId, userId){
		var arr =  input.filter(function(user){
			if(user._id !== userId)
				return user;
		});
		
		return arr;
	};
}]);