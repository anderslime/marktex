texapp.directive('mathjax', ['mathjaxservice',function(service) {
	return {
		restrict: "A",
		controller: ["$scope", "$attrs", function($scope, $attrs) {
			$scope.$watch($attrs.mathjax, function(string) {
				service.typeset(string, 200);
			});
		}]
	};
}]);

texapp.factory('mathjaxservice', ['$sanitize', 'markdownConverter', '$rootScope', function($sanitize, markdownConverter, $rootScope) {
	var page = angular.element('.page');
	var body = angular.element('body');
	var toolbox = angular.element('.toolbox');
	var splitbar = angular.element('.ui-splitbar');
	var scaled = false;
	var sTimeout;
	$rootScope.typesetting = true;

	MathJax.Hub.signal.Interest(function (message) {
		//maintain a scope property for typesetting state
		if(message.indexOf('Begin PreProcess') > -1)
			$rootScope.typesetting = true;
		if(message.indexOf('End Process') > -1)
			$rootScope.typesetting = false;

		//apply, as this is outside angular cycle
		$rootScope.$apply();
	});

	function replaceSlashes(value){
		//adds slash before \#
		return value.replace(/\\#/g,'\\\\#');
	}

	function typeset(string){
		//apparently this does not work. find out why
		//var htmlString = string == undefined ? "" : $sanitize(markdownConverter.makeHtml(replaceSlashes(string)));
		//MathJax.Hub.Queue(["Typeset", MathJax.Hub, htmlString]);

		var html = string == undefined ? "" : $sanitize(markdownConverter.makeHtml(replaceSlashes(string)));
		var script = angular.element("<span></span>").html(html);
		page.html("");
		page.append(script);
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, page[0]]);
	}

	return {
		typeset: function(string, timeout){
			//cancel any pending typeset
			if(sTimeout)
				clearTimeout(sTimeout);

			//typeset immediately if no timeout specified
			if(!timeout || !scaled){
				//update zoom if first run. e.g not yet scaled
				if(!scaled){
					scaled = true;
					this.updateZoom();
				}

				typeset(string);
				return;
			}
			
			//debounce typesetting if timeout specified
			sTimeout = setTimeout(function(){
				typeset(string);
			}, timeout);
		},
		updateZoom: function(){
			var zoom = (body.width() - toolbox.width() - splitbar.width()) / page.outerWidth();
			page.css('zoom', zoom);
		}
	};
}]);