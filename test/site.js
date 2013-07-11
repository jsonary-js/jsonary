var express = require('express');
var bundle = require('./create-bundle.js');

var app = express();
app.use(express.bodyParser());
var jsonaryJs = [
	'../jsonary.js',
	['var Jsonary = this.Jsonary;'],
	'../renderers/plain.jsonary.js',
	'../renderers/list-links.js',
	'../renderers/string-formats.js'
];
var jsonaryJsBundle = bundle.js(jsonaryJs, 'bundle.js');
var createJsonary = function () {
	var Jsonary = jsonaryJsBundle()['Jsonary'];
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
	
	Jsonary.ajaxFunction = function (params, callback) {
		return callback(null, {
			title: "Example JSON data",
			links: [
				{
					"href": "",
					"rel": "edit"
				}
			]
		}, "Content-Type: application/json; profile=/json/schema");
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
		result += 		'link.style.textDecoration = "none";';
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

var jsonaryCss = [
	'../renderers/common.css',
	'../renderers/plain.jsonary.css'
];
var jsonaryCssBundle = bundle.plain(jsonaryCss, 'bundle.css');
app.all('/', function (request, response) {
	// Reset bundle on every request
	jsonaryJsBundle = bundle.js(jsonaryJs, 'bundle.js');
	
	response.setHeader('Content-Type', 'text/html');
	var Jsonary = createJsonary();

	var renderContext, data;
	var documents = {};
	Jsonary.render.saveData = function (data, saveDataId) {
		return data.document.uniqueId + ":" + data.pointerPath();
	};
	Jsonary.render.loadData = function (saveDataId) {
		console.log(saveDataId);
		var parts = saveDataId.split(":");
		var document = documents[parts.shift()];
		var path = parts.join(':');
		if (document) {
			return document.raw.subPath(path);
		}
	}
	if (request.body['Jsonary.state']) {
		var savedState = JSON.parse(request.body['Jsonary.state']);
		documents = Jsonary.render.loadDocumentsFromState(savedState);
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
	if (renderContext) {
		var savedState = renderContext.saveState();
		html += '<form action="?' + Jsonary.encodeData(savedState, 'application/x-www-form-urlencoded') + '" method="POST">';
		html += renderContext.rerenderHtml();
	} else {
		html += '<form action="?" method="POST">';
		html += Jsonary.renderHtml("/json/data", {}, function (context) {
			renderContext = context;
		});
	}
	html += Jsonary.render.footerHtml();
	var renderState = JSON.stringify(renderContext.saveCompleteState());
	// Escape for single-quotes (more efficient for JSON)
	var escapedRenderState = renderState.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');
	html += '\n<input name="Jsonary.state" type="hidden" value=\'' + escapedRenderState + '\'></input>';
	html += '</form>';
	html += '<!--' + Math.random() + '-->';
	html += '<hr><pre>';
	html += JSON.stringify(renderContext.saveCompleteState(), null, '\t');
	html += '</pre>';
	
	response.end(html);
});
app.get('/bundle.css', function (request, response) {
	response.setHeader('Content-Type', 'text/plain');
	response.send(jsonaryCssBundle);
});
app.listen(8080);
console.log('Listening on port 8080');