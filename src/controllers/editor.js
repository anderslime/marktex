var texapp = require('../main.js');

texapp.controller('editorController',
  ['$scope', 'mathjaxservice', '$sce', '$compile', '$routeParams', '$facebook', '$http',
  function( $scope,   mathjaxservice,   $sce,   $compile,   $routeParams, $facebook, $http) {

	$scope.state = 0; //connecting
	$scope.color = 'white';
	$scope.document = '';
	$scope.docloaded = false;
	$scope.aceEditor = {};
  $scope.isLoggedIn = false;
  $scope.isLoginStatusReady = false;

	var scaleTimeout;
	var config = require('config');
	var BCSocket = require('../../components/sharejs/channel/bcsocket.js').BCSocket;
	var sharejs = require('sharejs');
	var socket = new BCSocket(config.serverurl, { reconnect: true });
	var sjs = new sharejs.Connection(socket);
	var doc = $('.document');

	//listen to sharejs socket state changes
	function socketStateChanged(doc){
		$scope.state = (!$scope.docloaded ? 0 : sjs.socket.readyState);
		$scope.pendingdata = ((!$scope.docloaded || doc === undefined) ? false : (doc.pendingData.length > 0 && sjs.socket.readyState !== 1)) ? 'You have unsynchronized changes to this document!' : '';
		$scope.$apply();
	}

	//occurs when ace editor is loaded. will initialize a document afterwards
	var aceLoaded = function(_editor) {
		$scope.aceEditor = _editor;

		_editor.setOption("showPrintMargin", false);
		_editor.setOption("highlightActiveLine", false);
		_editor.setAnimatedScroll(true);

		var docname = $routeParams.docId || 'dojo';
		var doc = sjs.get('docs', docname);

		_editor.getSession().on('changeScrollTop', function(s){ mathjaxservice.scrollFromEditor(s, _editor); });

		doc.connection.on('connected', function(){
			socketStateChanged(doc);
		});
		doc.connection.on('open', function(){
			socketStateChanged(doc);
		});
		doc.connection.on('close', function(){
			socketStateChanged(doc);
		});
		doc.connection.on('error', function(){
			socketStateChanged(doc);
		});

		//note that the connection state will remain 'connecting' at least until this method has fired
		doc.whenReady(function() {
			$scope.docloaded = true;
			if (!doc.type)
				doc.create('text');

			doc.attach_ace(_editor);
			socketStateChanged();
			_editor.scrollToLine(0, false, false, function(){});
		});

		doc.subscribe();
	};

	//ace options
	$scope.aceOptions = {
		useWrapMode : true,
		showGutter: false,
		theme:'chrome',
		mode: 'markdown',
		highlightActiveLine: false,
  		onLoad: aceLoaded
	};

	var specialElementHandlers = {
	    '.toolbox': function (element, renderer) {
	        return true;
	    }
	};

	//fired on page resize, both window and columns
	$scope.onPageResize = function(){
		if(scaleTimeout)
			clearTimeout(scaleTimeout);

		scaleTimeout = setTimeout(function(){
			mathjaxservice.updateScrollSync($scope.aceEditor, $('.document'));
		}, 100);
	};

	//controls black/white theme by inverting colors
	$scope.toggleColors = function(){
		$scope.color = ($scope.color === 'white' ? 'black' : 'white');
	};

  // Facebook
  var fetchUserCredentials = function() {
    $http.get("http://marktexx.dev/me", { withCredentials: true })
         .success(function(user) {
           $scope.username = user.name;
         });
  };
  $scope.onFacebookLoginClick = function() {
    $facebook.login().then(function(res) {
      if (res.authResponse) {
        window.location = "http://marktexx.dev/auth/facebook/callback";
      } else {
        console.log("Something went wrong");
      }
    }, function(error) {
      console.log("Something went wrong trying to login");
    });
  };
  $scope.onFacebookLogout = function() {
    $facebook.logout().then(function(res) {
      console.log("You are logged out!");
    }, function(error) {
      console.log("Something bad happened here");
    });
  };
  $scope.$on('fb.auth.statusChange', function(event, res, FB) {
    $scope.isLoggedIn = res.status === 'connected';
    $scope.isLoginStatusReady = true;

    if (res.status === 'connected') {
      fetchUserCredentials();
    }
  });
}]);

module.exports = texapp;
