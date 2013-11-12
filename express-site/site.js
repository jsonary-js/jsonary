var express = require('express');
var url = require('url');
var http = require('http');
var https = require('https');
var path = require('path');
var jsonaryBundle = require('../node-package/jsonary-bundle');
var prettyJson = require('./prettyJson');

var classes = require('./classes.js');
var mysqlPool = require('./mysql-connect-to-pool.js');

var app = express();
app.use(express.bodyParser());

var jsonaryJsBundle;
function createBundles() {
	var bundle = jsonaryBundle.fresh().addPath(__dirname);
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

	// Site-specific renderers
	bundle.add('renderers/site');
	bundle.add('renderers/demo-code');
	bundle.add('renderers/markdown-hack');
	
	bundle.writeCss(__dirname + '/public/bundle.css');
	//bundle.writeCss(__dirname + '/bundle.min.css', true);
	bundle.writeJs(__dirname + '/public/bundle.js');
	//bundle.writeJs(__dirname + '/bundle.min.js', true);
	return bundle;
}
var jsonaryJsBundle = createBundles();

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

app.get('/json/pages/', function (request, response, next) {
	var cached = classes.cacheWithPool(mysqlPool);
	
	cached.Page.search({}, function (err, results) {
		if (err) {
			return next(err);
		}

		response.setHeader('Content-Type', 'application/json');
		
		response.send(prettyJson(results));
	});
});

app.get('/json/pages/:name', function (request, response, next) {
	var timer = LogTimer('json - get page');
	var cached = classes.cacheWithPool(mysqlPool);
	
	cached.Page.open(request.params.name, function (err, result) {
		timer.event('fetched from MySQL');
		if (err) {
			return next(err);
		}

		response.setHeader('Content-Type', 'application/json; profile=/json/schemas/page');
		if (!result) {
			result = new classes.Page();
			result.name = request.params.name;
			result.title = request.params.name;
			result.content = ["Page does not exist"];
		}
		response.send(prettyJson(result));
		timer.done();
	});
});

app.put('/json/pages/:name', function (request, response, next) {
	var timer = LogTimer('json - put page');
	var cached = classes.cacheWithPool(mysqlPool);
	
	cached.Page.open(request.params.name, function (err, result) {
		timer.event('fetched from MySQL');
		if (err) {
			return next(err);
		}

		if (!result) {
			result = new classes.Page();
			result.title = request.params.name;
			result.content = ["Page does not exist"];
		}
		for (var key in request.body) {
			if (typeof result[key] !== 'undefined') {
				result[key] = request.body[key];
			}
		}
		result.name = request.params.name;
		timer.event('merged data');
		cached.Page.save(result, function (err, saveResult) {
			timer.event('saved');
			if (err) {
				return next(err);
			}
			response.setHeader('Content-Type', 'application/json; profile=/json/schemas/page');
			response.send(prettyJson(result));
			timer.done();
		});
	});
});

app.use('/json/schemas/', function (request, response, next) {
	console.log('schema: ' + request.url);
	response.set('Content-Type', 'application/json');
	response.links({
		describedby: "http://json-schema.org/hyper-schema"
	});
	request.url += ".json";
	next();
});
app.use('/json/schemas/', express.static(__dirname + '/json/schemas'));

var jsonData = {
	"title": "Jsonary",
	"topContent": "[download](/get-started.zip) and get started",
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
		},
		{
			"title": "Using data",
			"tabs": "pages/data"
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

app.use('/', express.static(__dirname + "/public"));
app.use('/get-started.zip', function (request, response) {
	response.sendfile(path.join(__dirname, '../get-started.zip'));
});

app.get('/test', function (request, response) {
	var params = {
		protocol: request.protocol,
		hostname: request.host.split(':')[0],
		port: (!HIDE_PORT && SERVER_PORT.toString() != "80") ? SERVER_PORT : null,
		pathname: '/'
	};
	var baseUri = url.format(params);
	response.json({
		baseUri: baseUri,
		params: params
	});
});

var defaultJsonPage = '/json/';
app.use('/', function (request, response, next) {
	if (request.path !== '/'
		&& request.path.substring(0, 7) !== '/pages/'
		 && request.path.substring(0, 5) !== '/api/') {
		return next();
	}
	var timer = LogTimer('page');
	
	response.setHeader('Content-Type', 'text/html');
	var baseUri = url.format({
		protocol: request.protocol,
		hostname: request.host.split(':')[0],
		port: (!HIDE_PORT && SERVER_PORT != 80) ? SERVER_PORT : null,
		pathname: '/'
	});
	console.log(baseUri);
	var Jsonary = jsonaryJsBundle.instance(baseUri, 'Jsonary');
	timer.event('create Jsonary');

	Jsonary.server.loadSavedData(request.body);
	timer.event('extract stored data');

	var strippedUrl = request.url.replace(/&?Jsonary\.action=[^&]+/, "");
	var uiState = Jsonary.location.uiStateFromUrl(strippedUrl);
	Jsonary.server.pageUri = Jsonary.location.urlFromUiState(uiState);
	
	Jsonary.asyncRenderHtml(defaultJsonPage, uiState, {withComponent: ['LIST_LINKS', 'WHOLE_PAGE']}, function (error, innerHtml, renderContext) {
		timer.event('first render');
		var needsReRender = Jsonary.server.performActions(renderContext, request.query, request.body);
		timer.event('inputs/actions');
		
		if (needsReRender) {
			var uiState = renderContext.saveUiState();
			var newPageUri = Jsonary.location.urlFromUiState(uiState);
			if (Jsonary.server.canRedirect()) {
				console.log("Redirecting:" + newPageUri);
				return response.redirect(newPageUri);
			}
			// TODO: replace link URLs *after* rendering, because rendering can actually change the uiState
			Jsonary.server.reset(newPageUri);
			Jsonary.server.whenRequestsComplete(function () {
				timer.event('requests complete, starting re-render');
				renderContext.asyncRerenderHtml(handleInnerHtml);
			});
		} else {
			handleInnerHtml(error, innerHtml, renderContext);
		}
	});
	
	function handleInnerHtml(error, innerHtml, renderContext) {
		var savedUiState = renderContext.saveUiState();

		timer.event('render complete');

		var html = '<!DOCTYPE html>'
		html += '<html>';
		html += 	'<head>';
		html += 		'<title>' + Jsonary.escapeHtml(Jsonary.pageTitle || '???') + '</title>';
		html += 		'<link rel="stylesheet" href="/bundle.css">';
		html += 	'</head>';
		html += 	'<body>';
		if (request.query.htmlOnly) {
			var stateCopy = JSON.parse(JSON.stringify(savedUiState));
			delete stateCopy.htmlOnly;
			html += 		'<a id="html-only-switcher" href="' + Jsonary.location.urlFromUiState(stateCopy) + '">enable AJAX client</a>';
		} else {
			var stateCopy = JSON.parse(JSON.stringify(savedUiState));
			stateCopy.htmlOnly = true;
			html += 		'<a id="html-only-switcher" href="' + Jsonary.location.urlFromUiState(stateCopy) + '">disable AJAX client</a>';
		}

		/*/
		html += '<pre>GET: <code>' + Jsonary.escapeHtml(prettyJson(request.query)) + '</code></pre>';
		html += '<pre>POST: <code>' + Jsonary.escapeHtml(prettyJson(request.body)) + '</code></pre>';
		//*/
		
		html += '<div id="jsonary-target">';
		html += '<form action="' + Jsonary.location.urlFromUiState(savedUiState) + '" method="POST">';
		html += innerHtml;
		html += '</form>';
		html += Jsonary.server.footerHtml(); // Single set of cleanup code, even if there are multiple renders
		html += '</div>';
		timer.event('saved state');
		
		html += '<script src="/js/prism/prism.js"></script>';
		html += '<link rel="stylesheet" href="/js/prism/prism.css">';
		if (Jsonary.server.canRedirect() && !request.query.htmlOnly) {
			//*/ JavaScript browser
			html += '<script src="/bundle.js"></script>';
			html += '<script src="/js/ace/ace.js"></script>';
			html += ['<script>',
						'Jsonary.location.queryVariant = ' + JSON.stringify(Jsonary.location.queryVariant) + ';',
						'Jsonary.location.replace(' + JSON.stringify(Jsonary.location.urlFromUiState(savedUiState)) + ');',
						'var renderContext;',
						'var changeMonitor = Jsonary.location.onChange(function () {',
							'var uiState = Jsonary.location.uiStateFromUrl(Jsonary.location.trailing);',
							'renderContext = Jsonary.render("jsonary-target", ' + JSON.stringify(defaultJsonPage) + ', uiState, {',
								'withComponent: ["LIST_LINKS", "WHOLE_PAGE"]',
							'});',
						'});',
						'Jsonary.render.addActionHandler(function (context, data, actionName, historyPoint) {',
							'if (historyPoint) {',
								'Jsonary.location.addHistoryPoint();',
							'}',
							'changeMonitor.ignore(function () {',
								'var uiState = renderContext.saveState();',
								'Jsonary.location.replace(Jsonary.location.urlFromUiState(uiState));',
							'});',
						'});',
					'</script>']
				.join("\n");
		}
		//*/
		
		html += '</body></html>';
		response.end(html);
		timer.done();
	}
});

var HIDE_PORT = !!process.env.HIDE_PORT;
var SERVER_PORT = process.env.PORT || 8083;
http.createServer(app).listen(SERVER_PORT);
console.log('Listening on port ' + SERVER_PORT);