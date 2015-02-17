texapp.directive('texList', [function() {
	return {
	    restrict: 'A',
	    priority: 100,
	    require: 'ngModel',
	    link: function(scope, element, attr, ctrl) {

			var texList = element.attr(attr.$attr.texList) || ', ';
			var trimValues = attr.ngTrim !== 'false';
			var separator = trimValues ? angular.trim(texList) : texList;

			var parse = function(viewValue) {
				var state = scope.$eval(attr.ngModel);

				if (angular.isUndefined(viewValue))
					return;

				var list = [];

				if (viewValue) {
					var c = 0;
					var values = viewValue.split(separator);
					var removed = state.length > values.length;
					angular.forEach(values, function(value) {

						// horrible code, only here as proof of concept. merges very incorrect
						if (!angular.isUndefined(value) && !angular.isUndefined(state[c])){
							//line was updated
							if(state[c].text !== value){
								state[c] = {
									text: trimValues ? trim(value) : value,
									html: '',
									dirty: true
								};
								if(state[c].text === '')
									state[c].text = '<br />';
							}
							c++;
						}
						else if (value && !state[c] && !removed){
							//line was added
							state.splice(c, 0, {
									text: trimValues ? trim(value) : value,
									html: '',
									dirty: true
								});
							c++;
						}
						else if (value && removed){
							//line was removed
							state[c] = undefined;
						}
					});


					if(c < state.length)
						for(c; c < state.length; c++)
							delete state[c];
				}

				return state;
			};

			ctrl.$parsers.push(parse);
			ctrl.$formatters.push(function(value) {
				if (angular.isArray(value)) {
					return value.map(function(x){
						return x.text;
					}).join('\n');
				}

				return undefined;
			});

			// Override the standard $isEmpty because an empty array means the input is empty.
			ctrl.$isEmpty = function(value) {
				return !value || !value.length;
			};
		}
	};
}]);