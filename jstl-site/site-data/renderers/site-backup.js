function jstpl(template) {
	var constants = [];
	var variables = [];
	
	var substitutionFunctionName = "subFunc" + Math.floor(Math.random()*1000000000);
	var resultVariableName = "result" + Math.floor(Math.random()*1000000000);
	var jscode = '(function (' + substitutionFunctionName + ') {\n';
	jscode += '	var ' + resultVariableName + ' = "";\n';
	
	var parts = template.split("{{");
	var initialString = parts.shift();
	while (parts.length > 0) {
		var part = parts.shift();
		var endIndex = part.indexOf("}}");
		var variable = part.substring(0, endIndex);
		var constant = part.substring(endIndex + 2);
		jscode += '	' + resultVariableName + ' += ' + substitutionFunctionName + '(' + JSON.stringify(variable) + ');\n';
		jscode += '	' + resultVariableName + ' += ' + JSON.stringify(constant) + ';\n';
	}
	jscode += '	return ' + resultVariableName + ';\n';
	jscode += '})';
	
	return eval(jscode);
}

var templateMap = {};
function loadTemplates() {
	var scripts = document.getElementsByTagName("script");
	var lastScript = scripts[scripts.length - 1];
	var url = lastScript.getAttribute("src");

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, false);
	xhr.send();
	processTemplates(xhr.responseText);
}
function getTemplate(key) {
	var template = templateMap[key];
	if (template == null) {
		throw new Exception("Could not locate template: " + key);
	}
	var templateFunction = jstpl(template);
	return function (data, context) {
		return templateFunction(function (variableName) {
			return context.renderHtml(data.subPath(variableName));
		});
	};
}
function processTemplates(code) {
	var result = {};
	var parts = code.split(/\/\*\s*[Tt]emplate:/);
	parts.shift();
	for (var i = 0; i < parts.length; i++) {
		var part = parts[i];
		part = part.substring(0, part.indexOf("*/"));
		var endOfLine = part.indexOf("\n");
		var key = part.substring(0, endOfLine).trim();
		var template = part.substring(endOfLine + 1);
		templateMap[key] = template;
	}
	return result;
}
loadTemplates();

/* Template: schemas/page.json
<h2>{{/title}}</h2>
{{/blocks}}
*/
Jsonary.render.register({
	renderHtml: getTemplate("schemas/page.json"),
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json");
	}
});

/* Template: schemas/page.json#/definitions/block
<div class="content-block">
	<h3>{{/title}}</h3>
	{{/content}}
</div>
*/
Jsonary.render.register({
	renderHtml: getTemplate("schemas/page.json#/definitions/block"),
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json#/definitions/block");
	}
});