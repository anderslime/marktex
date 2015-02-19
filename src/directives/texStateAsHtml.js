var texapp = require('../controllers/main.js');

texapp.directive('texStateAsHtml', ['$compile', 'mathjaxservice', function($compile, mathjaxservice) {

	function stateAsHtml(state){
		return state.map(function(val, i) {
			if(val != undefined){
				if(val.dirty)
					return mathjaxservice.typeset(val, i);
				return val.html;
			}
		}).join('');
	}

	return {
		restrict: "A",
        scope: { 'texStateAsHtml': '=' },
		link: function(scope, element, attrs) {
			var time;
			scope.$watch('texStateAsHtml', function(state, oldstate) {

				if(state.every(function(k){ return !k.dirty }))
					return;

				if(time)
					clearTimeout(time);

				time = setTimeout(function(){
					console.log('watch change!');
					var elements = stateAsHtml(state);
					elements = elements.replace(new RegExp('ng-transclude', 'g'), '');
			        element.html(elements);
			        $compile(element.contents())(scope);
				}, 100);
				
			}, true);
	    }
	};
}]);