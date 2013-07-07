var express = require('express');
var bundle = require('./create-bundle.js');

var app = express();
app.use(express.bodyParser());
var jsonaryJs = [
	'../jsonary.js',
	['var Jsonary = this.Jsonary;'],
	'../renderers/plain.jsonary.js',
	'../renderers/string-formats.js'
];
var jsonaryJsBundle = bundle.js(jsonaryJs, 'bundle.js');
var createJsonary = function () {
	var Jsonary = jsonaryJsBundle()['Jsonary'];
	/*
	Jsonary.render.actionUrl = function (context, actionName) {
		return "?contextId=" + context.uniqueId + "&actionName=" + encodeURIComponent(actionName);
	};
	*/
	Jsonary.render.actionHtml = function (elementId, linkUrl, innerHtml) {
		var textValue = innerHtml.replace(/<.*?>/g, "");
		var result = '<input type="submit" id="button-' + elementId + '" name="' + elementId + '" value="' + Jsonary.escapeHtml(textValue) + '"></input>';
		result += '<script>';
		result += 'var button = document.getElementById(' + JSON.stringify("button-" + elementId) + ');'
		result += 'button.style.display="none";';
		result += 'var link = document.createElement("a");';
		result += 'link.setAttribute("href", ' + JSON.stringify(linkUrl) + ');';
		result += 'link.innerHTML = ' + JSON.stringify(innerHtml) + ';';
		result += 'link.style.textDecoration = "none";';
		result += 'link.onclick = function () {';
		result += 	'document.getElementById(' + JSON.stringify("button-" + elementId) + ').click();';
		result += 	'return false;';
		result += '};';
		result += 'button.parentNode.insertBefore(link, button);';
		result += '</script>';
		return result;
	};
	return Jsonary;
};

var jsonaryCss = [
	'../renderers/plain.jsonary.css'
];
var jsonaryCssBundle = bundle.plain(jsonaryCss, 'bundle.css');
app.all('/', function (request, response) {
	// Temporary: refresh bundle each time
	jsonaryJsBundle = bundle.js(jsonaryJs, 'bundle.js');
	
	var Jsonary = createJsonary();

	var renderContext, data;
	if (request.body['Jsonary.state']) {
		var savedState = JSON.parse(request.body['Jsonary.state']);
		var loaded = Jsonary.render.loadCompleteState(savedState);
		renderContext = loaded.context;
		for (var key in request.body) {
			if (loaded.inputs[key]) {
				console.log("Executing input from " + key);
				loaded.inputs[key](request.body[key]);
			}
		}
		console.log(Object.keys(request.body));
		for (var key in request.body) {
			if (loaded.actions[key]) {
				console.log("Executing action from " + key);
				loaded.actions[key]();
			}
		}
		data = renderContext.data;
	} else {
		data = Jsonary.create({
			"title": "Test object " + Math.floor(Math.random()*10000),
			"data": [
				null,
				true,
				15.5,
				"test"
			]
		});
	}
	
	var html = '<link rel="stylesheet" href="bundle.css">';
	html += '<form action="?" method="POST">';
	if (renderContext) {
		html += renderContext.renderHtml(data);
	} else {
		html += Jsonary.renderHtml(data, {}, function (context) {
			renderContext = context;
		});
	}
	var renderState = JSON.stringify(renderContext.saveCompleteState());
	// Escape for single-quotes (more efficient for JSON)
	var escapedRenderState = renderState.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');
	html += '\n<input name="Jsonary.state" type="hidden" value=\'' + escapedRenderState + '\'></input>';
	html += '</form>';
	html += '<!--' + Math.random() + '-->';
	html += '<hr><pre>';
	html += JSON.stringify(renderContext.saveCompleteState(), null, '\t');
	html += '</pre>';
	response.setHeader('Content-Type', 'text/html');
	
	response.send(html);
});
app.get('/bundle.css', function (request, response) {
	response.setHeader('Content-Type', 'text/plain');
	response.send(jsonaryCssBundle);
});
app.listen(8080);
console.log('Listening on port 8080');