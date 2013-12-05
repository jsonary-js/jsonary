(function (global) {
	var api = {
		query: Jsonary.create(null),
		queryVariant: 'pretty',
		useHistory: true
	};

	if (typeof window == 'undefined') {
		// None of the methods, but include the config
		Jsonary.extend({
			location: api
		});
		return;
	}
	
	var changeListeners = [];
	api.onChange = function (callbackFunction, immediate) {
		start();
		
		var disableCount = 0;
		var callback = function () {
			if (disableCount <= 0) {
				callbackFunction.apply(this, arguments);
			}
		};
		changeListeners.push(callback);
		if (immediate || immediate == undefined) {
			callback.call(api, api, api.query);
		}
		return {
			ignore: function (action) {
				this.disable();
				action();
				this.enable();
			},
			enable: function () {
				disableCount--;
			},
			disable: function () {
				disableCount++;
			}
		};
	};
	var addHistoryPoint = false;
	api.addHistoryPoint = function () {
		addHistoryPoint = true;
	};
	api.replace = function (newHref, notify) {
		start();
		var oldHref = window.location.href;
		newHref = Jsonary.Uri.resolve(oldHref, newHref);
		if (notify == undefined) {
			notify = true;
		}

		if (api.useHistory && window.history && window.history.pushState && window.history.replaceState) {
			if (addHistoryPoint) {
				window.history.pushState({}, "", newHref);
			} else {
				window.history.replaceState({}, "", newHref);
			}
		} else {
			// Using fragment - figure out shorter version if possible
			var withoutHash = newHref.split('#')[0];
			var withoutHashCurrent = window.location.href.split('#')[0];
			if (withoutHash == withoutHashCurrent) {
				newHref = '';
			} else if (withoutHash.split('?')[0] == withoutHashCurrent.split('?')[0]) {
				newHref = '?' + newHref.split('?').slice(1).join('?');
			} else if (newHref.split('/').slice(0, 3).join('/') == window.location.href.split('/').slice(0, 3).join('/')) {
				newHref = '/' + newHref.split('/').slice(3).join('/');
			}
			if (addHistoryPoint) {
				window.location.href = '#' + newHref.replace(/%23/g, '#');
			} else {
				window.location.replace('#' + newHref.replace(/%23/g, '#'));
			}
		}
		if (newHref != oldHref) {
			addHistoryPoint = false;
		}
		api.base = newHref.split(/[?#]/)[0];
		lastHref = window.location.href;
		if (notify) {
			for (var i = 0; i < changeListeners.length; i++) {
				changeListeners[i].call(api, api, api.query);
			}
		}
	}

	var ignoreUpdate = false;
	var lastHref = null;
	function update() {
		if (window.location.href == lastHref) {
			return;
		}
		lastHref = window.location.href;
		var fragment = lastHref.split('#').slice(1).join('#');
		var resolved = Jsonary.Uri.resolve(lastHref.split('#')[0], fragment);
		api.resolved = resolved;
		
		var uri = new Jsonary.Uri(resolved);
		uri.scheme = uri.domain = uri.port = uri.username = uri.password = uri.doubleSlash = null;
		api.trailing = uri.toString();

		ignoreUpdate = true;
		api.base = resolved.split('?')[0];
		var queryString = resolved.split('?').slice(1).join('?');
		if (queryString) {
			api.query.setValue(Jsonary.decodeData(queryString, 'application/x-www-form-urlencoded', api.queryVariant));
		} else {
			api.query.setValue({});
		}
		ignoreUpdate = false;

		if (started && window.history && api.useHistory && window.location.href !== api.resolved) {
			updateLocation(false);
		}

		for (var i = 0; i < changeListeners.length; i++) {
			changeListeners[i].call(api, api, api.query);
		}
	}
	api.parse = function (uri) {
		var result = {};
		var fragment = uri.split('#').slice(1).join('#');
		var resolved = Jsonary.Uri.resolve(uri.split('#')[0], fragment);
		result.resolved = resolved;

		result.base = resolved.split('?')[0];
		var queryString = resolved.split('?').slice(1).join('?');
		if (queryString) {
			result.query = Jsonary.create(Jsonary.decodeData(queryString, 'application/x-www-form-urlencoded', api.queryVariant));
		} else {
			result.query = Jsonary.create({});
		}
		return result;
	}
	
	function updateLocation(notify) {
		start();
		var queryString = Jsonary.encodeData(api.query.value(), "application/x-www-form-urlencoded", api.queryVariant);
		var newHref = api.base + "?" + queryString;

		api.replace(newHref, notify);
		lastHref = window.location.href;
	}
	api.query.document.registerChangeListener(function () {
		if (ignoreUpdate) {
			return;
		}
		updateLocation(true);
	});

	Jsonary.extend({
		location: api
	});	

	var started = false;
	var start = function () {
		started = true;
	};

	if ("onhashchange" in window) {
		window.onhashchange = update;
	}
	if ("onpopstate" in window) {
		window.onpopstate = update;
	}
	setInterval(update, 100);
	update();
})(this);
