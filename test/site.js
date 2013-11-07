var express = require('express');
var url = require('url');
var http = require('http');
var https = require('https');
//require('../assemble-package'); // reset all bundles
var jsonaryBundle = require('../node-package/jsonary-bundle');

var app = express();
app.use(express.bodyParser());

var jsonaryJsBundle;
function createBundles() {
	var bundle = jsonaryBundle.fresh();
	// extra plugins and renderers
	bundle.add('../plugins/jsonary.location');
	bundle.add('../plugins/jsonary.undo');
	bundle.add('../plugins/jsonary.jstl');
	bundle.add('../plugins/jsonary.render.table');
	bundle.add('../plugins/jsonary.render.generate');
	bundle.add('../renderers/string-formats');
	bundle.add('../renderers/contributed/full-preview');
	bundle.add('../renderers/contributed/full-instances');
	bundle.add('../renderers/contributed/adaptive-table');
	bundle.add('../renderers/contributed/markdown');

	// Site-specific renderers
	bundle.add('renderers/site');
	
	bundle.writeCss('bundle.css');
	//bundle.writeCss('bundle.min.css', true);
	bundle.writeJs('bundle.js');
	//bundle.writeJs('bundle.min.js', true);
	return bundle;
}
var jsonaryJsBundle = createBundles();

var createJsonary = function () {
	var Jsonary = jsonaryJsBundle.instance('http://localhost:8080/', 'Jsonary');
	
	var buttons = [];
	Jsonary.render.clearButtons = function () {
		buttons = [];
	};
	Jsonary.render.actionHtml = function (elementId, innerHtml, args) {
		var textValue = innerHtml.replace(/<.*?>/g, "");
		var inputName = new Buffer(JSON.stringify({
			contextPath: args.context.labelSequence(),
			action: args.actionName,
			params: args.params
		})).toString('base64');
		// Yes, I know that the browser also does percent-encoding.
		// However, if we simply escape the HTML, then any lists ([]) get interpreted as properties, and that's just a mess to undo.
		var result = '<input type="submit" id="button-' + elementId + '" name="Jsonary.action:' + inputName + '" value="' + Jsonary.escapeHtml(textValue) + '"></input>';
		buttons.push({
			elementId: elementId,
			linkUrl: args.linkUrl,
			innerHtml: innerHtml
		});
		return result;
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
	//Jsonary.location.queryVariant = 'dotted';
	return Jsonary;
};

function LogTimer(timerName) {
	if (!(this instanceof LogTimer)) {
		return new LogTimer(timerName);
	}
	var firstTime = Date.now();
	var lastTime = firstTime;
	this.reset = function () {
		firstTime = lastTime = Date.now();
	};
	this.event = function (eventName) {
		var newTime = Date.now();
		console.log(timerName + ": " + eventName + ": " + (newTime - lastTime) + "ms");
		lastTime = newTime;
	};
	this.done = function () {
		var newTime = Date.now();
		console.log(timerName + ": " + (newTime - firstTime) + "ms total");
		lastTime = newTime;
	};
	console.log(timerName + ": started timer");
}
LogTimer.prototype = {
};

var defaultJsonPage = '/json/';
app.all('/', function (request, response) {
	function urlForUiState(uiState) {
		return '?' + Jsonary.encodeData(uiState, 'application/x-www-form-urlencoded', Jsonary.location.queryVariant);
	}

	var timer = LogTimer('request');
	
	response.setHeader('Content-Type', 'text/html');
	var Jsonary = createJsonary();
	timer.event('create Jsonary');

	response.write('<pre>GET: <code>' + Jsonary.escapeHtml(prettyJson(request.query)) + '</code></pre>');
	response.write('<pre>POST: <code>' + Jsonary.escapeHtml(prettyJson(request.body)) + '</code></pre>');

	Jsonary.server.loadSavedData(request.body);
	timer.event('extract stored data');

	var strippedUrl = request.url.replace(/&?Jsonary\.action=[^&]+/, "");
	var uiState = Jsonary.decodeData(url.parse(strippedUrl).query || '', 'application/x-www-form-urlencoded', Jsonary.location.queryVariant);
	canonicalUrl = urlForUiState(uiState);
	
	Jsonary.asyncRenderHtml(defaultJsonPage, uiState, {withComponent: 'WHOLE_PAGE'}, function (error, innerHtml, renderContext) {
		timer.event('first render');
		var needsReRender = Jsonary.server.performActions(renderContext, request.query, request.body);
		timer.event('inputs/actions');
		
		if (needsReRender) {
			var uiState = renderContext.saveUiState();
			console.log(uiState);
			// TODO: replace link URLs *after* rendering, because rendering can actually change the uiState
			canonicalUrl = urlForUiState(uiState);
			Jsonary.server.whenRequestsComplete(function () {
				timer.event('requests complete, starting re-render');
				console.log(renderContext.saveUiState());
				Jsonary.render.clearButtons();
				renderContext.asyncRerenderHtml(handleInnerHtml);
			});
		} else {
			handleInnerHtml(error, innerHtml, renderContext);
		}
	});
	
	function handleInnerHtml(error, innerHtml, renderContext) {
		timer.event('render complete');

		console.log(renderContext.saveUiState());

		var html = '';
		
		html += '<link rel="stylesheet" href="bundle.css">';
		Jsonary.server.clearData();
		var savedUiState = renderContext.saveUiState();
		html += '<form action="' + urlForUiState(savedUiState) + '" method="POST">';
		html += innerHtml;
		html += Jsonary.render.footerHtml();
		html += '<input type="hidden" name="Jsonary.data" value=\'' + Jsonary.escapeHtml(JSON.stringify(Jsonary.server.savedData), true) + '\'>';
		html += '</form>';
		timer.event('saved state');
		
		//*/
		html += '<hr><div id="jsonary-target"></div>';
		html += '<script src="https://cdnjs.cloudflare.com/ajax/libs/pagedown/1.0/Markdown.Converter.min.js"></script>';
		html += '<script src="https://cdnjs.cloudflare.com/ajax/libs/pagedown/1.0/Markdown.Sanitizer.min.js"></script>';
		html += '<script src="bundle.js"></script>';
		html += '<script>';
		html += 	'Jsonary.location.queryVariant = ' + JSON.stringify(Jsonary.location.queryVariant) + ';';
		html += 	'Jsonary.location.replace(' + JSON.stringify(urlForUiState(savedUiState)) + ');'
		html += 	'var renderContext;';
		html += 	'var changeMonitor = Jsonary.location.onChange(function () {';
		html += 		'renderContext = Jsonary.render("jsonary-target", ' + JSON.stringify(defaultJsonPage) + ', Jsonary.location.query.value(), {'
		html += 		'withComponent: "WHOLE_PAGE"';
		html += 	'});';
		html += 	'});';
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
		html += JSON.stringify(Jsonary.server.savedData, null, '\t');
		html += '</pre>';
		response.end(html);
		timer.done();
	}
});

function prettyJson(data, indent) {
	var indent = indent || '\t';
	if (Array.isArray(data)) {
		if (data.length === 0) {
			return '[]';
		} else if (data.length === 1) {
			return '[' + prettyJson(data[0], indent) + ']';
		} else {
			var singleLine = true;
			var parts = [];
			for (var i = 0; i < data.length; i++) {
				var subJson = prettyJson(data[i], indent);
				parts[i] = subJson;
				if (subJson.indexOf('\n') !== -1) {
					singleLine = false;
				}
			}
			if (singleLine && parts.length <= 5) {
				return '[' + parts.join(', ') + ']';
			} else {
				var result = '[';
				for (var i = 0; i < parts.length; i++) {
					if (i > 0) {
						result += ',';
					}
					result += '\n' + indent + parts[i].replace(/\n/g, '\n' + indent);
				}
				return result + '\n]';
			}
		}
	} else if (data && typeof data === 'object') {
		var keys = Object.keys(data);
		if (keys.length === 0) {
			return '{}';
		}
		if (keys.length > 10) {
			keys.sort();
		}
		if (keys.length === 1) {
			var part = prettyJson(data[keys[0]], indent);
			if (part.indexOf('\n') === -1) {
				return '{' + JSON.stringify(keys[0]) + ": " + part + '}';
			} else {
				return '{\n' + indent + JSON.stringify(keys[0]) + ": " + part.replace(/\n/g, '\n' + indent); + '\n}';
			}
		} else {
			var result = "{";
			for (var i = 0; i < keys.length; i++) {
				if (i > 0) {
					result += ',';
				}
				result += '\n' + indent + JSON.stringify(keys[i]);
				result += ': ' + prettyJson(data[keys[i]], indent).replace(/\n/g, '\n' + indent);
			}
			return result + '\n}';
		}
	}
	return JSON.stringify(data, null, '\t');
}
app.use('/json/schemas/', function (request, response, next) {
	response.set('Content-Type', 'application/json');
	response.links({
		describedby: "http://json-schema.org/hyper-schema"
	});
	next();
});
app.use('/json/schemas/', express.static(__dirname + '/json/schemas'));

var jsonData = {
	"title": "Jsonary",
	"topContent": "[download](https://github.com/geraintluff/jsonary/raw/master/get-started-bundle.zip) and get started",
	"sections": [
		{
			"title": "Features and goals",
			"tabs": "pages/features-and-goals"
		},
		{
			"title": "Examples",
			"tabs": "pages/examples"
		},
		{
			"title": "API",
			"tabs": "api/"
		}
	]
};
app.get('/json/', function (request, response, next) {
	response.set('Content-Type', 'application/json');
	response.links({
		describedby: "schemas/site"
	});
	response.send(prettyJson(jsonData));
});
app.put('/json/', function (request, response, next) {
	response.set('Content-Type', 'application/json');
	jsonData = request.body;
	response.links({
		describedby: "schemas/site"
	});
	response.send(prettyJson(jsonData));
});

app.use('/json/', function (request, response) {
	response.setHeader('Content-Type', 'application/json');
	var path = request.url.split('?')[0];
	if (path == "/data") {
		if (request.method == 'PUT') {
			exampleData = request.body;
		}
		response.setHeader('Content-Type', 'application/json; profile=schema');
		response.send(prettyJson(exampleData));
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
		}));
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