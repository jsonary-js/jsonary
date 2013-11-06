var fs = require('fs');
var http = require('http');
var https = require('https');
var pathModule = require('path');
var urlModule = require('url');

var cookieClient = require('cookie-client');

var bundleModule = require('./create-bundle.js');

function JsonaryBundle() {
	var bundle = bundleModule.js();
	
	var knownPaths = [];
	this.addPath = function (dirs) {
		if (!Array.isArray(dirs)) {
			dirs = [dirs];
		}
		for (var i = 0; i < dirs.length; i++) {
			var dir = dirs[i];
			if (knownPaths.indexOf(dir) !== -1) {
				knownPaths.splice(knownPaths.indexOf(dir), 1);
			}
		}
		knownPaths = dirs.concat(knownPaths);
		return this;
	};
	this.addPath(pathModule.join(__dirname, 'renderers'));
	this.addPath(pathModule.join(__dirname, 'plugins'));
	this.addPath('.');
	
	this.writeJs = function (filename, minified) {
		var compiledJs = bundle.compileJs(filename, minified);
		this.instance = function () {
			var Jsonary = compiledJs()['Jsonary'];
			modifyJsonaryForServer.apply(Jsonary, arguments);
			return Jsonary;
		};
		return this;
	};
	this.writeCss = function (filename, minified) {
		bundle.compileCss(filename, minified);
		return this;
	};
	this.add = function (includePath) {
		if (Array.isArray(includePath)) {
			for (var i = 0; i < includePath.length; i++) {
				this.add(includePath[i]);
			}
			return this;
		}
		var found = false;
		for (var i = 0; !found && i < knownPaths.length; i++) {
			var path = pathModule.join(knownPaths[i], includePath);
			if (fs.existsSync(path)) {
				if (/\.css$/i.test(path)) {
					bundle.css(path);
				} else if (/\.js$/i.test(path)) {
					bundle.js(path);
				} else {
					throw new Error("Unrecognised extension (expected .js/.css): " + path);
				}
				found = true;
			} else {
				if (fs.existsSync(path + ".js")) {
					bundle.js(path + ".js");
					found = true;
				}
				if (fs.existsSync(path + ".css")) {
					bundle.css(path + ".css");
					found = true;
				}
			}
		}
		if (!found) {
			throw new Error("Could not find Jsonary plugin/renderer: " + includePath);
		}
		return this;
	};

	this.add('../core/jsonary-core');
	// Make "Jsonary" available in scope for any additional files
	bundle.code('var Jsonary = this.Jsonary;');
}
JsonaryBundle.prototype = {
	instance: function () {
		this.writeJs(null, true);
		return this.instance();
	}
};

function modifyJsonaryForServer(baseUri, inputPrefix) {
	var Jsonary = this;
	if (baseUri) {
		Jsonary.baseUri = baseUri;
	}
	inputPrefix = inputPrefix || 'Jsonary';

	Jsonary.render.actionUrl = function (args) {
		var inputName = new Buffer(JSON.stringify({
			contextPath: args.context.labelSequence(),
			action: args.actionName,
			params: args.params
		})).toString('base64');
		var parts = canonicalUrl.split('#');
		if (parts[0].indexOf('?') == -1) {
			parts[0] += '?';
		} else {
			parts[0] += '&';
		}
		parts[0] += inputPrefix + '.action=' + inputName;
		return parts.join('#');
	};
	// Yes, I know that the browser also does percent-encoding.
	// However, if we simply escape the HTML, then any lists ([]) get interpreted as properties, and that's just a mess to undo.
	Jsonary.render.actionInputName = function (args) {
		var inputName = new Buffer(JSON.stringify({
			contextPath: args.context.labelSequence(),
			action: args.actionName,
			params: args.params
		})).toString('base64');
		return inputPrefix + ".input:" + inputName;
	};
	
	// Log to console - warnings and errors only
	Jsonary.setLogFunction(function (logLevel, message) {
		if (logLevel >= Jsonary.logLevel.WARNING) {
			if (typeof message !== 'string') {
				try {
					message = JSON.stringify(message);
				} catch (e) {
				}
			}
			console.log("Jsonary " + Jsonary.logLevel[logLevel] + ": " + message);
		}
	});

	Jsonary.server = {
		httpAgent: null,
		httpsAgent: null,
		cookies: cookieClient()
	};
	
	Jsonary.server.performActions = function (context, query, body) {
		var needsReRender = false;
		// Execute inputs first, then actions
		for (var key in body) {
			if (key.substring(0, (inputPrefix + ".input:").length) == (inputPrefix + ".input:")) {
				needsReRender = true;
				var base64 = key.substring((inputPrefix + ".input:").length);
				try {
					var actionJson = new Buffer(base64, 'base64').toString();
					var actionArgs = JSON.parse(actionJson);
				} catch (e) {
					console.log("malformed " + inputPrefix + ".input:" + base64);
					continue;
				}
				var actionContext = context.labelSequenceContext(actionArgs.contextPath);
				if (actionContext) {
					var result = actionContext.actionArgs(actionArgs.action, [body[key]].concat(actionArgs.params));
				} else {
					console.log("Could not find input action context for: " + actionArgs.contextPath);
				}
			}
		}
		for (var key in body) {
			if (key.substring(0, (inputPrefix + ".action:").length) == (inputPrefix + ".action:")) {
				needsReRender = true;
				var base64 = key.substring((inputPrefix + ".action:").length);
				try {
					var actionJson = new Buffer(base64, 'base64').toString();
					var actionArgs = JSON.parse(actionJson);
				} catch (e) {
					console.log("malformed " + inputPrefix + ".action:" + base64);
					continue;
				}
				var actionContext = context.labelSequenceContext(actionArgs.contextPath);
				if (actionContext) {
					var result = actionContext.actionArgs(actionArgs.action, actionArgs.params);
				} else {
					console.log("Could not find action context for: " + actionArgs.contextPath);
				}
			}
		}
		for (var key in query) {
			if (key == inputPrefix + '.action') {
				needsReRender = true;
				var base64 = query[inputPrefix + '.action'];
				try {
					var actionJson = new Buffer(base64, 'base64').toString();
					var actionArgs = JSON.parse(actionJson);
				} catch (e) {
					console.log("malformed " + inputPrefix + ".action:" + base64);
					continue;
				}
				var actionContext = context.labelSequenceContext(actionArgs.contextPath);
				if (actionContext) {
					var result = actionContext.actionArgs(actionArgs.action, actionArgs.params);
				} else {
					console.log("Could not find action context for: " + actionArgs.contextPath);
				}
			}
		}
		return needsReRender;
	};

	// TODO: make this part of Jsonary, so we can include things like createValue() callbacks and other async stuff
	// Is there anything async that doesn't include a request?  Possibly not.
	// Maybe just keep it in Jsonary.server, then.
	var requestCount = 0;
	var requestCompleteCallbacks = [];
	Jsonary.server.whenRequestsComplete = function (callback) {
		requestCompleteCallbacks.push(callback);
		checkRequestsComplete();
	};
	function checkRequestsComplete() {
		if (requestCount > 0) {
			return;
		}
		while (requestCompleteCallbacks.length > 0) {
			process.nextTick(requestCompleteCallbacks.shift());
		}
	}
	
	Jsonary.render.getElementById = function () {
		return null;
	};
	
	// Make an actual HTTP request, defaulting to the current server if just path is given
	Jsonary.ajaxFunction = function (params, callback) {
		requestCount++;
		var options = urlModule.parse(params.url);
		var isHttps = (options.protocol == 'https' || options.protocol == 'https:');
		var httpModule = isHttps ? https : http;
		options.method = params.method;
		var cookieString = Jsonary.server.cookies.cookieStringForRequest(options.hostname, options.path, isHttps);
		options.headers = {
			'content-type': params.encType,
		};
		for (var key in params.headers) {
			options.headers[key] = params.headers[key];
		}
		if (cookieString) {
			options.headers['cookie'] = cookieString;
		}
		options.agent = isHttps ? Jsonary.server.httpsAgent : Jsonary.server.httpAgent;
		
		Jsonary.log(Jsonary.logLevel.DEBUG, params.method +" " + params.url);
		var request = httpModule.request(options, function (response) {
			Jsonary.server.cookies.addFromHeaders(response.headers, {domain: options.hostname, path: options.path});
			Jsonary.log(Jsonary.logLevel.DEBUG, "done: " + params.method +" " + params.url);
			var data;
			response.setEncoding('utf8'); // Encoding is required
			response.on('data', function (chunk) {
				data = data ? data + chunk : chunk;
			});
			response.on('end', function () {
				handleResponse(response, data);
			});
		}).on('error', function (e) {
			Jsonary.log(Jsonary.logLevel.DEBUG, params.method +": " + params.url + " error");
			Jsonary.log(Jsonary.logLevel.DEBUG, {
				request: params,
				error: e
			});
			callback(e, e, '');
			requestCount--;
			checkRequestsComplete();
		});
		if (params.data != undefined) {
			request.write(params.data);
		}
		request.end();
		
		function handleResponse(response, data) {
			var headerText = [];
			for (var key in response.headers) {
				if (Array.isArray(response.headers[key])) {
					for (var i = 0; i < response.headers[key].length; i++) {
						headerText.push(key + ": " + response.headers[key][i]);
					}
				} else {
					headerText.push(key + ": " + response.headers[key]);
				}
			}
			headerText = headerText.join("\r\n");

			if (response.statusCode >= 200 && response.statusCode < 300) {
				try {
					data = JSON.parse(data);
				} catch (e) {
					if (response.statusCode !=204) {
						callback(e, data, headerText);
						checkRequestsComplete();
						return;
					} else {
						data = null;
					}
				}
				callback(null, data, headerText);
			} else {
				try {
					data = JSON.parse(data);
				} catch (e) {
				}
				callback(new Jsonary.HttpError(response.statusCode, response), data, headerText);
			}
			requestCount--;
			checkRequestsComplete();
		}
	};
}

module.exports = new JsonaryBundle();
module.exports.fresh = function () {
	return new JsonaryBundle();
};
