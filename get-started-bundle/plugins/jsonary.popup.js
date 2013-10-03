if (typeof window !== 'undefined') {
	function escapeHtml(text) {
		text += "";
		return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
	}
	
	(function (window) {
		function copyStyle(oldDoc, newDoc) {
			var links = oldDoc.getElementsByTagName('link');
			for (var i = 0; i < links.length; i++) {
				var oldElement = links[i];
				newDoc.write('<link href="' + escapeHtml(oldElement.href) + '" rel="' + escapeHtml(oldElement.rel || "") + '">');
			}
			var styles = oldDoc.getElementsByTagName('style');
			for (var i = 0; i < styles.length; i++) {
				var oldElement = styles[i];
				newDoc.write('<style>' + oldElement.innerHTML + '</style>');
			}
		}

		var scriptConditions = [];
		function shouldIncludeScript(url) {
			for (var i = 0; i < scriptConditions.length; i++) {
				if (scriptConditions[i].call(null, url)) {
					return true;
				}
			}
			return false;
		}
		
		function copyScripts(oldDoc, newDoc) {
			var scripts = oldDoc.getElementsByTagName('script');
			for (var i = 0; i < scripts.length; i++) {
				var oldElement = scripts[i];
				if (oldElement.src && shouldIncludeScript(oldElement.src)) {
					newDoc.write('<script src="' + escapeHtml(oldElement.src) + '"></script>');
				}
			}
		}
		
		var setupFunctions = [];
		var preSetupFunctions = [];
		
		Jsonary.popup = function (params, title, openCallback, closeCallback, closeWithParent) {
			if (closeWithParent === undefined) {
				closeWithParent = true;
			}
			if (typeof params === 'object') {
				var newParams = [];
				for (var key in params) {
					if (typeof params[key] == 'boolean') {
						newParams.push(key + '=' + (params[key] ? 'yes' : 'no'));
					} else {
						newParams.push(key + '=' + params[key]);
					}
				}
				params = newParams.join(',');
			}
			var subWindow = window.open(null, null, params);
			subWindow.document.open();
			subWindow.document.write('<html><head><title>' + escapeHtml(title || "Popup") + '</title>');
			copyStyle(window.document, subWindow.document);
			copyScripts(window.document, subWindow.document);
			subWindow.document.write('</head><body class="jsonary popup"></body></html>');
			subWindow.document.close();
			Jsonary.render.addDocument(subWindow.document);
			
			var parentBeforeUnloadListener = function (evt) {
				if (closeWithParent) {
					subWindow.close();
				}
				Jsonary.render.removeDocument(window.document);
			};
			var beforeUnloadListener = function (evt) {
				evt = evt || window.event;
				Jsonary.render.removeDocument(subWindow.document);
				// Remove parent's unload listener, as that will leak the sub-window (including the entire document tree)
				if (window.removeEventListener) {
					window.removeEventListener('beforeunload', parentBeforeUnloadListener, false);
				} else if (window.detachEvent) {
					window.detachEvent('onbeforeunload', parentBeforeUnloadListener);
				}
				if (closeCallback) {
					var result = closeCallback(evt);
					if (evt) {
						evt.returnValue = result;
					}
					return result;
				}
			}
			var onLoadListener = function (evt) {
				evt = evt || window.event;
				for (var i = 0; i < setupFunctions.length; i++) {
					setupFunctions[i].call(subWindow.window, subWindow.window, subWindow.document);
				}
				if (openCallback) {
					return openCallback.call(subWindow.window, subWindow.window, subWindow.document);
				}
			};
			if (subWindow.addEventListener) {
				subWindow.addEventListener('load', onLoadListener, false); 
				subWindow.addEventListener('beforeunload', beforeUnloadListener, false); 
				window.addEventListener('beforeunload', parentBeforeUnloadListener, false);
			} else if (subWindow.attachEvent)  {
				subWindow.attachEvent('onload', onLoadListener);
				subWindow.attachEvent('onbeforeunload', beforeUnloadListener);
				window.attachEvent('onbeforeunload', parentBeforeUnloadListener);
			}
			
			for (var i = 0; i < preSetupFunctions.length; i++) {
				preSetupFunctions[i].call(subWindow.window, subWindow.window);
			}

			return subWindow;
		};
		
		Jsonary.popup.addScripts = function (scripts) {
			if (typeof scripts == 'boolean') {
				scriptConditions.push(function () {
					return scripts;
				});
			}
			if (typeof scripts == 'function') {
				scriptConditions.push(scripts);
			}
			for (var i = 0; i < scripts.length; i++) {
				(function (search) {
					if (search instanceof RegExp) {
						scriptConditions.push(function (url) {
							return search.test(url);
						});
					} else {
						scriptConditions.push(function (url) {
							return url.indexOf('search') !== -1;
						});
					}
				})(scripts[i]);
			}
			return this;
		};
		
		Jsonary.popup.addPreSetup = function (callback) {
			preSetupFunctions.push(callback);
			return this;
		};

		Jsonary.popup.addSetup = function (callback) {
			setupFunctions.push(callback);
			return this;
		};
	})(window);
}