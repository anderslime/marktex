texapp.directive('texlist', [function() {
	return {
	    restrict: 'A',
	    priority: 100,
	    require: 'ngModel',
	    link: function(scope, element, attr, ctrl) {

			var texlist = element.attr(attr.$attr.texlist) || ', ';
			var trimValues = attr.ngTrim !== 'false';
			var separator = trimValues ? angular.trim(texlist) : texlist;

			var parse = function(viewValue) {
				var state = scope.$eval(attr.ngModel);

				if (angular.isUndefined(viewValue))
					return;

				var list = [];

				if (viewValue) {
					var c = 0;
					angular.forEach(viewValue.split(separator), function(value) {

						// horrible code, only here as proof of concept. merges very incorrect
						if (value && state[c]){
							if(state[c].text !== value){
								state[c] = {
									text: trimValues ? trim(value) : value,
									html: '',
									dirty: true
								};
							}
						};
						if (value && !state[c]){
							state.splice(c, 0, {
									text: trimValues ? trim(value) : value,
									html: '',
									dirty: true
								});
						};
						c++;
					});
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