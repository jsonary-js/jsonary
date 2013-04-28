(function () {
	var scripts = document.getElementsByTagName("script");
	var lastScript = scripts[scripts.length - 1];
	var code = lastScript.innerHTML;
	
	var onLoadFunction = function () {
		eval(code);
	};
	
	if (window.addEventListener) {
		window.addEventListener('load', onLoadFunction, false);
	} else {
		window.attachEvent('onload', onLoadFunction);
	}
})();