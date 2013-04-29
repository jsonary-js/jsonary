(function (publicApi) {
	var util = require('util');
	var http = require('http');
	var fs = require('fs');
	var path = require('path');
	var querystring = require('querystring');
	
	var ent = require('ent');
	var mime = require('mime');
	var jstl = require('jstl');
	
	var JSON_MEDIA_TYPE = /^application\/([a-zA-Z+]\+)?json(;.*)?/;
	
	var counter = 0;
	function DocumentShard(executeFunction, defaultToDone, includeFunction) {
		var thisCounter = this.counter = counter++;
		if (!executeFunction) {
			throw new Error;
		}
		
		var thisShard = this;
		var queue = [];
		var bufferString = "";
		var callbacks = null;
		
		this.include = includeFunction;
		
		this.echo = function (string) {
			if (queue.length == 0 && callbacks && string) {
				callbacks.data(string);
			} else {
				bufferString += string;
			}
		};
		function resultIsError(error) {
			queue = [];
			if (callbacks && callbacks.finished) {
				callbacks.finished(error);
			} else {
				thisShard.callbacks = function (dc, fc) {
					process.nextTick(function () {
						fc(error);
					});
					return this;
				};
			}
			callbacks.data = callbacks.finished = function () {};
		}
		function shardComplete(error) {
			if (error) {
				resultIsError(error);
				return;
			}
			queue.shift();
			moveToNextShard();
		}
		function moveToNextShard() {
			if (bufferString) {
				queue.push(bufferString);
				bufferString = "";
			}
			while (queue.length > 0) {
				if (queue[0] instanceof DocumentShard) {
					queue[0].callbacks(callbacks.data, shardComplete);
					return;
				} else {
					callbacks.data(queue.shift());
				}
			}
			if (bufferString) {
				callbacks.data(bufferString);
				bufferString = "";
			}
			if (executed && callbacks.finished) {
				callbacks.finished();
				callbacks.finished = false; // Don't call more than once
				callbacks.data = function () {
					throw new Error("Cannot output data once shard is finished");
				};
			}
		}
		this.callbacks = function (dc, fc) {
			callbacks = {
				data: dc,
				finished: fc
			};
			moveToNextShard();
			return this;
		};
		
		this.shard = function (executeFunction, defaultToDone) {
			if (bufferString || (queue.length == 0 && !callbacks)) {
				queue.push(bufferString);
				bufferString = "";
			}

			var shard = new DocumentShard(executeFunction, defaultToDone, includeFunction);
			queue.push(shard);
			if (queue.length == 1) {
				if (callbacks) {
					shard.callbacks(callbacks.data, shardComplete);
				} else {
					shard.callbacks(function (data) {
						queue[0] += data;
					});
				}
			}
			return shard.shard;
		};
		
		var executed = false;
		this.done = function (error) {
			if (error) {
				resultIsError(error);
			}
			executed = true;
			if (callbacks) {
				moveToNextShard();
			}
			this.shard = this.echo = function () {
				throw new Error("Action not allowed after shard is closed");
			};
		};
		this.wait = function () {
			defaultToDone = false;
		};
		this.shard.shard = this.shard;
		this.shard.echo = this.echo;
		this.shard.done = this.done;
		this.shard.wait = this.wait;
		this.shard.include = this.include;
		process.nextTick(function () {
			var result = executeFunction.call(thisShard, thisShard.shard, thisShard.echo);
			if (result instanceof Error) {
				resultIsError(result);
				return;
			}
			if (result || defaultToDone) {
				if (typeof result == "string") {
					thisShard.echo(result);
				}
				thisShard.done();
			}
			if (callbacks) {
				moveToNextShard();
			}
		});
	}
	
	function modelToFilter(model) {
		if (typeof model == "boolean") {
			return function () {
				return model ? {} : false;
			};
		} else if (typeof model == "string") {
			return function (request, response) {
				if (request.path.substring(0, model.length) == model) {
					return {};
				}
				return false;
			};
		} else if (model instanceof RegExp) {
			return function (request, response) {
				return model.exec(request.path);
			}
		}
		return model;
	}
	
	function Handler(model, execFunction) {
		var filter = modelToFilter(model);
		
		this.process = function (request, response, next) {
			var params;
			if (!(params = filter(request, response))) {
				return next();
			}
			request.params = params;
			return execFunction.call(this, request, response, next);
		}
	}
	Handler.prototype = {
		writeShard: function writeShard(request, response, execFunction, doneFunction, includeFunction) {
			if (!doneFunction) {
				doneFunction = function (error) {
					if (error) {
						publicApi.errorPage(500, error, request, response);
						return;
					}
					response.end();
				};
			}
			var shard = new DocumentShard(execFunction, true, includeFunction);
			shard.callbacks(function (data) {
				response.write(data.toString(), 'utf8');
			}, doneFunction);
		}
	};
	
	function CompositeHandler(filter, processFunction) {
		if (!processFunction) {
			processFunction = subHandlers;
		}
		CompositeHandler.super_.call(this, filter, processFunction);
		
		var handlers = [];
		this.addHandler = function (handler) {
			handlers.push(handler);
			return this;
		};
		function subHandlers(request, response, next) {
			var index = 0;
			function tryNextHandler() {
				if (index < handlers.length) {
					var handler = handlers[index++];
					return handler.process(request, response, tryNextHandler);
				}
				next();
			}
			tryNextHandler();
		}
		this.subHandlers = subHandlers;
	}
	util.inherits(CompositeHandler, Handler);
	
	var JSON_MEDIA_TYPE = /^application\/([a-zA-Z0-9+]+)?json(;.*)$/g;
	
	function JstlServer() {
		JstlServer.super_.call(this);
		
		var handlers = [];
		this.addHandler = function handler(handler) {
			handlers.push(handler);
			return this;
		}
		
		this.on('request', function (request, response) {
			var handlerIndex = 0;
			
			function tryNextHandler() {
				if (handlerIndex < handlers.length) {
					var handler = handlers[handlerIndex++];
					return handler.process(request, response, tryNextHandler);
				}
				publicApi.errorPage(404, null, request, response);
			}
			return tryNextHandler();
		});
	}
	util.inherits(JstlServer, http.Server);
	
	publicApi.errorPage = function errorPage(code, error, request, response) {
		var trace = null;
		if (error) {
			trace = error.stack.split("\n");
		}
		var errorDocument = "\n\n" + JSON.stringify({
			statusCode: code,
			statusText: http.STATUS_CODES[code],
			error: util.inspect(error),
			trace: trace
		}, null, '\t');

		if (!response.headersSent) {	
			response.statusCode = code;
			response.removeHeader('Cache-Control');
			response.removeHeader('Last-Modified');
			response.removeHeader('Expires');
			response.setHeader('Content-Type', 'application/json');
			response.setHeader('Content-Length', Buffer.byteLength(errorDocument, 'utf8'));
		}
		response.end(errorDocument, 'utf8');
	};
	
	publicApi.DocumentShard = DocumentShard;
	publicApi.Handler = Handler;
	publicApi.CompositeHandler = CompositeHandler;
	publicApi.createServer = function () {
		var server = new JstlServer();
		server.addHandler(enhanceRequests);
		return server;
	};
	
	var enhanceRequests = new Handler(/.*/, function (request, response, next) {
		request.localPath = ".";
		
		var queryIndex = request.url.indexOf("?");
		if (queryIndex >= 0) {
			request.path = request.url.substring(0, queryIndex);
			request.queryString = request.url.substring(queryIndex + 1);
			request.query = querystring.parse(request.queryString);
		} else {
			request.path = request.url;
			request.queryString = "";
			request.query = {};
		}
		request.params = {};
		if (path.sep != "/") {
			request.path = request.path.split(path.sep).join("/");
		}
		
		request.getData = function (callback) {
			var data = null;
			var dataObj = undefined;
			request.on('data', function (dataPart) {
				data ? (data = dataPart) : (data += dataPart);
			});
			request.on('end', function () {
				var contentType = request.headers['content-type'];
				if (JSON_MEDIA_TYPE.test(contentType)) {
					try {
						dataObj = JSON.parse(data);
					} catch (e) {
					}
				} else if (contentType == "application/x-www-form-urlencoded") {
					dataObj = querystring.parse(data);
				}
				request.getData = function (callback) {
					callback(null, dataObj || data, data);
				};
				callback(null, dataObj || data, data);
			});
		};
		next();
	});
	
	publicApi.directoryHandler = function (webPath, localPath) {
		if (webPath.charAt(webPath.length - 1) != "/") {
			webPath += "/";
		}
		if (localPath.charAt(localPath.length - 1) != "/") {
			localPath += "/";
		}
		var filter = function (request, response) {
			return request.path.substring(0, webPath.length) == webPath;
		};
		
		return new CompositeHandler(filter, function (request, response, next) {
			var oldWebPath = request.path;
			var oldLocalPath = request.localPath;
			
			var remainder = request.path.substring(webPath.length - 1);
			remainder = path.normalize(remainder).replace(/^(\.\.\/)*/g, "");

			request.path = remainder;
			request.localPath = path.resolve(request.localPath, localPath);
			if (path.sep != "/") {
				request.path = request.path.split(path.sep).join("/");
				request.localPath = request.localPath.split(path.sep).join("/");
			}
			
			this.subHandlers(request, response, function () {
				request.path = oldWebPath;
				request.localPath = oldLocalPath;
				next();
			});
		});
	};
	
	publicApi.fileReader = function (model, fileHandler, indexFiles) {
		var filter = modelToFilter(model);
		
		return new Handler(filter, function (request, response, next) {
			var thisHandler = this;
			if (request.path.charAt(request.path.length - 1) == "/") {
				next();
			}
			var filePath = request.path;
			if (filePath.charAt(0) == "/") {
				filePath = filePath.substring(1);
			}
			filePath = path.resolve(request.localPath, filePath);
			fs.readFile(filePath, function (error, buffer) {
				if (error) {
					if (error.code == 'ENOENT' || error.code == 'ENOTDIR' || error.code == 'EISDIR') {
						return next();
					}
					throw error;
				}
				return fileHandler.call(thisHandler, request, response, buffer, next);
			});
		});
	};
	
	publicApi.indexFiles = function (model, indexFiles) {
		var filter = modelToFilter(model);
		if (indexFiles == undefined) {
			indexFiles = [];
		}
		
		return new CompositeHandler(filter, function (request, response, next) {
			if (request.path.charAt(request.path.length - 1) != "/") {
				return this.subHandlers(request, response, next);
			}
			var thisHandler = this;
			var index = 0;
			var oldPath = request.path;
			function tryNextIndex() {
				request.path = oldPath;
				if (index >= indexFiles.length) {
					return next();
				}
				request.path += indexFiles[index++];
				thisHandler.subHandlers(request, response, tryNextIndex);
			}
			return tryNextIndex();
		});
	};
	
	publicApi.cacheControl = function (filter, params) {
		var cacheControlParams = [];
		if (params['max-age'] = (params['max-age'] || params['maxAge'])) {
			cacheControlParams.push("max-age=" + params['max-age']);
		}
		if (params['s-max-age'] = (params['s-max-age'] || params['sMaxAge'])) {
			cacheControlParams.push("s-max-age=" + params['s-max-age']);
		}
		if (params['public']) {
			cacheControlParams.push("public");
		}
		if (params['private']) {
			cacheControlParams.push("private");
		}
		if (params['no-cache'] = (params['no-cache'] || params['noCache'])) {
			cacheControlParams.push("noCache");
		}
		if (params['no-store'] = (params['no-store'] || params['noStore'])) {
			cacheControlParams.push("no-store");
		}
		if (params['must-revalidate'] = (params['must-revalidate'] || params['mustRevalidate'])) {
			cacheControlParams.push("must-revalidate");
		}
		if (params['proxy-revalidate'] = (params['proxy-revalidate'] || params['proxyRevalidate'])) {
			cacheControlParams.push("proxy-revalidate");
		}
		var cacheHeader = cacheControlParams.join(", ");

		var handler = new Handler(filter, function (request, response, next) {
			if (params['max-age']) {
				var expiresDate = new Date;
				expiresDate.setSeconds(expiresDate.getSeconds() + params['max-age']);
				response.setHeader("Expires", expiresDate.toUTCString());
			}
			response.setHeader("Cache-Control", cacheHeader);
			next();
		});
		return handler;
	};
	publicApi.cacheControl.presets = {
		staticFiles: {
			maxAge: 3600,
			"public": true,
			"private": true,
			"must-revalidate": false
		},
		short: {
			maxAge: 60
		}
	};
	
	var handlers = {};
	publicApi.handlers = handlers;
	
	handlers.plain = publicApi.indexFiles(true, ["index.html", "index.htm"]);
	handlers.plain.addHandler(new Handler(true, function (request, response, next) {
		var modifiedSince = null;
		if (request.headers['if-modified-since']) {
			modifiedSince = new Date(request.headers['if-modified-since']);
		}
		var filePath = request.localPath + request.url;
		var filePath = fs.stat(filePath, function (error, stat) {
			if (error) {
				return next();
			}
			if (modifiedSince && (stat.mtime <= modifiedSince)) {
				response.statusCode = 304;
				response.end();
				return;
			}
			response.fileModified = stat.mtime;
			next();
		});
	}));
	handlers.plain.addHandler(publicApi.fileReader(true, function (request, response, buffer, next) {
		var mimeType = mime.lookup(request.path);
		response.setHeader('Content-Type', mimeType);
		response.setHeader('Content-Length', buffer.length);
		if (response.fileModified) {
			response.setHeader('Last-Modified', response.fileModified.toUTCString());
		}
		response.end(buffer);
	}));


	handlers.jstl = (function () {
		var includeDirs = [];
		var jstlCache = {};
		var cacheMilliseconds = 10000;
		function deleteTimeout(path) {
			return setTimeout(function() {
				delete jstlCache[path];
			}, cacheMilliseconds);
		}
		function setCached(path, template) {
			var entry;
			if (entry = jstlCache[path]) {
				clearTimeout(entry.timeout);
				entry.timeout = deleteTimeout(path);
				return;
			}
			jstlCache[path] = {
				template: template,
				when: new Date,
				timeout: deleteTimeout(path)
			};
		}
		function getCached(path) {
			var entry = jstlCache[path];
			if (entry) {
				clearTimeout(entry.timeout);
				entry.timeout = deleteTimeout(path);
			}
			return entry;
		}
		
		function compileTemplate(scriptPath, string) {
			var headerText = [
				"var shard = arguments[0];",
				"var echo = arguments[1];",
				"var request = arguments[2];",
				"var response = arguments[3];"
			].join("\n");
			var predefinedVars = {
				ent: ent,
				require: require,
				echo: null
			};
			var directExpressionFunction = function (varName) {
				if (varName.substring(0, 2) == "=:") {
					return "ent.encode(JSON.stringify(" + varName.substring(2) + ", null, '\u00a0\u00a0\u00a0\u00a0')).replace(/\\n/g, '<br>')";
				} else if (varName.charAt(0) == "=") {
					return "ent.encode('' + (" + varName.substring(1) + "))";
				} else if (varName.charAt(0) == "%") {
					return "encodeURIComponent('' + (" + varName.substring(1) + "))";
				} else if (varName.charAt(0) == ":") {
					return "JSON.stringify(" + varName.substring(1) + ", null, '\t')";
				} else if (varName.charAt(0) == "*") {
					return "('' + (" + varName.substring(1) + "))";
				}
			};
			var template = jstl.create(string).compile(directExpressionFunction, headerText, predefinedVars);
			return template;
		}
		
		function getTemplateForFile(scriptPath, callback) {
			var cached = getCached(scriptPath);
			if (!cached) {
				return loadFromFile();
			}
			fs.stat(scriptPath, function (error, stats) {
				if (error) {
					return callback(error);
				}
				if (stats.mtime >= cached.when) {
					loadFromFile();
				}
				var template = cached.template;
				callback(null, template);
			});
			
			function loadFromFile() {
				fs.readFile(scriptPath, {encoding: 'utf8'}, function (error, templateCode) {
					if (error) {
						return callback(error);
					}
					var template = compileTemplate(scriptPath, templateCode);
					setCached(scriptPath, template);
					callback(null, template);
				})
			}
		}
		
		var handleFile = new publicApi.indexFiles(true, ["index.jshtml"]);
		handleFile.addHandler(new Handler(true, function (request, response, next) {
			var thisHandler = this;
			var scriptPath = request.localPath + request.path;
			var scriptDir = path.dirname(scriptPath);
			
			function include(includeFilename, callback) {
				if (!callback) {
					callback = function (error, result, shard, echo) {};
				}
				var includePaths = [path.resolve(scriptDir, includeFilename)];
				for (var i = 0; i < includeDirs.length; i++) {
					includePaths.push(path.resolve(includeDirs[i], includeFilename));
				}
				this.shard(function (shard, echo) {
					function tryNext() {
						var includeFilename = includePaths.shift();
						getTemplateForFile(includeFilename, function (error, template) {
							if (error) {
								if (includePaths.length && (error.code == 'ENOENT' || error.code == 'ENOTDIR' || error.code == 'EISDIR')) {
									return tryNext();
								}
							}
						
							// First shard holds include output
							shard(function (shard, echo) {
								var result;
								if (!error) {
									result = template.call(this, shard, echo, request, response);
								}

								// Create a new shard in the callback shard to hold the actual callback response
								// Note: we can't just use the existing shard, as we wouldn't know whether to close it or not
								callbackShard.shard(function (shard, echo) {
									callback.call(shard, error, result, shard, echo);
								}, true);
								// Close the callback shard
								callbackShard.done();
							}, true);
						
							// Second shard holds callback output
							var callbackShard = shard(function (shard, echo) {
							});
							shard.done();
						});
					}
					tryNext();
				});
			}

			getTemplateForFile(scriptPath, function (error, template) {
				if (error) {
					return next();
				}
				response.setHeader('Content-Type', 'text/html');
				thisHandler.writeShard(request, response, function (shard, echo) {
					return template.call(this, shard, echo, request, response);
				}, null, include);
			});
		}));
		
		var result = new Handler(/(\.jshtml(\/.*)?|\/$)/i, function (request, response, next) {
			var origNext = next;
			var extIndex = request.path.toLowerCase().indexOf(".jshtml/");
			if (extIndex != -1) {
				var oldPath = request.path;
				var oldPathSuffix = request.pathSuffix;
				request.pathSuffix = oldPath.substring(extIndex + 7);
				request.path = oldPath.substring(0, extIndex + 7);
				next = function () {
					request.path = oldPath;
					if (oldPathSuffix === undefined) {
						delete request.pathSuffix;
					} else {
						request.pathSuffix = oldPathSuffix;
					}
					origNext();
				};
			}
			return handleFile.process(request, response, next);
		});
		result.addIncludeDir = function addIncludeDir(dir) {
			includeDirs.push(dir);
			return this;
		}
		return result;
	})();
		
})(module.exports);