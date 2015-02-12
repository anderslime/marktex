texapp.controller('mainController', ['$scope','mathjaxservice', function($scope, mathjaxservice) {
	$scope.color = 'black';
	$scope.loading = false;
	$scope.expression = '#$\\LaTeX$ and Markdown!\n\nThis is a proof of concept, to see if this is suited for taking math notes. You can use Markdown:\n\n1. To make lists\n- And it is super fast to type!\n\n**Much** faster than $\\LaTeX$ syntax!\n\nBut it\'s nice to have an AmsMath environment available also. Then you can do this:\n\n$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$\n\n###Future work\n\n- Save as PDF\n- Multiplayer typing\n- *More things*\n'; 
	var scaleTimeout;
	var specialElementHandlers = {
	    '.toolbox': function (element, renderer) {
	        return true;
	    }
	};

	$scope.insertMath = function(math){
		$scope.expression += ' $' + math + '$';
	};

	$scope.onPageResize = function(){
		mathjaxservice.updateZoom();
		mathjaxservice.typeset($scope.expression, 300);
	};

	$scope.toggleColors = function(){
		$scope.color = ($scope.color === 'white' ? 'black' : 'white');
	};

}]);