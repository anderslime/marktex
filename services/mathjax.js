texapp.factory('mathjaxservice', ['$sanitize', 'markdownConverter', '$rootScope', function($sanitize, markdownConverter, $rootScope) {
	var page = angular.element('.page');
	var body = angular.element('body');
	var toolbox = angular.element('.toolbox');
	var splitbar = angular.element('.ui-splitbar');
	var scale = false;
	var scaled = false;
	var sTimeout;
	$rootScope.typesetting = true;

	//signal to mathjax that we are interested in hearing everything it does
	MathJax.Hub.signal.Interest(function (message) {
		//maintain a scope property for typesetting state
		if(message.indexOf('Begin PreProcess') > -1)
			$rootScope.typesetting = true;
		if(message.indexOf('End Process') > -1){
			$rootScope.typesetting = false;
			//apply, as this is outside angular cycle
			$rootScope.$broadcast('typeset');
			$rootScope.$apply();
		}
	});

	function replaceSlashes(value){
		//adds slash before \#, so we can use hashes in latex syntax
		return value.replace(/\\#/g,'\\\\#');
	}

	function guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
    }

	function typeset(state, index){
		// if state is not dirty, return stored html
		if(!state.dirty)
			return state.html;

		//get markdowned value
		var html = state.text == undefined ? "" : $sanitize(markdownConverter.makeHtml(replaceSlashes(state.text)));

		//if markdowned value contains the class mathjax, we know we have to deal with something that must be jaxxed
		//several ugly hacks will be made here, like manipulating html manually and so on. this is because it is
		//impossible to control what comes back from the markdownConverter, except for classes and href's
		if(html.indexOf('><div class="mathjax ') >= 0){
			var e = $(html)
			var oid = guid(); // id of outer element
			var iid = $(html).find('.mathjax').attr('href'); // id of inner element, the one with the jax

			//put the id on the outer div of the html returned from markdownConverter. also, put a scope variable
			//that allows for dirty tracking in loader directive. this will allow for toggling the loading animation
			html = html.replace('><div ', '><div loader="stateAsHtml[' + index + '].dirty" ');
			//put another id on the inner div, this is used for mathjax typeset tracking
			html = '<div id="' + oid + '" class="mathjax-wrapper">' + html + '</div>';
			html = html.replace(new RegExp('href', 'g'), 'id');

			//we should have some logic for reprocessing, as a full typeset might be too expensive. maybe.
			if(e.find('.MathJax_Preview')[0]){
				console.log('reprocessing');
				//MathJax.Hub.Queue(['Reprocess', MathJax.Hub, id]);
			}
			else{
				//debounce the typesetting. mathjax handles throttling badly.
				if(sTimeout)
					clearTimeout(sTimeout);

				sTimeout = setTimeout(function(){
					console.log('typesetting');
					state.iid = iid;
					state.oid = oid;
					
					//inform mathjax to typeset the element with id = iid
					MathJax.Hub.Queue(['Typeset', MathJax.Hub, iid ]);
				}, 200);
			}
		}else{
			//if the state did not require mathjax, inform listener that this state is now ready to marked as not dirty
			$rootScope.$broadcast('typeset', { state: state, html: html });
		}
		return html;
	}

	return {
		typeset: function(string, element){
			return typeset(string, element);
		},
		updateZoom: function(){
			var zoom = (body.width() - toolbox.width() - splitbar.width()) / page.outerWidth();
			page.css('zoom', zoom);
		}
	};
}]);