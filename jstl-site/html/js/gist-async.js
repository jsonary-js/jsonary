(function (global) {
	global.loadGist = function loadGist(element, gistId) {
		var callbackName = "gist_async_callback_" + Math.floor(Math.random()*100000000);
		window[callbackName] = function (gistData) {
			try {
				delete window[callbackName];
			} catch (e) {
				// Why, IE, why?
				window[callbackName] = undefined;
			}
			var html = gistData.div;
			element.innerHTML = html;
			// We can't just add it via HTML, because of IE
			var linkElement = document.createElement("link");
			element.appendChild(linkElement);
			linkElement.setAttribute("rel", "stylesheet");
			linkElement.setAttribute("type", "text/css");
			linkElement.setAttribute("href", gistData.stylesheet);
			script.parentNode.removeChild(script);
		};
		var script = document.createElement("script");
		script.setAttribute("src", "https://gist.github.com/" + gistId + ".json?callback=" + callbackName);
		document.body.appendChild(script);
	}
})(this);