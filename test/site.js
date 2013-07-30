var express = require('express');
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
		])
		.code('var Jsonary = this.Jsonary;')
		.js([
			// Renderers
			'../renderers/plain.jsonary.js',
			'../renderers/list-links.js',
			'../renderers/string-formats.js'
		])
		// Extra plugins
		.js('../plugins/jsonary.render.table.js')
		.css('../plugins/jsonary.render.table.css')
		.js('../plugins/jsonary.render.generate.js')
		.js('../renderers/contributed/adaptive-table.js');
	
	masterBundle.compileCss('bundle.css');
	jsonaryJsBundle = masterBundle.compileJs('bundle.js');
}
createBundles();

var createJsonary = function () {
	var Jsonary = jsonaryJsBundle()['Jsonary'];
	Jsonary.setLogFunction(function (logLevel, message) {
		console.log("Log level " + logLevel + ": " + message);
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
	
	Jsonary.ajaxFunction = function (params, callback) {
		setTimeout(function () {
			callback(null, {
				title: "Example JSON data",
				links: [
					{
						href: "",
						rel: "edit"
					}
				],
				array: [
					{a: 1, b: 2},
					{a: 1, b: 3},
					{a: 2, b: 3}
				],
				properties: {
					"array": {
						type: "array",
						items: {
							type: "object",
							properties: {
								"a": {type: "integer"},
								"b": {type: "integer"}
							}
						}
					}
				}
			}, "Content-Type: application/json; profile=/json/schema");
		}, 0);
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

app.all('/', function (request, response) {
	// Reset bundles on every request
	createBundles();
	
	response.setHeader('Content-Type', 'text/html');
	var Jsonary = createJsonary();

	var renderContext;
	Jsonary.render.saveData = function (data, saveDataId) {
		return data.document.uniqueId + ":" + data.pointerPath();
	};
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
			renderContext.rerenderHtml(handleInnerHtml);
		});
	} else {
		Jsonary.asyncRenderHtml("/json/data", {}, handleInnerHtml);
	}
	
	function handleInnerHtml(error, innerHtml, renderContext) {
		var html = '';
		html += '<link rel="stylesheet" href="bundle.css">';
		var savedState = renderContext.saveState();
		html += '<form action="?' + Jsonary.encodeData(savedState, 'application/x-www-form-urlencoded') + '" method="POST">';
		html += innerHtml;
		html += Jsonary.render.footerHtml();
		var renderState = JSON.stringify(renderContext.saveCompleteState());
		// Escape for single-quotes (more efficient for JSON)
		var escapedRenderState = renderState.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');
		html += '\n<input name="Jsonary.state" type="hidden" value=\'' + escapedRenderState + '\'></input>';
		html += '</form>';
		html += '<!--' + Math.random() + '-->';
		
		html += '<hr><div id="jsonary-target"></div>';
		html += '<script src="bundle.js"></script>';
		html += '<script>Jsonary.create({"test": "string"}).renderTo("jsonary-target");</script>';

		html += '<hr><pre>';
		html += JSON.stringify(renderContext.saveCompleteState(), null, '\t');
		html += '</pre>';
		
		response.end(html);
	}
});
app.use('/', express.static(__dirname));
app.listen(8080);
console.log('Listening on port 8080');