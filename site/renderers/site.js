function jstpl(template, directEvalFunction, constFunctions) {
	var constants = [];
	var variables = [];
	
	var substitutionFunctionName = "subFunc" + Math.floor(Math.random()*1000000000);
	var resultVariableName = "result" + Math.floor(Math.random()*1000000000);
	var jscode = '(function () {\n';
	
	var directFunctions = [];
	var directFunctionVarNames = [];
	var parts = template.split("<?");
	var initialString = parts.shift();
	if (constFunctions) {
		for (var key in constFunctions) {
			var argName = "cfn" + Math.floor(Math.random()*10000000000);
			directFunctionVarNames.push(argName);
			directFunctions.push(constFunctions[key]);
			jscode += '	var ' + key + ' = ' + argName + '.apply(this, arguments);\n';
		}
	}
	jscode += '	var ' + resultVariableName + ' = ' + JSON.stringify(initialString) + ';\n';
	while (parts.length > 0) {
		var part = parts.shift();
		if (part.substring(0, 2) == "js") {
			part = part.substring(2);
		}
		var endIndex = part.indexOf("?>");
		var embeddedCode = part.substring(0, endIndex);
		var constant = part.substring(endIndex + 2);
		
		if (/\s/.test(embeddedCode.charAt(0))) {
			jscode += "\n" + embeddedCode + "\n";
		} else {
			var argName = "fn" + Math.floor(Math.random()*10000000000);
			directFunctionVarNames.push(argName);
			directFunctions.push(directEvalFunction(embeddedCode));
			jscode += "\n\t" + resultVariableName + " += " + argName + ".apply(this, arguments);\n";
		}
		
		jscode += '	' + resultVariableName + ' += ' + JSON.stringify(constant) + ';\n';
	}
	jscode += '\n	return ' + resultVariableName + ';\n})';
	
	console.log(jscode);
	
	var f = Function.apply(null, directFunctionVarNames.concat(["return " + jscode]));
	return f.apply(null, directFunctions);
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
	var templateFunction = jstpl(template, function (path) {
		return function (data, context) {
			return context.renderHtml(data.subPath(path));
		};
	}, {
		want: function (data, context) {
			return function (path) {
				var subData = data.subPath(path);
				return subData.defined() || !subData.readOnly();
			};
		}
	});
	return templateFunction;
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

//--------------
loadTemplates();

/* Template: schemas/page.json
<h2><?/title?></h2>
<?/blocks?>
*/
Jsonary.render.register({
	renderHtml: getTemplate("schemas/page.json"),
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json");
	}
});

/* Template: schemas/page.json#/definitions/block
<div class="content-block">
	<?js if (want('/title')) { ?>
		<h3><?/title?></h3>
	<?js } ?>
	<?/content?>
</div>
*/
Jsonary.render.register({
	renderHtml: getTemplate("schemas/page.json#/definitions/block"),
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json#/definitions/block");
	}
});