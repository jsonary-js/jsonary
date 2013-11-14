var fs = require('fs');
var http = require('http');
var https = require('https');
var pathModule = require('path');
var urlModule = require('url');

var cookieClient = require('cookie-client');

var bundleModule = require('./create-bundle.js');

function JsonaryBundle(startingPoint) {
	var bundle = bundleModule.js();
	startingPoint = startingPoint || '../core/jsonary-core';
	
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

	this.add(startingPoint);
	// Make "Jsonary" available in scope for any additional files
	bundle.code('var Jsonary = this.Jsonary;');
}
JsonaryBundle.prototype = {
	instance: function () {
		this.writeJs(null, true);
		return this.instance.apply(null, arguments);
	}
};

function modifyJsonaryForServer(baseUri, inputPrefix) {
	var Jsonary = this;
	Jsonary.config.accessImmediately = true;
	Jsonary.baseUri = baseUri || '';
	inputPrefix = inputPrefix || 'Jsonary';

	Jsonary.server = {
		httpAgent: null,
		httpsAgent: null,
		cookies: cookieClient(),
		pageUri: Jsonary.baseUri
	};

	Jsonary.render.actionUrl = function (args) {
		var inputName = new Buffer(JSON.stringify({
			contextPath: args.context.labelSequence(),
			action: args.actionName,
			params: args.params
		})).toString('base64');
		var parts = Jsonary.server.pageUri.split('#');
		if (parts[0].indexOf('?') == -1) {
			if (parts[0].indexOf('?') !== parts[0].length - 1) {
				parts[0] += '?';
			}
		} else {
			parts[0] += '&';
		}
		parts[0] += inputPrefix + '.action=' + inputName;
		return parts.join('#');
	};
	
	var inputContexts = [];
	function buttonActionsForContext(context) {
		return inputContexts.length > 0;
	}
	Jsonary.server.canRedirect = function () {
		return inputContexts.length == 0 && Object.keys(savedData).length == 0;
	};

	var buttonReplacementHtml = [];
	Jsonary.server.reset = function (pageUri) {
		savedData = {};
		inputContexts = [];
		buttonReplacementHtml = [];
		if (typeof pageUri !== 'undefined') {
			Jsonary.server.pageUri = pageUri;
		}
	};
	
	// Yes, I know that the browser also does percent-encoding.
	// However, if we simply escape the HTML, then any lists ([]) get interpreted as properties, and that's just a mess to undo.
	Jsonary.render.actionInputName = function (args) {
		inputContexts = [true];
		var inputName = new Buffer(JSON.stringify({
			contextPath: args.context.labelSequence(),
			action: args.actionName,
			params: args.params
		})).toString('base64');
		return inputPrefix + ".input:" + inputName;
	};
	
	var delayedActionRegex = /<<ACTION[0-9.]+>>/g;
	var delayedActionHtml = {};
	
	Jsonary.render.actionHtml = function (elementId, innerHtml, args) {
		var replacement = "<<ACTION" + Math.random() + ">>";
		delayedActionHtml[replacement] = {
			elementId: elementId,
			innerHtml: innerHtml,
			args: args
		};
		return replacement;
	};
	function linkActionHtml(elementId, innerHtml, args) {
		return '<a class="jsonary-action" href="' + args.linkUrl + '">' + innerHtml + '</a>';
	};
	function buttonActionHtml(elementId, innerHtml, args) {
		var textValue = innerHtml.replace(/<.*?>/g, "");
		var inputName = new Buffer(JSON.stringify({
			contextPath: args.context.labelSequence(),
			action: args.actionName,
			params: args.params
		})).toString('base64');
		// Yes, I know that the browser also does percent-encoding.
		// However, if we simply escape the HTML, then any lists ([]) get interpreted as properties, and that's just a mess to undo.
		var result = '<input type="submit" id="' + elementId + '" name="' + inputPrefix + '.action:' + inputName + '" value="' + Jsonary.escapeHtml(textValue) + '"></input>';
		buttonReplacementHtml.push({
			elementId: elementId,
			linkUrl: args.linkUrl,
			innerHtml: innerHtml
		});
		return result;
	};

	Jsonary.server.footerHtml = function () {
		// Button substitution
		var result = "";
		result += '<script>';
		result += '(function (buttons) {';
		result += 	'var replaceButton = function (elementId, linkUrl, innerHtml) {';
		result += 		'var button = document.getElementById(elementId);'
		result +=		'if (!button) {';
		result += 			'return;';
		result += 		'}';
		result += 		'button.style.display="none";';
		result += 		'var link = document.createElement("a");';
		result += 		'link.setAttribute("href", linkUrl);';
		result += 		'link.innerHTML = innerHtml;';
		result += 		'link.className = "jsonary-action";';
		result += 		'link.onclick = function () {';
		result += 			'button.click();';
		result += 			'return false;';
		result += 		'};';
		result += 		'button.parentNode.insertBefore(link, button);';
		result += 	'};';
		result += 	'for (var i = 0; i < buttons.length; i++) {';
		result += 		'replaceButton(buttons[i].elementId, buttons[i].linkUrl, buttons[i].innerHtml);';
		result += 	'}';
		result += '})(' + JSON.stringify(buttonReplacementHtml) + ');';
		result += '</script>';
		return result;
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

	var savedData = {};
	Jsonary.server.loadSavedData = function (body) {
		var dataJsonArray = body[inputPrefix + '.data'];
		if (dataJsonArray) {
			dataJsonArray = Array.isArray(dataJsonArray) ? dataJsonArray : [dataJsonArray];
			for (var i = 0; i < dataJsonArray.length; i++) {
				try {
					var parsed = JSON.parse(dataJsonArray[i]);
				} catch (e) {
					Jsonary.log(Jsonary.logLevel.ERROR, "malformed " + inputPrefix + ".data[" + i + "] " + dataJsonArray[i]);
				}
				for (var key in parsed) {
					savedData[key] = parsed[key];
				}
			}
		}
	};
	Jsonary.render.loadData = function (saveDataId) {
		var documentId = saveDataId.split(":")[0];
		var dataPath = saveDataId.substring(documentId.length + 1);
		if (savedData["doc" + documentId] !== undefined) {
			var doc = Jsonary.inflate(savedData["doc" + documentId]);
			return doc.root.subPath(dataPath);
		}
	}
	Jsonary.render.saveData = function (data, saveDataId) {
		var documentId = data.document.uniqueId;
		if (savedData["doc" + documentId] === undefined) {
			savedData["doc" + documentId] = data.document.deflate();
		}
		return documentId + ":" + data.pointerPath();
	};
	Jsonary.asyncRenderHtml.postTransform = (function (oldFunction) {
		return function (error, innerHtml, renderContext, callback) {
			if (!error) {
				innerHtml = innerHtml.replace(delayedActionRegex, function (string) {
					if (delayedActionHtml[string]) {
						var obj = delayedActionHtml[string];
						if (obj.userOnly || buttonActionsForContext(obj.args.context)) {
							return buttonActionHtml(obj.elementId, obj.innerHtml, obj.args);
						} else {
							return linkActionHtml(obj.elementId, obj.innerHtml, obj.args);
						}
					}
					return string;
				});
			
				//savedData = {};
				var savedUiState = renderContext.saveUiState();
				if (Object.keys(savedData).length > 0) {
					innerHtml += '<input type="hidden" name="' + inputPrefix + '.data[]" value=\'' + Jsonary.escapeHtml(JSON.stringify(savedData), true) + '\'>';
				}
			}
			oldFunction.call(this, error, innerHtml, renderContext, callback);
		};
	})(Jsonary.asyncRenderHtml.postTransform);
	
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
					Jsonary.log(Jsonary.logLevel.ERROR, "malformed " + inputPrefix + ".input:" + base64);
					continue;
				}
				var actionContext = context.labelSequenceContext(actionArgs.contextPath);
				if (actionContext) {
					var result = actionContext.actionArgs(actionArgs.action, [body[key]].concat(actionArgs.params));
				} else {
					Jsonary.log(Jsonary.logLevel.ERROR, "Could not find input action context for: " + actionArgs.contextPath);
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
					Jsonary.log(Jsonary.logLevel.ERROR, "malformed " + inputPrefix + ".action:" + base64);
					continue;
				}
				var actionContext = context.labelSequenceContext(actionArgs.contextPath);
				if (actionContext) {
					var result = actionContext.actionArgs(actionArgs.action, actionArgs.params);
				} else {
					Jsonary.log(Jsonary.logLevel.ERROR, "Could not find action context for: " + actionArgs.contextPath);
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
					Jsonary.log(Jsonary.logLevel.ERROR, "malformed " + inputPrefix + ".action:" + base64);
					continue;
				}
				var actionContext = context.labelSequenceContext(actionArgs.contextPath);
				if (actionContext) {
					var result = actionContext.actionArgs(actionArgs.action, actionArgs.params);
				} else {
					Jsonary.log(Jsonary.logLevel.ERROR, "Could not find action context for: " + actionArgs.contextPath);
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
		process.nextTick(function () {
			if (requestCount > 0) {
				return;
			}
			while (requestCompleteCallbacks.length > 0) {
				requestCompleteCallbacks.shift()();
			}
		});
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
module.exports.superBundle = function () {
	return new JsonaryBundle('../super-bundle/jsonary-super-bundle.js');
};