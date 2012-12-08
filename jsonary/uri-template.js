var uriTemplateGlobalModifiers = {
	"+": true,
	"#": true,
	".": true,
	"/": true,
	";": true,
	"?": true,
	"&": true
};
var uriTemplateSuffices = {
	"*": true
};

function uriTemplateSubstitution(spec) {
	var modifier = "";
	if (uriTemplateGlobalModifiers[spec.charAt(0)]) {
		modifier = spec.charAt(0);
		spec = spec.substring(1);
	}
	var separator = ",";
	var prefix = "";
	var shouldEscape = true;
	var showVariables = false;
	if (modifier == '+') {
		shouldEscape = false;
	} else if (modifier == ".") {
		prefix = ".";
		separator = ".";
	} else if (modifier == "/") {
		prefix = "/";
		separator = "/";
	} else if (modifier == '#') {
		prefix = "#";
		shouldEscape = false;
	} else if (modifier == ';') {
		prefix = ";";
		separator = ";",
		showVariables = true;
	} else if (modifier == '?') {
		prefix = "?";
		separator = "&",
		showVariables = true;
	} else if (modifier == '&') {
		prefix = "&";
		separator = "&",
		showVariables = true;
	}

	var varNames = [];
	var varList = spec.split(",");
	var varSpecs = [];
	for (var i = 0; i < varList.length; i++) {
		var varSpec = varList[i];
		var truncate = null;
		if (varSpec.indexOf(":") != -1) {
			var parts = varSpec.split(":");
			varSpec = parts[0];
			truncate = parseInt(parts[1]);
		}
		var suffices = {};
		while (uriTemplateSuffices[varSpec.charAt(varSpec.length - 1)]) {
			suffices[varSpec.charAt(varSpec.length - 1)] = true;
			varSpec = varSpec.substring(0, varSpec.length - 1);
		}
		varSpecs.push({
			truncate: truncate,
			name: varSpec,
			suffices: suffices
		});
		varNames.push(varSpec);
	}
	var resultFunction = function (valueFunction) {
		var result = prefix;
		for (var i = 0; i < varSpecs.length; i++) {
			var varSpec = varSpecs[i];
			if (i > 0) {
				result += separator;
			}
			var value = valueFunction(varSpec.name);
			if (Array.isArray(value)) {
				if (showVariables) {
					result += varSpec.name + "=";
				}
				for (var j = 0; j < value.length; j++) {
					if (j > 0) {
						result += varSpec.suffices['*'] ? separator : ",";
						if (varSpec.suffices['*'] && showVariables) {
							result += varSpec.name + "=";
						}
					}
					result += shouldEscape ? encodeURIComponent(value[j]).replace("!", "%21"): encodeURI(value[j]).replace("%25", "%");
				}
			} else if (typeof value == "object") {
				if (showVariables && !varSpec.suffices['*']) {
					result += varSpec.name + "=";
				}
				var first = true;
				for (var key in value) {
					if (!first) {
						result += varSpec.suffices['*'] ? separator : ",";
					}
					first = false;
					result += shouldEscape ? encodeURIComponent(key).replace("!", "%21"): encodeURI(key).replace("%25", "%");
					result += varSpec.suffices['*'] ? '=' : ",";
					result += shouldEscape ? encodeURIComponent(value[key]).replace("!", "%21"): encodeURI(value[key]).replace("%25", "%");
				}
			} else {
				if (showVariables) {
					result += varSpec.name + "=";
				}
				if (varSpec.truncate != null) {
					value = value.substring(0, varSpec.truncate);
				}
				result += shouldEscape ? encodeURIComponent(value).replace("!", "%21"): encodeURI(value).replace("%25", "%");
			}
		}
		return result;
	};
	resultFunction.varNames = varNames;
	return resultFunction;
}

function UriTemplate(template) {
	var parts = template.split("{");
	var textParts = [parts.shift()];
	var substitutions = [];
	var varNames = [];
	while (parts.length > 0) {
		var part = parts.shift();
		var spec = part.split("}")[0];
		var remainder = part.substring(spec.length + 1);
		var substitution = uriTemplateSubstitution(spec);
		substitutions.push(substitution);
		textParts.push(remainder);
		varNames = varNames.concat(substitution.varNames);
	}
	this.fill = function (valueFunction) {
		var result = textParts[0];
		for (var i = 0; i < substitutions.length; i++) {
			var substitution = substitutions[i];
			result += substitution(valueFunction);
			result += textParts[i + 1];
		}
		return result;
	};
	this.varNames = varNames;
}