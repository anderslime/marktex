texapp.filter('text', function(){
	return function(state){
		return $.map(state, function(val, i) {
			return val.text;
		});
	};
});

texapp.filter('html', ['$sce', 'mathjaxservice', function($sce, mathjaxservice){
	return function(state){
		if(state)
			return $sce.trustAsHtml($.map(state, function(val, i) {
				if(val.dirty)
					val.html = mathjaxservice.typeset(val);
				
				return val.html;
			}).join(''));
	};
}]);