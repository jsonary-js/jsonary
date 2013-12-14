(function (Jsonary) {
	if (typeof window === 'undefined') {
		return;
	}

	function Route(templateStr, handlerFunction) {
		this.template = Jsonary.UriTemplate(templateStr);
		this.templateString = templateStr;
		this.run = handlerFunction;
	}
	Route.prototype = {
		test: function (url) {
			var params = this.template.fromUri(url);
			if (params && this.template.fillFromObject(params) === url) {
				return params;
			}
		},
		url: function (params) {
			return this.template.fillFromObject(params);
		}
	};
	
	function getCurrent() {
		return Jsonary.location.base.replace(/^[^:]*:\/\/[^/]*/, '').replace(/[?#].*$/, '');
	}

	var routes = [];
	var extraData = {};
	function runRoutes() {
		var url = getCurrent(), query = Jsonary.location.query;
		var params;
		for (var i = 0; i < routes.length; i++) {
			var route = routes[i];
			if (params = route.test(url)) {
				var result = route.run(params, query, extraData);
				if (result !== false) {
					return; 
				}
			}
		}
	}
	var pending = false;
	function runRoutesLater() {
		extraData = {};
		if (pending) return;
		pending = true;
		setTimeout(function () {
			pending = false;
			runRoutes();
		}, 25);
	}

	var locationMonitor = Jsonary.location.onChange(runRoutesLater, false);

	var api = Jsonary.route = function (template, handler) {
		var route = new Route(template, handler);
		routes.push(route);
		runRoutesLater();
		return route;
	};
	api.shortUrl = function (url) {
		var shortUrl = url.replace(/#$/, "");
		var urlBase = Jsonary.baseUri;
		if (url.substring(0, urlBase.length) == urlBase) {
			shortUrl = url.substring(urlBase.length) || "./";
		}
		return shortUrl;
	};
	api.set = function (path, query, extra) {
		query = query ||Jsonary.location.query.get();
		var newHref = (path || '').replace(/\?$/, '');
		if (Object.keys(query).length) {
			newHref += (newHref.indexOf('?') !== -1) ? '&' : '?';
			newHref += Jsonary.encodeData(query, 'application/x-www-form-urlencoded', Jsonary.location.queryVariant);
		}
		Jsonary.location.replace(newHref);
		extraData = extra || {};
	};

})(Jsonary);