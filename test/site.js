var express = require('express');
var url = require('url');
var http = require('http');
var https = require('https');
var bundle = require('./create-bundle.js');

var app = express();
app.use(express.bodyParser());

var jsonaryJsBundle;
function createBundles() {
	var masterBundle = bundle.css([
			'../renderers/common.css',
			'../renderers/plain.jsonary.css'
		])
		.js([
			// Replacement for jsonary.js, assembled from individual files
			'../jsonary/_compatability.js',
			'../jsonary/_header.js',
			'../jsonary/uri.js',
			'../jsonary/uri-template.js',
			'../jsonary/utils.js',
			'../jsonary/monitors.js',
			'../jsonary/request.js',
			'../jsonary/patch.js',
			'../jsonary/data.js',
			'../jsonary/schema.js',
			'../jsonary/schemamatch.js',
			'../jsonary/schemaset.js',
			'../jsonary/main.js',
			'../jsonary/_footer.js',
			'../plugins/jsonary.render.js',
			'../plugins/jsonary.render.js',
		])
		.code('var Jsonary = this.Jsonary;')

		// http://json-schema.org/ meta-schemas
		.js('../jsonary/_cache-json-schema-org.js')

		// Renderers
		.js([
			'../renderers/plain.jsonary.js',
			'../renderers/list-links.js',
			'../renderers/string-formats.js'
		])
		// Extra plugins
		.js('../plugins/jsonary.location.js')
		.js('../plugins/jsonary.render.table.js')
		.css('../plugins/jsonary.render.table.css')
		.js('../plugins/jsonary.render.generate.js')
		.js('../renderers/contributed/adaptive-table.js');
	
	masterBundle.compileCss('bundle.css');
	masterBundle.compileCss('bundle.min.css', true);
	jsonaryJsBundle = masterBundle.compileJs('bundle.js');
	jsonaryJsBundle = masterBundle.compileJs('bundle.min.js', true);
}
createBundles();

var createJsonary = function () {
	var Jsonary = jsonaryJsBundle()['Jsonary'];
	Jsonary.setLogFunction(function (logLevel, message) {
		if (logLevel >= Jsonary.logLevel.WARNING) {
			console.log("Jsonary " + Jsonary.logLevel[logLevel] + ": " + message);
		}
	});
	var buttons = [];
	Jsonary.render.actionHtml = function (elementId, linkUrl, innerHtml) {
		var textValue = innerHtml.replace(/<.*?>/g, "");
		var result = '<input type="submit" id="button-' + elementId + '" name="' + elementId + '" value="' + Jsonary.escapeHtml(textValue) + '"></input>';
		buttons.push({
			elementId: elementId,
			linkUrl: linkUrl,
			innerHtml: innerHtml
		});
		return result;
	};
	
	// TODO: make this part of Jsonary, so we can include things like createValue() callbacks and other async stuff
	var requestCount = 0;
	var requestCompleteCallbacks = [];
	Jsonary.whenRequestsComplete = function (callback) {
		requestCompleteCallbacks.push(callback);
		checkRequestsComplete();
	};
	function checkRequestsComplete() {
		if (requestCount > 0) {
			return;
		}
		while (requestCompleteCallbacks.length > 0) {
			requestCompleteCallbacks.shift()();
		}
	}
	
	Jsonary.ajaxFunction = function (params, callback) {
		requestCount++;
		// Make an actual HTTP request, defaulting to the current server if just path is given
		var uri = new Jsonary.Uri(params.url);
		var httpModule = (uri.scheme == 'https') ? https : http;
		var options = {};
		if (uri.domain) {
			options.domain = uri.domain;
			options.host = options.domain;
			options.path = params.url.split('://').slice(1).join('://');
		} else {
			options.domain = 'localhost';
			options.port = SERVER_PORT;
			options.path = params.url;
		}
		options.method = params.method;
		options.headers = {
			'content-type': params.encType
		};
		
		var request = httpModule.request(options, function (response) {
			var data;
			response.setEncoding('utf8'); // Encoding is required
			response.on('data', function (chunk) {
				data = data ? data + chunk : chunk;
			});
			response.on('end', function () {
				handleResponse(response, data);
			});
		}).on('error', function (e) {
			console.log({
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
					for (var i = 0; i < respons.headers[key].length; i++) {
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
	Jsonary.render.footerHtml = function () {
		result = "";
		result += '<script>';
		result += '(function (buttons) {';
		result += 	'var replaceButton = function (elementId, linkUrl, innerHtml) {';
		result += 		'var button = document.getElementById("button-" + elementId);'
		result += 		'button.style.display="none";';
		result += 		'var link = document.createElement("a");';
		result += 		'link.setAttribute("href", linkUrl);';
		result += 		'link.innerHTML = innerHtml;';
		result += 		'link.className = "jsonary-action";';
		result += 		'link.onclick = function () {';
		result += 			'document.getElementById("button-" + elementId).click();';
		result += 			'return false;';
		result += 		'};';
		result += 		'button.parentNode.insertBefore(link, button);';
		result += 	'};';
		result += 	'for (var i = 0; i < buttons.length; i++) {';
		result += 		'replaceButton(buttons[i].elementId, buttons[i].linkUrl, buttons[i].innerHtml);';
		result += 	'}';
		result += '})(' + JSON.stringify(buttons) + ');';
		result += '</script>';
		return result;
	};
	return Jsonary;
};

var encodingVariant = "dotted";
app.all('/', function (request, response) {
	// Reset bundles on every request
	createBundles();
	
	response.setHeader('Content-Type', 'text/html');
	var Jsonary = createJsonary();

	var renderContext;
	Jsonary.render.saveData = function (data, saveDataId) {
		return data.document.uniqueId + ":" + data.pointerPath();
	};
	response.write('<pre>' + Jsonary.escapeHtml(JSON.stringify(request.body, null, 4)) + '</pre>');
	if (request.body['Jsonary.state']) {
		var savedState = JSON.parse(request.body['Jsonary.state']);
		Jsonary.render.loadDocumentsFromState(savedState, function (error, documents) {
			Jsonary.render.loadData = function (saveDataId) {
				var parts = saveDataId.split(":");
				var document = documents[parts.shift()];
				var path = parts.join(':');
				if (document) {
					return document.raw.subPath(path);
				}
			}
			var loaded = Jsonary.render.loadCompleteState(savedState);
			renderContext = loaded.context;
			for (var key in loaded.inputs) {
				console.log("Executing input from " + key + ": " + JSON.stringify(request.body[key]));
				loaded.inputs[key](request.body[key]);
			}
			for (var key in request.body) {
				if (loaded.actions[key]) {
					console.log("Executing action from " + key);
					loaded.actions[key]();
				}
			}
			Jsonary.whenRequestsComplete(function () {
				renderContext.asyncRerenderHtml(handleInnerHtml);
			});
		});
	} else {
		Jsonary.asyncRenderHtml("/json/data", Jsonary.decodeData(url.parse(request.url).query || '', 'application/x-www-form-urlencoded', encodingVariant), handleInnerHtml);
	}
	
	function handleInnerHtml(error, innerHtml, renderContext) {
		var html = '';
		html += '<link rel="stylesheet" href="bundle.css">';
		var savedState = renderContext.saveState();
		html += '<form action="?' + Jsonary.encodeData(savedState, 'application/x-www-form-urlencoded', encodingVariant) + '" method="POST">';
		html += innerHtml;
		html += Jsonary.render.footerHtml();
		var completeState = renderContext.saveCompleteState();
		// Escape for single-quotes (more efficient for JSON)
		var escapedRenderState = JSON.stringify(completeState).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');
		html += '\n<input name="Jsonary.state" type="hidden" value=\'' + escapedRenderState + '\'></input>';
		html += '</form>';
		
		/*/
		html += '<hr><div id="jsonary-target"></div>';
		html += '<script src="bundle.js"></script>';
		html += '<script>';
		html += 	'Jsonary.location.queryVariant = ' + JSON.stringify(encodingVariant) + ';';
		html += 	'var renderContext = Jsonary.render("jsonary-target", "json/data", ' + JSON.stringify(savedState) + ');';
		html += 	'var changeMonitor = Jsonary.location.onChange(function () {';
		html += 		'renderContext = Jsonary.render("jsonary-target", "json/data", Jsonary.location.query.value());';
		html += 	'}, false);';
		html += 	'Jsonary.render.addActionHandler(function (context, data, actionName, historyPoint) {';
		html += 		'if (historyPoint) {';
		html += 			'Jsonary.location.addHistoryPoint();';
		html += 		'}';
		html += 		'changeMonitor.ignore(function () {';
		html += 			'Jsonary.location.query.setValue(renderContext.saveState());';
		html += 		'});';
		html += 	'});';
		html += '</script>';
		//*/

		html += '<hr><pre>';
		html += JSON.stringify(renderContext.saveCompleteState(), null, '\t');
		html += '</pre>';
		
		response.end(html);
	}
});

var exampleData = {
	title: "Example JSON data",
	"boolean": true,
	array: [
		{a: 1, b: 2},
		{a: 1, b: 3},
		{a: 2, b: 3}
	]
};
function prettyJson(data) {
	var json = JSON.stringify(data, null, "\t");
	function compactJson(json) {
		try {
			var compact = JSON.stringify(JSON.parse(json));
			var parts = compact.split('"');
			for (var i = 0; i < parts.length; i++) {
				var part = parts[i];
				part = part.replace(/:/g, ': ');
				part = part.replace(/,/g, ', ');
				parts[i] = part;
				i++;
				while (i < parts.length && parts[i].charAt(parts[i].length - 1) == "\\") {
					i++;
				}
			}
			return parts.join('"');
		} catch (e) {
			return json;
		}
	}
	
	json = json.replace(/\{[^\{,}]*\}/g, compactJson); // Objects with a single simple property
	json = json.replace(/\[[^\[,\]]*\]/g, compactJson); // Arrays with a single simple item
	json = json.replace(/\[[^\{\[\}\]]*\]/g, compactJson); // Arrays containing only scalar items
	return json;
}
app.use('/json/', function (request, response) {
	response.setHeader('Content-Type', 'application/json');
	var path = request.url.split('?')[0];
	if (path == "/data") {
		if (request.method == 'PUT') {
			exampleData = request.body;
		}
		response.setHeader('Content-Type', 'application/json; profile=schema');
		response.send(prettyJson(exampleData, null, "\t"));
	} else if (path == "/schema") {
		response.setHeader('Content-Type', 'application/json; profile=schema');
		response.send(prettyJson({
			title: "Example JSON Schema",
			links: [
				{
					href: "",
					rel: "edit"
				}
			],
			type: "object",
			properties: {
				"title": {type: "string"},
				"boolean": {type: "boolean"},
				"array": {
					type: "array",
					items: {
						type: "object",
						properties: {
							"a": {type: "integer", minimum: 0},
							"b": {type: "integer"}
						}
					}
				},
				"enum": {"enum": ["one", "two", "three", "orange"]}
			},
			required: ["title", "array"]
		}, null, "\t"));
	} else {
		response.statusCode = 404;
		response.send(JSON.stringify({
			statusCode: 404,
			statusText: "Not Found",
			message: "Resource not found: " + request.url,
			data: {url: request.url}
		}, null, "\t"));
	}
});

app.use('/', express.static(__dirname));

var SERVER_PORT = 8080;
http.createServer(app).listen(SERVER_PORT);
console.log('Listening on port 8080');