/**
Copyright (C) 2012 Geraint Luff

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/

(function(global) { // Global wrapper
	
var publicApi = {
    "toString": function() {
        return "[JsonApi]";
    }
};
global.Jsonary = publicApi;

function setTimeout(fn, t) {
	throw new Error("setTimeout() should not be used");
}


function Uri(str) {
	var scheme = str.match(/^[a-zA-Z\-]+:/);
	if (scheme != null && scheme.length > 0) {
		this.scheme = scheme[0].substring(0, scheme[0].length - 1);
		str = str.substring(scheme[0].length);
	} else {
		this.scheme = null;
	}
	
	if (str.substring(0, 2) == "//") {
		this.doubleSlash = true;
		str = str.substring(2);
	} else {
		this.doubleSlash = false;
	}

	var hashIndex = str.indexOf("#");
	if (hashIndex >= 0) {
		var fragmentString = str.substring(hashIndex + 1);
		this.fragment = unpackFragment(fragmentString);
		str = str.substring(0, hashIndex);
	} else {
		this.hash = null;
	}
	
	var queryIndex = str.indexOf("?");
	if (queryIndex >= 0) {
		var queryString = str.substring(queryIndex + 1);
		this.query = unpackQuery(queryString);
		str = str.substring(0, queryIndex);
	} else {
		this.query = null;
	}
	
	var atIndex = str.indexOf("@");
	if (atIndex >= 0) {
		var userCredentials = str.substring(0, atIndex);
		var colonIndex = userCredentials.indexOf(":");
		if (colonIndex == -1) {
			this.username = userCredentials;
			this.password = null;
		} else {
			this.username = userCredentials.substring(0, colonIndex);
			this.password = userCredentials.substring(colonIndex + 1);
		}
		var str = str.substring(atIndex + 1);
	} else {
		this.username = null;
		this.password = null;
	}

	var slashIndex = 0;
	if (this.scheme != null || this.doubleSlash) {
		slashIndex = str.indexOf("/");
	}
	if (slashIndex >= 0) {
		this.path = str.substring(slashIndex);
		if (this.path == "") {
			this.path = null;
		}
		str = str.substring(0, slashIndex);
	} else {
		this.path = null;
	}
	
	var colonIndex = str.indexOf(":");
	if (colonIndex >= 0) {
		this.port = str.substring(colonIndex + 1);
		str = str.substring(0, colonIndex);
	} else {
		this.port = null;
	}
	
	if (str == "") {
		this.domain = null;
	} else {
		this.domain = str;
	}
}
Uri.prototype = {
	toString: function() {
		var result = "";
		if (this.scheme != null) {
			result += this.scheme + ":";
		}
		if (this.doubleSlash) {
			result += "//";
		}
		if (this.username != null) {
			result += this.username;
			if (this.password != null) {
				result += ":" + this.password;
			}
			result += "@";
		}
		if (this.domain != null) {
			result += this.domain;
		}
		if (this.port != null) {
			result += ":" + this.port;
		}
		if (this.path != null) {
			result += this.path;
		}
		if (this.query != null) {
			result += "?" + this.query;
		}
		if (this.fragment != null) {
			result += "#" + this.fragment;
		}
		return result;
	}
};
Uri.resolve = function(base, relative) {
	if (relative == undefined) {
		return base;
		//  We used to resolve relative to window.location, but we want to be able to run outside the browser as well
		//relative = base;
		//base = window.location.toString();
	}
	if (base == undefined) {
		return relative;
	}
	if (!(base instanceof Uri)) {
		base = new Uri(base);
	}
	result = new Uri(relative + "");
	if (result.scheme == null) {
		result.scheme = base.scheme;
		result.doubleSlash = base.doubleSlash;
		if (result.domain == null) {
			result.domain = base.domain;
			result.port = base.port;
			result.username = base.username;
			result.password = base.password;
			if (result.path == null) {
				result.path = base.path;
				if (result.query == null) {
					result.query = base.query;
				}
			} else if (result.path.charAt(0) != "/" && base.path != null) {
				var precedingSlash = base.path.charAt(0) == "/";
				var baseParts;
				if (precedingSlash) {
					baseParts = base.path.substring(1).split("/");
				} else {
					baseParts = base.path.split("/");
				}
				if (baseParts[baseParts.length - 1] == "..") {
					baseParts.push("");
				}
				baseParts.pop();
				for (var i = baseParts.length - 1; i >= 0; i--) {
					if (baseParts[i] == ".") {
						baseParts.slice(i, 1);
					}
				}
				var resultParts = result.path.split("/");
				for (var i = 0; i < resultParts.length; i++) {
					var part = resultParts[i];
					if (part == ".") {
						continue;
					} else if (part == "..") {
						if (baseParts.length > 0 && baseParts[baseParts.length - 1] != "..") {
							baseParts.pop();
						} else if (!precedingSlash) {
							baseParts = baseParts.concat(resultParts.slice(i));
							break;
						}
					} else {
						baseParts.push(part);
					}
				}
				result.path = (precedingSlash ? "/" : "") + baseParts.join("/");
			}
		}
	}
	return result.toString();
};
Uri.parse = function(uri) {
	return new Uri(uri);
}

function unpackQuery(queryString) {
	var parts = queryString.split("&");
	var pairs = [];
	for (var i = 0; i < parts.length; i++) {
		var part = parts[i];
		var index = part.indexOf("=");
		if (index == -1) {
			pairs.push({key: part});
		} else {
			var key = part.substring(0, index);
			var value = part.substring(index + 1);
			pairs.push({key:key, value:decodeURIComponent(value)});
		}
	}
	for (var key in queryFunctions) {
		pairs[key] = queryFunctions[key];
	}
	pairs.isQuery = true;
	return pairs;
};
function unpackFragment(fragmentString) {
	if (fragmentString.indexOf("?") != -1) {
		fragmentString.isQuery = false;
	} else {
		return unpackQuery(fragmentString);
	}
}
var queryFunctions = {
	toString: function() {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			if (typeof this[i].value == "undefined") {
				result.push(this[i].key);
			} else {
				result.push(this[i].key + "=" + encodeURIComponent(this[i].value));
			}
		}
		return result.join("&");
	},
	get: function(key, defaultValue) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].key == key) {
				return this[i].value;
			}
		}
		return defaultValue;
	},
	set: function(key, value) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].key == key) {
				this[i].value = value;
				return;
			}
		}
		this.push({key: key, value: value});
	}
};

publicApi.Uri = Uri;

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
var Utils = {
	guessBasicType: function (data, prevType) {
		if (data === null) {
			return "null";
		} else if (Array.isArray(data)) {
			return "array";
		} else if (typeof data == "object") {
			return "object";
		} else if (typeof data == "string") {
			return "string";
		} else if (typeof data == "number") {
			if (data % 1 == 0) { // we used to persist "number" if the previous type was "number", but that caused problems for no real benefit.
				return "integer";
			} else {
				return "number";
			}
		} else if (typeof data == "boolean") {
			return "boolean";
		} else {
			return undefined;
		}
	},
	resolveRelativeUri: function (baseUrl, relativeUrl) {
		return Uri.resolve(baseUrl, relativeUrl);
	},
	urlsEqual: function (url1, url2) {
		//TODO:  better URL comparison
		if (url1.charAt(url1.length - 1) == '#') {
			url1 = url1.substring(0, url1.length - 1);
		}
		if (url2.charAt(url2.length - 1) == '#') {
			url2 = url2.substring(0, url2.length - 1);
		}
		return url1 == url2;
	},
	linksEqual: function (linkList1, linkList2) {
		if (linkList1 == undefined || linkList2 == undefined) {
			return linkList1 == linkList2;
		}
		if (linkList1.length != linkList2.length) {
			return false;
		}
		for (var i = 0; i < linkList1.length; i++) {
			var link1 = linkList1[i];
			var link2 = linkList2[i];
			if (link1.href != link2.href || link1.rel != link2.rel) {
				return false;
			}
			if (link1.method != link2.method || link1['enc-type'] != link2['enc-type']) {
				return false;
			}
			if (link1.schema != link2.schema) {
				return false;
			}
		}
		return true;
	},
	log: function (level, message) {
		try {
			if (level >= Utils.logLevel.WARNING) {
				console.log("Log level " + level + ": " + message);
			}
		} catch (e) {}
	},
	logLevel: {
		DEBUG: -1,
		STANDARD: 0,
		WARNING: 1,
		ERROR: 2
	},
	getKeyVariant: function (baseKey, variantName) {
		if (variantName == undefined) {
			variantName = Utils.getUniqueKey();
		}
		variantName += "";
		if (variantName.indexOf('.') >= 0) {
			throw new Error("variant name cannot contain a dot: " + variantName);
		}
		return baseKey + "." + variantName;
	},
	keyIsVariant: function (key, baseKey) {
		key += "";
		baseKey += "";
		return key === baseKey || key.substring(0, baseKey.length + 1) === (baseKey + ".");
	},
	keyIsRoot: function (key) {
		return (key.indexOf(".") == -1);
	},
	hcf: function(a, b) {
		a = Math.abs(a);
		b = Math.abs(b);
		while (true) {
			var newB = a % b;
			if (newB == 0) {
				return b;
			} else if (isNaN(newB)) {
				return NaN;
			}
			a = b;
			b = newB;
		}
	},
	recursiveCompare: function(a, b) {
		if (Array.isArray(a)) {
			if (!Array.isArray(b) || a.length != b.length) {
				return false;
			}
			for (var i = 0; i < a.length; i++) {
				if (!Utils.recursiveCompare(a[i], b[i])) {
					return false;
				}
			}
			return true;
		} else if (typeof a == "object") {
			for (var key in a) {
				if (b[key] === undefined && a[key] !== undefined) {
					return false;
				}
			}
			for (var key in b) {
				if (a[key] === undefined && a[key] !== undefined) {
					return false;
				}
			}
			for (var key in a) {
				if (!Utils.recursiveCompare(a[key], b[key])) {
					return false;
				}
			}
			return true;
		}
		return a === b;
	},
	lcm: function(a, b) {
		return Math.abs(a*b/this.hcf(a, b));
	},
	encodeData: function (data, encType) {
		if (encType == undefined) {
			encType = "application/x-www-form-urlencoded";
		}
		if (encType == "application/json") {
			return JSON.stringify(data);
		} else if (encType == "application/x-www-form-urlencoded") {
			return Utils.formEncode(data);
		} else {
			throw new Error("Unknown encoding type: " + this.encType);
		}
	},
	decodeData: function (data, encType) {
		if (encType == undefined) {
			encType = "application/x-www-form-urlencoded";
		}
		if (encType == "application/json") {
			return JSON.parse(data);
		} else if (encType == "application/x-www-form-urlencoded") {
			return Utils.formDecode(data);
		} else {
			throw new Error("Unknown encoding type: " + this.encType);
		}
	},
	formEncode: function (data, prefix) {
		if (prefix == undefined) {
			prefix = "";
		}
		var result = [];
		if (Array.isArray(data)) {
			for (var i = 0; i < data.length; i++) {
				var key = (prefix == "") ? i : prefix + encodeURIComponent("[]");
				var complexKey = (prefix == "") ? i : prefix + encodeURIComponent("[" + i + "]");
				var value = data[i];
				if (value == null) {
					result.push(key + "=null");
				} else if (typeof value == "object") {
					result.push(Utils.formEncode(value, complexKey));
				} else if (typeof value == "boolean") {
					if (value) {
						result.push(key + "=true");
					} else {
						result.push(key + "=false");
					}
				} else {
					result.push(key + "=" + encodeURIComponent(value));
				}
			}
		} else if (typeof data == "object") {
			for (var key in data) {
				if (!data.hasOwnProperty(key)) {
					continue;
				}
				var value = data[key];
				if (prefix != "") {
					key = prefix + encodeURIComponent("[" + key + "]");
				}
				if (value == "null") {
					result.push(key + "=null");
				} else if (typeof value == "object") {
					result.push(Utils.formEncode(value, key));
				} else if (typeof value == "boolean") {
					if (value) {
						result.push(key + "=true");
					} else {
						result.push(key + "=false");
					}
				} else {
					result.push(key + "=" + encodeURIComponent(value));
				}
			}
		} else {
			result.push(encodeURIComponent(data));
		}
		return result.join("&");
	},
	formDecode: function (data) {
		var result = {};
		var parts = data.split("&");
		for (var partIndex = 0; partIndex < parts.length; partIndex++) {
			var part = parts[partIndex];
			var key = part;
			var value = "";
			if (part.indexOf("=") >= 0) {
				key = part.substring(0, part.indexOf("="));
				value = decodeURIComponent(part.substring(part.indexOf("=") + 1));
				if (value == "true") {
					value = true;
				} else if (value == "false") {
					value = false;
				} else if (value == "null") {
					value = null;
				} else if (parseFloat(value) + "" == value) {
					value = parseFloat(value);
				}
			}
			key = decodeURIComponent(key);
			var subject = result;
			var keyparts = key.split("[");
			for (var i = 1; i < keyparts.length; i++) {
				keyparts[i] = keyparts[i].substring(0, keyparts[i].length - 1);
			}
			for (var i = 0; i < keyparts.length; i++) {
				if (Array.isArray(subject) && keyparts[i] == "") {
					keyparts[i] = subject.length;
				}
				if (i == keyparts.length - 1) {
					subject[keyparts[i]] = value;
				} else {
					if (subject[keyparts[i]] == undefined) {
						if (keyparts[i + 1] == "") {
							subject[keyparts[i]] = [];
						} else {
							subject[keyparts[i]] = {};
						}
					}
					subject = subject[keyparts[i]];
				}
			}
		}
		return result;
	},
	encodePointerComponent: function (component) {
		return component.toString().replace("~", "~0").replace("/", "~1");
	},
	decodePointerComponent: function (component) {
		return component.toString().replace("~1", "/").replace("~0", "~");
	},
	splitPointer: function (pointerString) {
		var parts = pointerString.split("/");
		if (parts[0] == "") {
			parts.shift();
		}
		for (var i = 0; i < parts.length; i++) {
			parts[i] = Utils.decodePointerComponent(parts[i]);
		}
		return parts;
	},
	joinPointer: function (pointerComponents) {
		var result = "";
		for (var i = 0; i < parts.length; i++) {
			result += "/" + Utils.encodePointerComponent(parts[i]);
		}
		return result;
	}
};
(function () {
	var counter = 0;
	Utils.getUniqueKey = function () {
		return counter++;
	};
})();

// Place relevant ones in the public API

publicApi.getMonitorKey = Utils.getUniqueKey;
publicApi.getKeyVariant = function (baseKey, variantName) {
	return Utils.getKeyVariant(baseKey, "~" + variantName);
};
publicApi.keyIsVariant = Utils.keyIsVariant;
publicApi.log = function (level, message) {
	if (typeof level != "number") {
		alert("First argument to log() must be a number (preferably enum value from .logLevel)");
		throw new Error("First argument to log() must be a number (preferably enum value from .logLevel)");
	} else {
		Utils.log(level, message);
	}
};
publicApi.setLogFunction = function (log) {
	Utils.log = log;
};
publicApi.logLevel = Utils.logLevel;
publicApi.encodeData = Utils.encodeData;
publicApi.decodeData = Utils.decodeData;
publicApi.encodePointerComponent = Utils.encodePointerComponent;
publicApi.decodePointerComponent = Utils.decodePointerComponent;
publicApi.splitPointer = Utils.splitPointer;
publicApi.joinPointer = Utils.joinPointer;

publicApi.extend = function (obj) {
	for (var key in obj) {
		if (publicApi[key] == undefined) {
			publicApi[key] = obj[key];
		}
	}
};

function cacheResult(targetObj, map) {
	for (var key in map) {
		(function (key, value) {
			targetObj[key] = function () {
				return value;
			};
		})(key, map[key]);
	}
}

function MonitorSet(context) {
	this.contents = {};
	this.keyOrder = [];
	this.context = context;
}
MonitorSet.prototype = {
	add: function (monitorKey, monitor) {
		if (typeof monitorKey != "string" && typeof monitorKey != "number") {
			throw new Error("First argument must be a monitorKey, obtained using getMonitorKey()");
		}
		this.contents[monitorKey] = monitor;
		this.addKey(monitorKey);
	},
	addKey: function (monitorKey) {
		var i;
		for (i = 0; i < this.keyOrder.length; i++) {
			var key = this.keyOrder[i];
			if (key == monitorKey) {
				return;
			}
			if (Utils.keyIsVariant(monitorKey, key)) {
				this.keyOrder.splice(i, 0, monitorKey);
				return;
			}
		}
		this.keyOrder.push(monitorKey);
	},
	remove: function (monitorKey) {
		delete this.contents[monitorKey];
		this.removeKey(monitorKey);
		var prefix = monitorKey + ".";
		for (var key in this.contents) {
			if (key.substring(0, prefix.length) == prefix) {
				this.removeKey(key);
				delete this.contents[key];
			}
		}
	},
	removeKey: function (monitorKey) {
		var index = this.keyOrder.indexOf(monitorKey);
		if (index >= 0) {
			this.keyOrder.splice(index, 1);
		}
	},
	notify: function () {
		var notifyArgs = arguments;
		for (var i = 0; i < this.keyOrder.length; i++) {
			var key = this.keyOrder[i];
			var monitor = this.contents[key];
			monitor.apply(this.context, notifyArgs);
		}
	},
	isEmpty: function () {
		var key;
		for (key in this.contents) {
			if (this.contents[key].length !== 0) {
				return false;
			}
		}
		return true;
	}
};

function ListenerSet(context) {
	this.listeners = [];
	this.context = context;
}
ListenerSet.prototype = {
	add: function (listener) {
		this.listeners[this.listeners.length] = listener;
	},
	notify: function () {
		var listenerArgs = arguments;
		while (this.listeners.length > 0) {
			var listener = this.listeners.shift();
			listener.apply(this.context, listenerArgs);
		}
	},
	isEmpty: function () {
		return this.listeners.length === 0;
	}
};

var DelayedCallbacks = {
	depth: 0,
	callbacks: [],
	increment: function () {
		this.depth++;
	},
	decrement: function () {
		this.depth--;
		if (this.depth < 0) {
			throw new Error("DelayedCallbacks.depth cannot be < 0");
		}
		while (this.depth == 0 && this.callbacks.length > 0) {
			var callback = this.callbacks.shift();
			callback();
		}
	},
	add: function (callback) {
		if (this.depth == 0) {
			callback();
		} else {
			this.callbacks.push(callback);
		}
	}
};

if (typeof XMLHttpRequest == "undefined") {
	XMLHttpRequest = function () {
		try {
			return new ActiveXObject("Msxml2.XMLHTTP.6.0");
		} catch (e) {
		}
		try {
			return new ActiveXObject("Msxml2.XMLHTTP.3.0");
		} catch (e) {
		}
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} catch (e) {
		}
		//Microsoft.XMLHTTP points to Msxml2.XMLHTTP and is redundanat
		throw new Error("This browser does not support XMLHttpRequest.");
	};
}

// Default cache
(function () {
	var cacheData = {};
	var cacheTimes = {};
	var emptyTimeout = setInterval(function () {
		defaultCache.empty();
	}, 10*1000);

	var defaultCache = function (cacheKey, insertData) {
		if (insertData !== undefined) {
			cacheData[cacheKey] = insertData;
			cacheTimes[cacheKey] = (new Date()).getTime();
			return;
		}
		return cacheData[cacheKey];
	};
	defaultCache.cacheSeconds = 10;
	defaultCache.empty = function (timeLimit) {
		// TODO: figure out what to do here
		return;
		if (timeLimit == undefined) {
			timeLimit = (new Date()).getTime() - defaultCache.cacheSeconds * 1000;
		}
		for (var key in cacheTimes) {
			if (cacheTimes[key] <= timeLimit) {
				var request = cacheData[key];
				delete cacheData[key];
				delete cacheTimes[key];
			}
		}
	};
	defaultCache.invalidate = function (urlPattern) {
		if (typeof urlPattern == "string") {
			urlPattern = Utils.resolveRelativeUri(urlPattern);
		}
		for (var key in cacheData) {
			var request = cacheData[key];
			var url = request.url;
			if (typeof urlPattern == "string") {
				if (url.indexOf(urlPattern) != -1) {
					request.invalidate();
				}
			} else {
				if (urlPattern.test(url)) {
					request.invalidate();
				}
			}
		}
	};
	publicApi.defaultCache = defaultCache;
	publicApi.invalidate = defaultCache.invalidate;
})();

function FragmentRequest(request, fragment) {
	var thisFragmentRequest = this;
	
	this.baseUrl = request.url;
	this.fragment = fragment;
	if (fragment == null) {
		fragment = "";
	}
	this.url = this.baseUrl + "#" + encodeURI(fragment);

	this.getRoot = function (callback) {
		request.getRoot(function(data) {
			callback.call(data, data, thisFragmentRequest);
		});
	};
	this.getData = function (callback) {
		if (fragment == null || fragment == "") {
			request.document.getRoot(function(data) {
				callback.call(data, data, thisFragmentRequest);
			});
		} else {
			request.document.getFragment(fragment, function(data) {
				callback.call(data, data, thisFragmentRequest);
			});
		}
	};
	this.getRawResponse = function (callback) {
		request.getResponse(function(data) {
			callback.call(data, data, thisFragmentRequest);
		});
	};
}
FragmentRequest.prototype = {
}

function requestJson(url, method, data, encType, cacheFunction, hintSchema) {
	if (url == undefined) {
		throw new Error("URL cannot be undefined");
	}
	url = Utils.resolveRelativeUri(url);
	if (method == undefined) {
		method = "GET";
	}
	if (data === undefined) {
		data = {};
	}
	var fragment = null;
	var index = url.indexOf("#");
	if (index >= 0) {
		fragment = decodeURI(url.substring(index + 1));
		url = url.substring(0, index);
	}

	// TODO: think about implementing Rails-style _method=put/delete
	if (encType == undefined) {
		if (method == "GET") {
			encType = "application/x-www-form-urlencoded";
		} else if (method == "POST" || method == "PUT") {
			encType = "application/json";
		} else {
			encType = "application/x-www-form-urlencoded";
		}
	}
	if (cacheFunction == undefined) {
		cacheFunction = publicApi.defaultCache;
	}

	var cacheable = (cacheFunction && method == "GET" && encType == "application/x-www-form-urlencoded");
	if (cacheable) {
		var cacheKey = JSON.stringify(url) + ":" + JSON.stringify(data);
		var result = cacheFunction(cacheKey);
		if (result != undefined) {
			return new FragmentRequest(result, fragment);
		}
	}
	var request = new Request(url, method, data, encType, hintSchema);
	if (cacheable) {
		cacheFunction(cacheKey, request);
	}
	return new FragmentRequest(request, fragment);
}

function addToCache(url, rawData, schemaUrl, cacheFunction) {
	url = Utils.resolveRelativeUri(url);
	if (cacheFunction == undefined) {
		cacheFunction = publicApi.defaultCache;
	}
	var data = {};
	var cacheKey = JSON.stringify(url) + ":" + JSON.stringify(data);
	var request = new RequestFake(url, rawData, schemaUrl, cacheFunction, cacheKey);
}
publicApi.addToCache = addToCache;
publicApi.getData = function(params, callback, hintSchema) {
	if (typeof params == "string") {
		params = {url: params};
	}
	var request = requestJson(params.url, params.method, params.data, params.encType, null, hintSchema);
	if (callback != undefined) {
		request.getData(callback);
	}
	return request;
};

var PROFILE_SCHEMA_KEY = Utils.getUniqueKey();

function Request(url, method, data, encType, hintSchema) {
	url = Utils.resolveRelativeUri(url);

	data = Utils.encodeData(data, encType);
	if (method == "GET" && data != "") {
		if (url.indexOf("?") == -1) {
			url += "?";
		} else {
			url += "&";
		}
		url += data;
		data = "";
	}

	Utils.log(Utils.logLevel.STANDARD, "Sending request for: " + url);
	var thisRequest = this;
	this.successful = undefined;
	this.errorMessage = undefined;
	this.url = url;

	var isDefinitive = (data == undefined) || (data == "");
	this.responseListeners = new ListenerSet(this);
	this.document = new Document(url, isDefinitive, true);

	this.fetched = false;
	this.fetchData(url, method, data, encType, hintSchema);
	this.invalidate = function() {
		if (method == "GET") {
			this.fetchData(url, method, data, encType, hintSchema);
		}
	};
}
Request.prototype = {
	beingUsed: function() {
		if (this.baseContext == undefined) {
			Utils.log(Utils.logLevel.DEBUG, "No base context: " + this.url);
			return true;
		}
		return this.baseContext.retainCount() > 0;
	},
	getResponse: function (listener) {
		this.responseListeners.add(listener);
		this.checkForFullResponse();
	},
	checkForFullResponse: function () {
		if (this.document.raw.defined()) {
			this.responseListeners.notify(this.document.raw, this);
		}
	},
	ajaxSuccess: function (data, headerText, hintSchema) {
		this.fetched = true;
		var thisRequest = this;
		thisRequest.successful = true;
		Utils.log(Utils.logLevel.STANDARD, "Request success: " + this.url);
		var lines = headerText.split("\n");
		var headers = {};
		var contentType = null;
		var contentTypeParameters = {};
		for (var i = 0; i < lines.length; i++) {
			var keyName = lines[i].split(": ")[0];
			if (keyName == "") {
				continue;
			}
			var value = lines[i].substring(keyName.length + 2);
			if (value[value.length - 1] == "\r") {
				value = value.substring(0, value.length - 1);
			}
			// Some browsers have all parameters as lower-case, so we do this for compatability
			//       (discovered using Dolphin Browser on an Android phone)
			headers[keyName.toLowerCase()] = value;
		}
		Utils.log(Utils.logLevel.DEBUG, "headers: " + JSON.stringify(headers, null, 4));
		var contentType = headers["content-type"].split(";")[0];
		var profileParts = headers["content-type"].substring(contentType.length + 1).split(",");
		for (var i = 0; i < profileParts.length; i++) {
			var partName = profileParts[i].split("=")[0];
			var partValue = profileParts[i].substring(partName.length + 1);
			partName = partName.trim();
			if (partName == "") {
				continue;
			}
			contentTypeParameters[partName] = partValue;
		}

		thisRequest.headers = headers;
		thisRequest.contentType = contentType;
		thisRequest.contentTypeParameters = contentTypeParameters;

		thisRequest.document.setRaw(data);
		thisRequest.profileUrl = null;
		thisRequest.document.raw.removeSchema(PROFILE_SCHEMA_KEY);
		if (contentTypeParameters["profile"] != undefined) {
			var schemaUrl = contentTypeParameters["profile"];
			schemaUrl = Utils.resolveRelativeUri(thisRequest.url, schemaUrl);
			thisRequest.profileUrl = schemaUrl;
			thisRequest.document.raw.addSchema(schemaUrl, PROFILE_SCHEMA_KEY);
		} else if (hintSchema != undefined) {
			thisRequest.document.raw.addSchema(hintSchema, PROFILE_SCHEMA_KEY);
		}
		if (contentTypeParameters["root"] != undefined) {
			var link = {
				"href": contentTypeParameters["root"],
				"rel": "root"
			};
			thisRequest.document.raw.addLink(link);
		}

		thisRequest.checkForFullResponse();
		thisRequest.document.raw.whenSchemasStable(function () {
			var rootLink = thisRequest.document.raw.getLink("root");
			if (rootLink != undefined) {
				var fragment = decodeURI(rootLink.href.substring(rootLink.href.indexOf("#") + 1));
				thisRequest.document.setRoot(fragment);
			} else {
				thisRequest.document.setRoot("");
			}
		});
	},
	ajaxError: function (message) {
		this.fetched = true;
		var thisRequest = this;
		thisRequest.successful = false;
		thisRequest.errorMessage = message;
		Utils.log(Utils.logLevel.ERROR, "Error fetching: " + this.url + " (" + message + ")");
		thisRequest.document.setRaw(undefined);
		thisRequest.document.raw.whenSchemasStable(function () {
			thisRequest.checkForFullResponse();
			thisRequest.document.setRoot("");
		});
	},
	fetchData: function(url, method, data, encType, hintSchema) {
		var thisRequest = this;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					var data = xhr.responseText;
					try {
						data = JSON.parse(data);
					} catch (e) {
						thisRequest.ajaxError(e);
						return;
					}
					var headers = xhr.getAllResponseHeaders();
					if (headers == "") {	// Firefox bug  >_>
						headers = [];
						var desiredHeaders = ["Cache-Control", "Content-Language", "Content-Type", "Expires", "Last-Modified", "Pragma"];
						for (var i = 0; i < desiredHeaders.length; i++) {
							var value = xhr.getResponseHeader(desiredHeaders[i]);
							if (value != "" && value != null) {
								headers.push(desiredHeaders[i] + ": " + value);
							}
						}
						headers = headers.join("\n");
					}
					thisRequest.ajaxSuccess(data, headers, hintSchema);
				} else {
					thisRequest.ajaxError("HTTP Status " + xhr.status);
				}
			}
		};
		var xhrUrl = url;
		var xhrData = data;
		if ((method == "GET" || method == "DELETE") && (xhrData != undefined && xhrData != "")) {
			if (xhrUrl.indexOf("?") == -1) {
				xhrUrl += "?";
			} else {
				xhrUrl += "&";
			}
			xhrUrl += xhrData;
			xhrData = undefined;
		}
		xhr.open(method, xhrUrl, true);
		xhr.setRequestHeader("Content-Type", encType);
		xhr.send(xhrData);
	}
};

function RequestFake(url, rawData, schemaUrl, cacheFunction, cacheKey) {
	cacheFunction(cacheKey, this);

	var thisRequest = this;
	this.url = url;
	
	this.responseListeners = new ListenerSet(this);
	this.document = new Document(url, true, true);
	this.document.setRaw(rawData);
	this.profileUrl = schemaUrl;
	if (schemaUrl != undefined) {
		this.document.raw.addSchema(schemaUrl);
	}
	if (url == schemaUrl) {
		this.document.setRoot("");
	} else {
		this.document.raw.whenSchemasStable(function () {
			var rootLink = thisRequest.document.raw.getLink("root");
			if (rootLink != undefined) {
				var fragment = decodeURI(rootLink.href.substring(rootLink.href.indexOf("#") + 1));
				thisRequest.document.setRoot(fragment);
			} else {
				thisRequest.document.setRoot("");
			}
		});
	}
	this.successful = true;
	this.errorMessage = undefined;

	this.fetched = false;
	this.invalidate = function() {
		this.fetchData(url, "GET", undefined, "application/x-www-form-urlencoded", schemaUrl);
	};
}
RequestFake.prototype = Request.prototype;


function Patch(prefix) {
	this.operations = [];
	if (prefix == undefined) {
		prefix = "";
	}
	this.prefix = prefix;
}
Patch.prototype = {
	isEmpty: function () {
		return this.operations.length == 0;
	},
	each: function (callback) {
		for (var i = 0; i < this.operations.length; i++) {
			callback.call(this, i, this.operations[i]);
		}
		return this;
	},
	plain: function () {
		var result = [];
		for (var i = 0; i < this.operations.length; i++) {
			result[i] = this.operations[i].plain();
		}
		return result;
	},
	condense: function () {
		// Replace operations with shorter sequence, if possible
		return;
	},
	filterImmediate: function () {
		var subPatch = new Patch(this.prefix);
		for (var i = 0; i < this.operations.length; i++) {
			var operation = this.operations[i];
			if (operation.immediateChild(this.prefix)) {
				subPatch.operations.push(operation);
			}
		}
		return subPatch;
	},
	filter: function (prefix) {
		prefix = this.prefix + prefix;
		var subPatch = new Patch(prefix);
		for (var i = 0; i < this.operations.length; i++) {
			var operation = this.operations[i];
			if (operation.hasPrefix(prefix)) {
				subPatch.operations.push(operation);
			}
		}
		return subPatch;
	},
	filterRemainder: function (prefix) {
		prefix = this.prefix + prefix;
		var subPatch = new Patch(this.prefix);
		for (var i = 0; i < this.operations.length; i++) {
			var operation = this.operations[i];
			if (!operation.hasPrefix(prefix)) {
				subPatch.operations.push(operation);
			}
		}
		return subPatch;
	},
	replace: function (path, value) {
		var operation = new PatchOperation("replace", path, value);
		this.operations.push(operation);
		return this;
	},
	add: function (path, value) {
		var operation = new PatchOperation("add", path, value);
		this.operations.push(operation);
		return this;
	},
	remove: function (path) {
		var operation = new PatchOperation("remove", path);
		this.operations.push(operation);
		return this;
	},
	move: function (path, target) {
		var operation = new PatchOperation("move", path, target);
		this.operations.push(operation);
		return this;
	},
	inverse: function () {
		var result = new Patch(this.prefix);
		for (var i = 0; i < this.operations.length; i++) {
			result.operations[i] = this.operations[i].inverse();
		}
		result.operations.reverse();
		return result;
	}
};

function PatchOperation(patchType, subject, value) {
	this._patchType = patchType;
	this._subject = subject;
	this._subjectValue = undefined;
	if (patchType == "move") {
		this._target = value;
	} else {
		this._value = value;
	}
}
PatchOperation.prototype = {
	action: function () {
		return this._patchType;
	},
	value: function () {
		return this._value;
	},
	subject: function () {
		return this._subject;	
	},
	setSubjectValue: function (value) {
		this._subjectValue = value;
		return this;
	},
	subjectValue: function () {
		return this._subjectValue;
	},
	inverse: function () {
		switch (this._patchType) {
			case "replace":
				return new PatchOperation("replace", this._subject, this._subjectValue);
			case "add":
				return (new PatchOperation("remove", this._subject)).setSubjectValue(this._value);
			case "remove":
				return (new PatchOperation("add", this._subject, this._subjectValue));
			case "move":
				return (new PatchOperation("move", this._target, this._subject));
			default:
				throw new Error("Unrecognised patch type for inverse: " + this._patchType);
		}
	},
	depthFrom: function (path) {
		path += "/";
		var minDepth = NaN;
		if (this._subject.substring(0, path.length) == path) {
			var remainder = this._subject.substring(path.length);
			if (remainder == 0) {
				minDepth = 0;
			} else {
				minDepth = remainder.split("/").length;
			}
		}
		if (this._target != undefined) {
			if (this._target.substring(0, path.length) == path) {
				var targetDepth;
				var remainder = this._target.substring(path.length);
				if (remainder == 0) {
					targetDepth = 0;
				} else {
					targetDepth = remainder.split("/").length;
				}
				if (!(targetDepth > minDepth)) {
					minDepth = targetDepth;
				}
			}
		}
		return minDepth;
	},
	subjectEquals: function (path) {
		return this._subject == path;
	},
	subjectChild: function (path) {
		path += "/";
		if (this._subject.substring(0, path.length) == path) {
			var remainder = this._subject.substring(path.length);
			if (remainder.indexOf("/") == -1) {
				return decodeURIComponent(remainder);
			}
		}
		return false;
	},
	subjectRelative: function (path) {
		path += "/";
		if (this._subject.substring(0, path.length) == path) {
			return this._subject.substring(path.length - 1);
		}
		return false;
	},
	target: function () {
		return this._target;
	},
	targetEquals: function (path) {
		return this._target == path;
	},
	targetChild: function (path) {
		if (this._target == undefined) {
			return;
		}
		path += "/";
		if (this._target.substring(0, path.length) == path) {
			var remainder = this._target.substring(path.length);
			if (remainder.indexOf("/") == -1) {
				return decodeURIComponent(remainder);
			}
		}
		return false;
	},
	targetRelative: function (path) {
		path += "/";
		if (this._target.substring(0, path.length) == path) {
			return this._target.substring(path.length - 1);
		}
		return false;
	},
	plain: function () {
		var result = {};
		result[this._patchType] = this._subject;
		if (this._patchType == "remove") {
		} else if (this._patchType == "move") {
			result.to = this._target;
		} else {
			result.value = this._value;
		}
		return result;
	},
	matches: function (prefix) {
		if (this._subject == prefix) {
			return true;
		} else if (this._patchType == "move" && this._target == prefix) {
			return true;
		}
		return false;
	},
	hasPrefix: function (prefix) {
		if (this.matches(prefix)) {
			return true;
		}
		prefix += "/";
		if (this._subject.substring(0, prefix.length) == prefix) {
			return true;
		} else if (this._patchType == "move" && this._target.substring(0, prefix.length) == prefix) {
			return true;
		}
		return false;
	}
};



var changeListeners = [];
publicApi.registerChangeListener = function (listener) {
	changeListeners.push(listener);
};

var batchChanges = false;
var batchChangeDocuments = [];
publicApi.batch = function (batchFunc) {
	if (batchFunc != undefined) {
		publicApi.batch();
		batchFunc();
		publicApi.batchDone();
		return this;
	}
	batchChanges = true;
	return this;
};
publicApi.batchDone = function () {
	batchChanges = false;
	while (batchChangeDocuments.length > 0) {
		var document = batchChangeDocuments.shift();
		var patch = document.batchPatch;
		delete document.batchPatch;
		document.patch(patch);
	}
	return this;
};

function Document(url, isDefinitive, readOnly) {
	this.readOnly = !!readOnly;
	this.url = url;
	this.isDefinitive = isDefinitive;

	var rootPath = null;
	var rawSecrets = {};
	this.raw = new Data(this, rawSecrets);
	this.root = null;
	
	var documentChangeListeners = [];
	this.registerChangeListener = function (listener) {
		documentChangeListeners.push(listener);
	};

	this.setRaw = function (value) {
		rawSecrets.setValue(value);
	};
	var rootListeners = new ListenerSet(this);
	this.getRoot = function (callback) {
		if (this.root == null) {
			rootListeners.add(callback);
		} else {
			callback.call(this, this.root);
		}
	};
	this.setRoot = function (newRootPath) {
		rootPath = newRootPath;
		this.root = this.raw.subPath(newRootPath);
		rootListeners.notify(this.root);
	};
	this.patch = function (patch) {
		var thisDocument = this;
		if (this.readOnly) {
			throw new Error("Cannot update read-only document");
		}
		if (batchChanges) {
			if (this.batchPatch == undefined) {
				this.batchPatch = new Patch();
				batchChangeDocuments.push(this);
			}
			this.batchPatch.operations = this.batchPatch.operations.concat(patch.operations);
			return;
		}
		DelayedCallbacks.increment();
		var listeners = changeListeners.concat(documentChangeListeners);
		DelayedCallbacks.add(function () {
			for (var i = 0; i < listeners.length; i++) {
				listeners[i].call(thisDocument, patch, thisDocument);
			}
		});
		var rawPatch = patch.filter("?");
		var rootPatch = patch.filterRemainder("?");
		this.raw.patch(rawPatch);
		this.root.patch(rootPatch);
		DelayedCallbacks.decrement();
	};
	this.affectedData = function (operation) {
		var subject = operation.subject();
		var subjectData = null;
		if (subject == "?" || subject.substring(0, 2) == "?/") {
			subjectData = this.raw.subPath(subject.substring(1));
		} else {
			subjectData = this.root.subPath(subject);
		}
		var result = [];
		while (subjectData != undefined) {
			result.push(subjectData);
			subjectData = subjectData.parent();
		}
		if (operation.action() == "move") {
			var target = operation.target();
			var targetData = null;
			if (target == "?" || target.substring(0, 2) == "?/") {
				targetData = this.raw.subPath(target.substring(1));
			} else {
				targetData = this.root.subPath(target);
			}
			result.push();
			while (targetData != undefined) {
				result.push(targetData);
				targetData = targetData.parent();
			}
		}
		return result;
	}
}
Document.prototype = {
	resolveUrl: function (url) {
		return Uri.resolve(this.url, url);
	},
	getFragment: function (fragment, callback) {
		this.getRoot(function (data) {
			if (fragment == "") {
				callback.call(this, data);
			} else {
				var fragmentData = data.subPath(fragment);
				callback.call(this, fragmentData);
			}
		});
	},
	get: function (path) {
		return this.root.get(path);
	},
	set: function (path, value) {
		this.root.set(path, value);
		return this;
	},
	move: function (source, target) {
		var patch = new Patch();
		patch.move(source, target);
		this.patch(patch);
		return this;
	}
}

var INDEX_REGEX = /^(0|[1-9]\d*)$/
function isIndex(value) {
	return INDEX_REGEX.test(value);
}

var uniqueIdCounter = 0;
function Data(document, secrets, parent, parentKey) {
	this.uniqueId = uniqueIdCounter++;
	this.document = document;
	this.readOnly = function () {
		return document.readOnly;
	};
	
	var value = undefined;
	var basicType = undefined;
	var length = 0;
	var keys = [];
	var propertyData = {};
	var propertyDataSecrets = {};
	this.property = function (key) {
		if (propertyData[key] == undefined) {
			propertyDataSecrets[key] = {};
			propertyData[key] = new Data(this.document, propertyDataSecrets[key], this, key);
			if (basicType == "object") {
				propertyDataSecrets[key].setValue(value[key]);
				if (value[key] !== undefined) {
					secrets.schemas.addSchemasForProperty(key, propertyData[key]);
				}
			}
		}
		return propertyData[key];
	};
	var indexData = {};
	var indexDataSecrets = {};
	this.item = function (index) {
		if (!isIndex(index)) {
			throw new Error("Index must be a positive integer (or integer-value string)");
		}
		if (indexData[index] == undefined) {
			indexDataSecrets[index] = {};
			indexData[index] = new Data(this.document, indexDataSecrets[index], this, index);
			if (basicType == "array") {
				indexDataSecrets[index].setValue(value[index]);
				if (value[index] !== undefined) {
					secrets.schemas.addSchemasForIndex(index, indexData[index]);
				}
			}
		}
		return indexData[index];
	}
	
	this.parent = function() {
		return parent;
	};
	this.parentKey = function () {
		return parentKey;
	};
	this.pointerPath = function () {
		if (this.document.root == this) {
			return "";
		} else if (parent != undefined) {
			return parent.pointerPath() + "/" + Utils.encodePointerComponent(parentKey);
		} else {
			return "?";
		}
	};
	
	this.basicType = function() {
		return basicType;
	};
	this.value = function() {
		if (basicType == "object") {
			var result = {};
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				if (propertyData[key] != undefined) {
					result[key] = propertyData[key].value();
				} else {
					result[key] = value[key];
				}
			}
			return result;
		} else if (basicType == "array") {
			var result = [];
			for (var i = 0; i < length; i++) {
				if (indexData[i] != undefined) {
					result[i] = indexData[i].value();
				} else {
					result[i] = value[i];
				}
			}
			return result;
		} else {
			return value;
		}
	};
	this.keys = function () {
		return keys.slice(0);
	};
	this.length = function () {
		return length;
	};
	
	this.patch = function (patch) {
		var thisData = this;
		var thisPath = this.pointerPath();
		var updateKeys = {};
		patch.each(function (i, operation) {
			if (operation.subjectEquals(thisPath)) {
				if (operation.action() == "replace" || operation.action() == "add") {
					operation.setSubjectValue(thisData.value());
					secrets.setValue(operation.value());
					if (basicType == "object") {
						
					}
				} else if (operation.action() == "remove") {
				} else if (operation.action() == "move") {
				} else {
					throw new Error("Unrecognised patch operation: " + operation.action());
				}
			} else if (operation.targetEquals(thisPath)) {
				if (operation.action() == "move") {
					secrets.setValue(operation.subjectValue());
				}
			} else {
				var child = operation.subjectChild(thisPath);
				if (child) {
					updateKeys[child] = true;
					if (basicType == "object") {
						if (operation.action() == "add") {
							var keyIndex = keys.indexOf(child);
							if (keyIndex != -1) {
								throw new Error("Cannot add existing key: " + child);
							}
							keys.push(child);
							value[child] = operation.value();
							if (propertyData[child] != undefined) {
								propertyDataSecrets[child].setValue(operation.value());
								secrets.schemas.addSchemasForProperty(child, propertyData[child]);
							}
						} else if (operation.action() == "remove" || operation.action() == "move") {
							var keyIndex = keys.indexOf(child);
							if (keyIndex == -1) {
								throw new Error("Cannot delete missing key: " + child);
							}
							operation.setSubjectValue(thisData.propertyValue(child));
							keys.splice(keyIndex, 1);
							if (propertyDataSecrets[child] != undefined) {
								propertyDataSecrets[child].setValue(undefined);
							}
							delete value[child];
						} else if (operation.action() == "replace") {
						} else {
							throw new Error("Unrecognised patch operation: " + operation.action());
						}
					} else if (basicType == "array") {
						if (!isIndex(child)) {
							throw new Error("Cannot patch non-numeric index: " + child);
						}
						var index = parseInt(child);
						if (operation.action() == "add") {
							if (index > length) {
								throw new Error("Cannot add past the end of the list");
							}
							for (var j = length - 1; j >= index; j--) {
								if (indexDataSecrets[j + 1] == undefined) {
									continue;
								}
								if (indexData[j] == undefined) {
									indexDataSecrets[j + 1].setValue(value[j]);
								} else {
									indexDataSecrets[j + 1].setValue(indexData[j].value());
								}
							}
							value.splice(index, 0, operation.value());
							length++;
							if (indexData[value.length - 1] != undefined) {
								secrets.schemas.addSchemasForIndex(value.length - 1, indexData[value.length - 1]);
							}
						} else if (operation.action() == "remove" || operation.action() == "move") {
							if (index >= length) {
								throw new Error("Cannot remove a non-existent index");
							}
							operation.setSubjectValue(thisData.itemValue(index));
							for (var j = index; j < length - 1; j++) {
								if (indexDataSecrets[j] == undefined) {
									continue;
								}
								if (indexData[j + 1] == undefined) {
									indexDataSecrets[j].setValue(value[j + 1]);
								} else {
									indexDataSecrets[j].setValue(indexData[j + 1].value());
								}
							}
							if (indexDataSecrets[length - 1] != undefined) {
								indexDataSecrets[length - 1].setValue(undefined);
							}
							length--;
							value.splice(index, 1);
						} else if (operation.action() == "replace") {
						} else {
							throw new Error("Unrecognised patch operation: " + operation.action());
						}
					}
				}
				var targetChild = operation.targetChild(thisPath);
				if (targetChild) {
					updateKeys[targetChild] = true;
					if (basicType == "object") {
						if (operation.action() == "move") {
							var keyIndex = keys.indexOf(targetChild);
							if (keyIndex != -1) {
								throw new Error("Cannot move to existing key: " + targetChild);
							}
							keys.push(targetChild);
							value[targetChild] = operation.subjectValue();
							if (propertyData[targetChild] != undefined) {
								secrets.schemas.addSchemasForProperty(targetChild, propertyData[targetChild]);
							}
						}
					} else if (basicType == "array") {
						if (!isIndex(targetChild)) {
							throw new Error("Cannot patch non-numeric index: " + targetChild);
						}
						var index = parseInt(targetChild);
						if (operation.action() == "move") {
							if (index > length) {
								throw new Error("Cannot add past the end of the list");
							}
							for (var j = length - 1; j >= index; j--) {
								if (indexDataSecrets[j + 1] == undefined) {
									continue;
								}
								if (indexData[j] == undefined) {
									indexDataSecrets[j + 1].setValue(value[j]);
								} else {
									indexDataSecrets[j + 1].setValue(indexData[j].value());
								}
							}
							value.splice(index, 0, operation.subjectValue());
							length++;
							if (indexData[value.length - 1] != undefined) {
								secrets.schemas.addSchemasForIndex(value.length - 1, indexData[value.length - 1]);
							}
						}
					}
				}
			}
		});
		if (basicType == "object") {
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var subPatch = patch.filter("/" + Utils.encodePointerComponent(key));
				if (!subPatch.isEmpty()) {
					this.property(key).patch(subPatch);
				}
			}
		} else if (basicType == "array") {
			for (var i = 0; i < length; i++) {
				var subPatch = patch.filter("/" + Utils.encodePointerComponent(i));
				if (!subPatch.isEmpty()) {
					this.index(i).patch(subPatch);
				}
			}
		} else {
			// TODO: throw a wobbly
		}
		for (var key in updateKeys) {
			secrets.schemas.update(key);
		}
	};
	
	secrets.setValue = function (newValue) {
		var newBasicType = Utils.guessBasicType(newValue, basicType);
		var oldValue = value;
		value = newValue;
		if (newBasicType != basicType) {
			if (basicType == "object") {
				for (var key in propertyData) {
					propertyDataSecrets[key].setValue(undefined);
				}
			} else if (basicType == "array") {
				for (var index in indexData) {
					indexDataSecrets[index].setValue(undefined);
				}
			}
			basicType = newBasicType;
		}
		if (newBasicType == "object") {
			for (var key in propertyData) {
				if (newValue.hasOwnProperty(key)) {
					if (!propertyData[key].defined()) {
						secrets.schemas.addSchemasForProperty(key, propertyData[key]);
					}
					propertyDataSecrets[key].setValue(newValue[key]);
				} else {
					propertyDataSecrets[key].setValue(undefined);
				}
			}
			keys = Object.keys(newValue);
			length = 0;
		} else if (newBasicType == "array") {
			for (var index in indexData) {
				if (index < newValue.length) {
					if (!indexData[index].defined()) {
						secrets.schemas.addSchemasForIndex(index, indexData[index]);
					}
					indexDataSecrets[index].setValue(newValue[index]);
				} else {
					indexDataSecrets[index].setValue(undefined);
				}
			}
			keys = [];
			length = newValue.length;
		} else {
			keys = [];
			length = 0;
		}
		if (newValue === undefined) {
			if (oldValue !== undefined) {
				// we check oldValue, so we don't get a "schema changed" callback when we access an undefined property/index.
				secrets.schemas.clear();
			}
		} else {
			secrets.schemas.update(null);
		}
	};
	
	secrets.schemas = new SchemaSet(this);
	this.schemas = function () {
		return secrets.schemas.getSchemas();
	};
	this.whenSchemasStable = function(callback) {
		secrets.schemas.whenSchemasStable(callback);
		return this;
	};
	this.links = function (rel) {
		return secrets.schemas.getLinks(rel);
	};
	this.addLink = function (rawLink) {
		secrets.schemas.addLink(rawLink);
		return this;
	};
	this.addSchema = function (schema, schemaKey) {
		secrets.schemas.addSchema(schema, schemaKey);
		return this;
	};
	this.removeSchema = function ( schemaKey) {
		secrets.schemas.removeSchema(schemaKey);
		return this;
	};
	this.addSchemaMatchMonitor = function (monitorKey, schema, monitor, executeImmediately) {
		return secrets.schemas.addSchemaMatchMonitor(monitorKey, schema, monitor, executeImmediately);
	};
}
Data.prototype = {
	referenceUrl: function () {
		if (this.document.isDefinitive) {
			var pointerPath = this.pointerPath();
			if (pointerPath == "" || pointerPath.charAt(0) == "/") {
				return this.document.url + "#" + encodeURI(this.pointerPath());
			}
		}
	},
	subPath: function (path) {
		var parts = path.split("/");
		if (parts[0] != "") {
			throw new Error("Path must begin with / (or be empty)");
		}
		var result = this;
		for (var i = 1; i < parts.length; i++) {
			parts[i] = Utils.decodePointerComponent(parts[i]);
			if (result.basicType() == "array") {
				result = result.index(parts[i]);
			} else {
				result = result.property(parts[i]);
			}
		}
		return result;
	},
	defined: function () {
		return this.basicType() != undefined;
	},
	setValue: function (newValue) {
		if (typeof newValue == "undefined") {
			return this.remove();
		}
		if (this.basicType() != "object" && this.basicType() != "array" && this.value() === newValue) {
			return this;
		}
		var patch = new Patch();
		if (this.defined()) {
			patch.replace(this.pointerPath(), newValue);
		} else {
			patch.add(this.pointerPath(), newValue);
		}
		this.document.patch(patch, this);
		return this;
	},
	remove: function () {
		var patch = new Patch();
		patch.remove(this.pointerPath());
		this.document.patch(patch, this);
		return this;
	},
	itemValue: function (index) {
		return this.index(index).value();
	},
	removeItem: function (index) {
		this.index(index).remove();
		return this;
	},
	insertItem: function (index, value) {
		if (this.basicType() != "array") {
			throw Error("cannot insert into a non-array");
		}
		var patch = new Patch();
		patch.add(this.item(index).pointerPath(), value);
		this.document.patch(patch, this);
		return this;
	},
	push: function (value) {
		if (this.basicType() == "array") {
			this.index(this.length()).setValue(value);
		} else {
			throw new Error("Can only push() on an array");
		}
		return this;
	},
	propertyValue: function (key) {
		return this.property(key).value();
	},
	removeProperty: function (key) {
		this.property(key).remove();
		return this;
	},
	moveTo: function (target) {
		if (typeof target == "object") {
			if (target.document != this.document) {
				var value = this.value();
				this.remove();
				target.setValue(value);
				return target;
			}
			target = target.pointerPath();
		}
		var patch = new Patch();
		var pointerPath = this.pointerPath();
		if (target == pointerPath) {
			return;
		}
		patch.move(pointerPath, target);
		this.document.patch(patch, this);
		return this.document.root.subPath(target);
	},
	getLink: function (rel) {
		var links = this.links(rel);
		return links[0];
	},
	equals: function (otherData) {
		var i;
		var basicType = this.basicType();
		if (basicType != otherData.basicType()) {
			return false;
		}
		if (basicType == "array") {
			if (this.length() !== otherData.length()) {
				return false;
			}
			for (i = 0; i < this.length(); i++) {
				if (!this.index(i).equals(otherData.index(i))) {
					return false;
				}
			}
			return true;
		} else if (basicType == "object") {
			var i;
			var keys = this.keys();
			var otherKeys = otherData.keys();
			if (keys.length != otherKeys.length) {
				return false;
			}
			keys.sort();
			otherKeys.sort();
			for (i = 0; i < keys.length; i++) {
				if (keys[i] !== otherKeys[i]) {
					return false;
				}
			}
			for (i = 0; i < keys.length; i++) {
				var key = keys[i];
				if (!this.property(key).equals(otherData.property(key))) {
					return false;
				}
			}
			return true;
		} else {
			return this.value() === otherData.value();
		}
	},
	readOnlyCopy: function () {
		if (this.readOnly()) {
			return this;
		}
		var copy = publicApi.create(this.value(), this.document.url + "#:copy", true);
		this.schemas().each(function (index, schema) {
			copy.addSchema(schema);
		});
		return copy;
	},
	editableCopy: function () {
		var copy = publicApi.create(this.value(), this.document.url + "#:copy", false);
		this.schemas().each(function (index, schema) {
			copy.addSchema(schema);
		});
		return copy;
	},
	asSchema: function () {
		var schema = new Schema(this.readOnlyCopy());
		if (this.readOnly()) {
			cacheResult(this, {asSchema: schema});
		}
		return schema;
	},
	asLink: function (targetData) {
		var readOnlyCopy = this.readOnlyCopy();
		var linkDefinition = new PotentialLink(readOnlyCopy);
		var result;
		if (targetData == undefined) {
			result = linkDefinition.linkForData(this);
		} else {
			result = linkDefinition.linkForData(targetData);
		}
		if (this.readOnly()) {
			cacheResult(this, {asLink: result});
		}
		return result;
	},
	items: function (callback) {
		for (var i = 0; i < this.length(); i++) {
			var subData = this.index(i);
			callback.call(subData, i, subData);
		}
		return this;
	},
	properties: function (callback) {
		var keys = this.keys();
		for (var i = 0; i < keys.length; i++) {
			var subData = this.property(keys[i]);
			callback.call(subData, keys[i], subData);
		}
		return this;
	},
	resolveUrl: function (url) {
		return this.document.resolveUrl(url);
	},
	get: function (path) {
		return this.subPath(path).value();
	},
	set: function (path, value) {
		this.subPath(path).setValue(value);
		return this;
	},
	json: function () {
		return JSON.stringify(this.value());
	}
};
Data.prototype.indices = Data.prototype.items;
Data.prototype.indexValue = Data.prototype.itemValue;
Data.prototype.removeIndex = Data.prototype.removeItem;
Data.prototype.index = function (index) {
	return this.item(index);
};

publicApi.extendData = function (obj) {
	for (var key in obj) {
		if (Data.prototype[key] == undefined) {
			Data.prototype[key] = obj[key];
		}
	}
};


publicApi.create = function (rawData, baseUrl, readOnly) {
	var definitive = baseUrl != undefined;
	if (baseUrl != undefined && baseUrl.indexOf("#") != -1) {
		var remainder = baseUrl.substring(baseUrl.indexOf("#") + 1);
		if (remainder != "") {
			definitive = false;
		}
		baseUrl = baseUrl.substring(0, baseUrl.indexOf("#"));
	}
	var document = new Document(baseUrl, definitive, readOnly);
	document.setRaw(rawData);
	document.setRoot("");
	return document.root;
};


function getSchema(url, callback) {
	return publicApi.getData(url, function(data, fragmentRequest) {
		var schema = data.asSchema();
		if (callback != undefined) {
			callback.call(schema, schema, fragmentRequest);
		}
	});
}
publicApi.createSchema = function (rawData, baseUrl) {
	var data = publicApi.create(rawData, baseUrl, true);
	return data.asSchema();
};

publicApi.getSchema = getSchema;

var ALL_TYPES = ["null", "boolean", "integer", "number", "string", "array", "object"];
var TYPE_SCHEMAS = {};
function getTypeSchema(basicType) {
	if (TYPE_SCHEMAS[basicType] == undefined) {
		TYPE_SCHEMAS[basicType] = publicApi.createSchema({"type": basicType});
	}
	return TYPE_SCHEMAS[basicType];
}

function Schema(data) {
	this.data = data;
	var referenceUrl = data.referenceUrl();
	var id = data.propertyValue("id");
	// TODO: if id is set, then cache it somehow, so we can find it again?

	var potentialLinks = [];
	var i, linkData;
	var linkDefinitions = data.property("links");
	if (linkDefinitions !== undefined) {
		linkDefinitions.indices(function (index, subData) {
			potentialLinks[potentialLinks.length] = new PotentialLink(subData);
		});
	}
	this.links = function () {
		return potentialLinks.slice(0);
	};
	this.schemaTitle = this.title();	
}
Schema.prototype = {
	"toString": function () {
		return "<Schema " + this.data + ">";
	},
	referenceUrl: function () {
		return this.data.referenceUrl();
	},
	isComplete: function () {
		var refUrl = this.data.propertyValue("$ref");
		return refUrl === undefined;
	},
	getFull: function (callback) {
		var refUrl = this.data.propertyValue("$ref");
		if (refUrl === undefined) {
			callback(this, undefined);
			return;
		}
		refUrl = this.data.resolveUrl(refUrl);
		getSchema(refUrl, callback);
		return this;
	},
	title: function () {
		var title = this.data.propertyValue("title");
		if (title == undefined) {
			title = null;
		}
		return title;
	},
	hasDefault: function() {
		return this.data.property("default").defined();
	},
	defaultValue: function() {
		return this.data.propertyValue("default");
	},
	propertySchemas: function (key) {
		var schemas = [];
		var subSchema = this.data.property("properties").property(key);
		if (subSchema.defined()) {
			schemas.push(subSchema.asSchema());
		}
		this.data.property("patternProperties").properties(function (patternKey, subData) {
			var regEx = new RegExp(patternKey);
			if (regEx.test(key)) {
				schemas.push(subData.asSchema());
			}
		});
		if (schemas.length == 0) {
			subSchema = this.data.property("additionalProperties");
			if (subSchema.defined()) {
				schemas.push(subSchema.asSchema());
			}
		}
		return new SchemaList(schemas);
	},
	propertyDependencies: function (key) {
		var dependencies = this.data.property("dependencies");
		if (dependencies.defined()) {
			var dependency = dependencies.property(key);
			if (dependency.defined()) {
				if (dependency.basicType() == "string") {
					return [dependency.value()];
				} else if (dependency.basicType() == "array") {
					return dependency.value();
				} else {
					return new SchemaList([dependency.asSchema()]);
				}
			}
		}
		return new SchemaList();
	},
	indexSchemas: function (i) {
		var items = this.data.property("items");
		var subSchema;
		if (!items.defined()) {
			return new SchemaList();
		}
		if (items.basicType() == "array") {
			subSchema = items.index(i);
			if (!subSchema.defined()) {
				subSchema = this.data.property("additionalItems");
			}
		} else {
			subSchema = items;
		}
		if (subSchema.defined()) {
			var result = subSchema.asSchema();
			return new SchemaList([result]);
		}
		return new SchemaList();
	},
	andSchemas: function () {
		var result = [];
		var extData = this.data.property("extends");
		if (extData.defined()) {
			if (extData.basicType() == "array") {
				extData.indices(function (i, e) {
					result.push(e.asSchema());
				});
			} else {
				result.push(extData.asSchema());
			}
		}
		this.data.property("allOf").items(function (index, data) {
			result.push(data.asSchema());
		});
		return new SchemaList(result);
	},
	notSchemas: function () {
		var result = [];
		var disallowData = this.data.property("disallow");
		if (disallowData.defined()) {
			if (disallowData.basicType() == "array") {
				disallowData.indices(function (i, e) {
					if (e.basicType() == "string") {
						result.push(publicApi.createSchema({type: e.value()}));
					} else {
						result.push(e.asSchema());
					}
				});
			} else if (disallowData.basicType() == "string") {
				result.push(publicApi.createSchema({type: disallowData.value()}));
			} else {
				result.push(disallowData.asSchema());
			}
		}
		if (this.data.property("not").defined()) {
			result.push(this.data.property("not").asSchema());
		}
		return new SchemaList(result);
	},
	types: function () {
		var typeData = this.data.property("type");
		if (typeData.defined()) {
			if (typeData.basicType() === "string") {
				if (typeData.value() == "all") {
					return ALL_TYPES.slice(0);
				}
				return [typeData.value()];
			} else {
				var types = [];
				for (var i = 0; i < typeData.length(); i++) {
					if (typeData.item(i).basicType() == "string") {
						if (typeData.item(i).value() == "all") {
							return ALL_TYPES.slice(0);
						}
						types.push(typeData.item(i).value());
					} else {
						return ALL_TYPES.slice(0);
					}
				}
				if (types.indexOf("number") != -1 && types.indexOf("integer") == -1) {
					types.push("integer");
				}
				return types;
			}
		}
		return ALL_TYPES.slice(0);
	},
	xorSchemas: function () {
		var result = [];
		var typeData = this.data.property("type");
		if (typeData.defined()) {
			for (var i = 0; i < typeData.length(); i++) {
				if (typeData.item(i).basicType() != "string") {
					var xorGroup = [];
					typeData.items(function (index, subData) {
						if (subData.basicType() == "string") {
							xorGroup.push(getTypeSchema(subData.value()));
						} else {
							xorGroup.push(subData.asSchema());
						}
					});
					result.push(xorGroup);
					break;
				}
			}
		}
		if (this.data.property("oneOf").defined()) {
			var xorGroup = [];
			this.data.property("oneOf").items(function (index, subData) {
				xorGroup.push(subData.asSchema());
			});
			result.push(xorGroup);
		}
		return result;
	},
	orSchemas: function () {
		var result = [];
		var typeData = this.data.property("type");
		if (this.data.property("anyOf").defined()) {
			var orGroup = [];
			this.data.property("anyOf").items(function (index, subData) {
				orGroup.push(subData.asSchema());
			});
			result.push(orGroup);
		}
		return result;
	},
	equals: function (otherSchema) {
		if (this === otherSchema) {
			return true;
		}
		if (this.referenceUrl() !== undefined && otherSchema.referenceUrl() !== undefined) {
			return this.referenceUrl() === otherSchema.referenceUrl();
		}
		return this.data.equals(otherSchema.data);
	},
	enumValues: function () {
		return this.data.propertyValue("enum");
	},
	enumData: function () {
		return this.data.property("enum");
	},
	minItems: function () {
		var result = this.data.propertyValue("minItems");
		if (result == undefined) {
			return 0;
		}
		return result;
	},
	maxItems: function () {
		return this.data.propertyValue("maxItems");
	},
	tupleTypingLength: function () {
		if (this.data.property("items").basicType() != "array") {
			return 0;
		}
		return this.data.property("items").length();
	},
	minLength: function () {
		var result = this.data.propertyValue("minLength");
		if (result == undefined) {
			return 0;
		}
		return result;
	},
	maxLength: function () {
		return this.data.propertyValue("maxLength");
	},
	numberInterval: function() {
		return this.data.propertyValue("divisibleBy");
	},
	minimum: function () {
		return this.data.propertyValue("minimum");
	},
	exclusiveMinimum: function () {
		return !!this.data.propertyValue("exclusiveMinimum");
	},
	maximum: function () {
		return this.data.propertyValue("maximum");
	},
	exclusiveMaximum: function () {
		return !!this.data.propertyValue("exclusiveMaximum");
	},
	minProperties: function () {
		var result = this.data.propertyValue("minProperties");
		if (result == undefined) {
			return 0;
		}
		return result;
	},
	maxProperties: function () {
		return this.data.propertyValue("maxProperties");
	},
	definedProperties: function() {
		var result = {};
		this.data.property("properties").properties(function (key, subData) {
			result[key] = true;
		});
		this.data.property("required").items(function (index, subData) {
			result[subData.value()] = true;
		});
		var resultArray = [];
		for (var key in result) {
			resultArray.push(key);
		}
		return resultArray;
	},
	requiredProperties: function () {
		var requiredKeys = this.data.propertyValue("required");
		if (typeof requiredKeys != "object") {
			requiredKeys = [];
		}
		var properties = this.data.property("properties");
		if (properties != undefined) {
			properties.properties(function (key, subData) {
				var required = subData.property("required");
				if (required != undefined && required.basicType() == "boolean" && required.value()) {
					requiredKeys.push(key);
				}
			});
		}
		return requiredKeys;
	},
	allowedAdditionalProperties: function () {
		return !(this.data.propertyValue("additionalProperties") === false);
	},
	getLink: function (rel) {
		var links = this.links();
		for (var i = 0; i < links.length; i++) {
			if (links[i].rel() == rel) {
				return links[i];
			}
		}
	},
	asList: function () {
		return new SchemaList([this]);
	},
	format: function () {
		return this.data.propertyValue("format");
	}
};
Schema.prototype.basicTypes = Schema.prototype.types;
Schema.prototype.extendSchemas = Schema.prototype.andSchemas;

publicApi.extendSchema = function (obj) {
	for (var key in obj) {
		if (Schema.prototype[key] == undefined) {
			Schema.prototype[key] = obj[key];
		}
	}
};

var extraEscaping = {
	"!": "%21",
	"'": "%27",
	"(": "%28",
	")": "%29",
	"*": "%2A"
};
function preProcessUriTemplate(template) {
	var newTemplate = [];
	var curlyBrackets = false;
	var roundBrackets = false;
	for (var i = 0; i < template.length; i++) {
		var tChar = template.charAt(i);
		if (!curlyBrackets) {
			if (tChar == "{") {
				curlyBrackets = true;
			}
			newTemplate.push(tChar);
		} else if (!roundBrackets) {
			if (tChar == "$") {
				newTemplate.push("%73elf");
				continue;
			} else if (tChar == "(") {
				if (template.charAt(i + 1) == ")") {
					newTemplate.push("%65mpty");
					i++;
				} else {
					roundBrackets = true;
				}
				continue;
			} else if (tChar == "}") {
				curlyBrackets = false;
			}
			newTemplate.push(tChar);
		} else {
			if (tChar == ")") {
				if (template.charAt(i + 1) == ")") {
					newTemplate.push(extraEscaping[")"]);
					i++;
				} else {
					roundBrackets = false;
				}
				continue;
			}
			if (extraEscaping[tChar] != undefined) {
				newTemplate.push(extraEscaping[tChar])
			} else {
				newTemplate.push(encodeURIComponent(tChar));
			}
		}
	}
	return newTemplate.join("");
}

function PotentialLink(linkData) {
	this.data = linkData;
	
	this.uriTemplate = new UriTemplate(preProcessUriTemplate(linkData.propertyValue("href")));
	this.dataParts = [];
	for (var i = 0; i < this.uriTemplate.varNames.length; i++) {
		this.dataParts.push(translateUriTemplateName(this.uriTemplate.varNames[i]));
	}
	
	var schemaData = linkData.property("schema");
	if (schemaData.defined()) {
		var schema = schemaData.asSchema();
		this.submissionSchemas = new SchemaList([schema]);
	} else {
		this.submissionSchemas = new SchemaList();
	}
	var targetSchemaData = linkData.property("targetSchema");
	if (targetSchemaData.defined()) {
		this.targetSchema = targetSchemaData.asSchema();
	}
	
	this.handlers = [];
	this.preHandlers = [];
}
function translateUriTemplateName(varName) {
	if (varName == "%65mpty") {
		return "";
	} else if (varName == "%73elf") {
		return null;
	}
	return decodeURIComponent(varName);
}
PotentialLink.prototype = {
	addHandler: function(handler) {
		this.handlers.unshift(handler);
		return this;
	},
	addPreHandler: function(handler) {
		this.preHandlers.push(handler);
		return this;
	},
	canApplyTo: function (privateData) {
		var i, key, subData = null, basicType;
		for (i = 0; i < this.dataParts.length; i++) {
			key = this.dataParts[i];
			if (key === null) {
				subData = privateData;
			} else if (privateData.basicType() == "object") {
				subData = privateData.property(key);
			} else if (privateData.basicType() == "array" && isIndex(key)) {
				subData = privateData.index(key);
			}
			if (subData == undefined) {
				return false;
			}
			basicType = subData.basicType();
			if (basicType != "string" && basicType != "number" && basicType != "integer") {
				return false;
			}
		}
		return true;
	},
	linkForData: function (publicData) {
		var rawLink = this.data.value();
		var href = this.uriTemplate.fill(function (varName) {
			varName = translateUriTemplateName(varName);
			if (varName == null) {
				return publicData.value();
			}
			if (publicData.basicType() == "array") {
				return publicData.itemValue(varName);
			} else {
				return publicData.propertyValue(varName);
			}
		});
		rawLink.href = publicData.resolveUrl(href);
		return new ActiveLink(rawLink, this, publicData);
	},
	usesKey: function (key) {
		var i;
		for (i = 0; i < this.dataParts.length; i++) {
			if (this.dataParts[i] === key) {
				return true;
			}
		}
		return false;
	},
	rel: function () {
		return this.data.propertyValue("rel");
	}
};

var defaultLinkHandlers = [];
var defaultLinkPreHandlers = [];
publicApi.addLinkHandler = function(handler) {
	defaultLinkHandlers.unshift(handler);
};
publicApi.addLinkPreHandler = function(handler) {
	defaultLinkPreHandlers.push(handler);
};

function ActiveLink(rawLink, potentialLink, data) {
	this.rawLink = rawLink;
	this.definition = potentialLink;
	this.subjectData = data;

	this.href = rawLink.href;
	var hashIndex = this.href.indexOf('#');
	if (hashIndex >= 0) {
		this.hrefBase = this.href.substring(0, hashIndex);
		this.hrefFragment = this.href.substring(hashIndex + 1);
	} else {
		this.hrefBase = this.href;
		this.hrefFragment = "";
	}

	this.rel = rawLink.rel;
	this.method = (rawLink.method != undefined) ? rawLink.method : "GET";
	if (rawLink.enctype != undefined) {
		rawLink.encType = rawLink.enctype;
		delete rawLink.enctype;
	}
	if (rawLink.encType == undefined) {
		if (this.method == "GET") {
			this.encType = "application/x-www-form-urlencoded";
		} else if (this.method == "POST" || this.method == "PUT") {
			this.encType = "application/json";
		} else {
			this.encType = "application/x-www-form-urlencoded";
		}
	} else {
		this.encType = rawLink.encType;
	}
	if (this.definition != null) {
		this.submissionSchemas = this.definition.submissionSchemas;
		this.targetSchema = this.definition.targetSchema;
	}
}
var ACTIVE_LINK_SCHEMA_KEY = Utils.getUniqueKey();
ActiveLink.prototype = {
	toString: function() {
		return this.href;
	},
	createSubmissionData: function(callback) {
		var hrefBase = this.hrefBase;
		var submissionSchemas = this.submissionSchemas;
		if (callback != undefined && submissionSchemas.length == 0 && this.method == "PUT") {
			Jsonary.getData(this.href, function (data) {
				callback(data.editableCopy());
			})
			return this;
		}
		if (callback != undefined) {
			submissionSchemas.createValue(function (value) {
				var data = publicApi.create(value, hrefBase);
				for (var i = 0; i < submissionSchemas.length; i++) {
					data.addSchema(submissionSchemas[i], ACTIVE_LINK_SCHEMA_KEY);
				}
				callback(data);
			});
		} else {
			var value = submissionSchemas.createValue();
			var data = publicApi.create(value, hrefBase);
			for (var i = 0; i < submissionSchemas.length; i++) {
				data.addSchema(submissionSchemas[i], ACTIVE_LINK_SCHEMA_KEY);
			}
			return data;
		}
	},
	follow: function(submissionData, extraHandler) {
		if (typeof submissionData == 'function') {
			extraHandler = submissionData;
			submissionData = undefined;
		}
		if (submissionData !== undefined) {
			if (!(submissionData instanceof Data)) {
				submissionData = publicApi.create(submissionData);
			}
		} else {
			submissionData = publicApi.create(undefined);
		}
		var preHandlers = defaultLinkPreHandlers.concat(this.definition.preHandlers);
		for (var i = 0; i < preHandlers.length; i++) {
			var handler = preHandlers[i];
			if (handler.call(this, this, submissionData) === false) {
				Utils.log(Utils.logLevel.DEBUG, "Link cancelled: " + this.href);
				return null;
			}
		}
		var value = submissionData.value();
		
		var request = publicApi.getData({
			url:this.href,
			method:this.method,
			data:value,
			encType:this.encType
		}, null, this.targetSchema);
		submissionData = submissionData.readOnlyCopy();
		var handlers = this.definition.handlers.concat(defaultLinkHandlers);
		if (extraHandler !== undefined) {
			handlers.unshift(extraHandler);
		}
		for (var i = 0; i < handlers.length; i++) {
			var handler = handlers[i];
			if (handler.call(this, this, submissionData, request) === false) {
				break;
			}
		}
		return request;
	}
};


function SchemaMatch(monitorKey, data, schema) {
	var thisSchemaMatch = this;
	this.monitorKey = monitorKey;
	this.match = false;
	this.matchFailReason = new SchemaMatchFailReason("initial failure", null);
	this.monitors = new MonitorSet(schema);
	
	this.propertyMatches = {};
	this.indexMatches = {};

	this.dependencies = {};
	this.dependencyKeys = {};

	this.schemaLoaded = false;
	this.data = data;
	schema.getFull(function (schema) {
		thisSchemaMatch.schemaLoaded = true;
		thisSchemaMatch.schema = schema;

		thisSchemaMatch.basicTypes = schema.basicTypes();
		thisSchemaMatch.setupXorSelectors();
		thisSchemaMatch.setupOrSelectors();
		thisSchemaMatch.setupAndMatches();
		thisSchemaMatch.setupNotMatches();
		thisSchemaMatch.dataUpdated();
	});
}
SchemaMatch.prototype = {
	setupXorSelectors: function () {
		var thisSchemaMatch = this;
		this.xorSelectors = {};
		var xorSchemas = this.schema.xorSchemas();
		for (var i = 0; i < xorSchemas.length; i++) {
			var xorSelector = new XorSelector(Utils.getKeyVariant(this.monitorKey, "xor" + i), xorSchemas[i], this.data);
			this.xorSelectors[i] = xorSelector;
			xorSelector.onMatchChange(function (selectedOption) {
				thisSchemaMatch.update();
			}, false);
		}
	},
	setupOrSelectors: function () {
		var thisSchemaMatch = this;
		this.orSelectors = {};
		var orSchemas = this.schema.orSchemas();
		for (var i = 0; i < orSchemas.length; i++) {
			var orSelector = new OrSelector(Utils.getKeyVariant(this.monitorKey, "or" + i), orSchemas[i], this.data);
			this.orSelectors[i] = orSelector;
			orSelector.onMatchChange(function (selectedOptions) {
				thisSchemaMatch.update();
			}, false);
		}
	},
	setupAndMatches: function () {
		var thisSchemaMatch = this;
		this.andMatches = [];
		var andSchemas = this.schema.andSchemas();
		andSchemas.each(function (index, subSchema) {
			var keyVariant = Utils.getKeyVariant(thisSchemaMatch.monitorKey, "and" + index);
			var subMatch = thisSchemaMatch.data.addSchemaMatchMonitor(keyVariant, subSchema, function () {
				thisSchemaMatch.update();
			}, false);
			thisSchemaMatch.andMatches.push(subMatch);
		});
	},
	setupNotMatches: function () {
		var thisSchemaMatch = this;
		this.notMatches = [];
		var notSchemas = this.schema.notSchemas();
		notSchemas.each(function (index, subSchema) {
			var keyVariant = Utils.getKeyVariant(thisSchemaMatch.monitorKey, "not" + index);
			var subMatch = thisSchemaMatch.data.addSchemaMatchMonitor(keyVariant, subSchema, function () {
				thisSchemaMatch.update();
			}, false);
			thisSchemaMatch.notMatches.push(subMatch);
		});
	},
	addMonitor: function (monitor, executeImmediately) {
		// TODO: make a monitor set that doesn't require keys.  The keyed one could use it!
		this.monitors.add(this.monitorKey, monitor);
		if (executeImmediately !== false) {
			monitor.call(this.schema, this.match, this.matchFailReason);
		}
		return this;
	},
	dataUpdated: function (key) {
		if (!this.schemaLoaded) {
			return;
		}
		var thisSchemaMatch = this;
		if (this.data.basicType() == "object") {
			this.indexMatches = {};
			this.data.properties(function (key, subData) {
				if (thisSchemaMatch.propertyMatches[key] == undefined) {
					var matches = [];
					var subSchemas = thisSchemaMatch.schema.propertySchemas(key);
					subSchemas.each(function (i, subSchema) {
						var subMatch = subData.addSchemaMatchMonitor(thisSchemaMatch.monitorKey, subSchemas[i], function () {
							thisSchemaMatch.subMatchUpdated(key, subMatch);
						}, false);
						matches.push(subMatch);
					});
					thisSchemaMatch.propertyMatches[key] = matches;
					thisSchemaMatch.addDependencies(key);
				}
			});
			var keysToRemove = [];
			for (var key in this.propertyMatches) {
				if (!this.data.property(key).defined()) {
					keysToRemove.push(key);
				}
			};
			for (var i = 0; i < keysToRemove.length; i++) {
				var key = keysToRemove[i];
				delete this.propertyMatches[key];
				if (this.dependencyKeys[key] != undefined) {
					this.data.removeSchema(this.dependencyKeys[key]);
					delete this.dependencies[key];
					delete this.dependencyKeys[key];
				}
			}
		} else if (this.data.basicType() == "array") {
			this.propertyMatches = {};
			this.data.indices(function (index, subData) {
				if (thisSchemaMatch.indexMatches[index] == undefined) {
					var matches = [];
					var subSchemas = thisSchemaMatch.schema.indexSchemas(index);
					subSchemas.each(function (i, subSchema) {
						var subMatch = subData.addSchemaMatchMonitor(thisSchemaMatch.monitorKey, subSchemas[i], function () {
							thisSchemaMatch.subMatchUpdated(key, subMatch);
						}, false);
						matches.push(subMatch);
					});
					thisSchemaMatch.indexMatches[index] = matches;
				}
			});
			var keysToRemove = [];
			for (var key in this.indexMatches) {
				if (this.data.length() <= key) {
					keysToRemove.push(key);
				}
			};
			for (var i = 0; i < keysToRemove.length; i++) {
				delete this.indexMatches[keysToRemove[i]];
			}
		} else {
			this.propertyMatches = {};
			this.indexMatches = {};
		}
		this.update();
	},
	addDependencies: function (key) {
		var thisSchemaMatch = this;
		var dependencies = this.schema.propertyDependencies(key);
		this.dependencies[key] = [];
		this.dependencyKeys[key] = [];
		for (var i = 0; i < dependencies.length; i++) {
			var dependency = dependencies[i];
			if (typeof (dependency) == "string") {
				this.dependencies[key].push(dependency);
			} else {
				(function (index) {
					var subMonitorKey = Utils.getKeyVariant(thisSchemaMatch.monitorKey, "dep:" + key + ":" + index);
					thisSchemaMatch.dependencyKeys[key].push(subMonitorKey);
					var subMatch = thisSchemaMatch.data.addSchemaMatchMonitor(subMonitorKey, dependency, function () {
						thisSchemaMatch.dependencyUpdated(key, index);
					}, false);
					thisSchemaMatch.dependencies[key].push(subMatch);
				})(i);
			}
		}
	},
	notify: function () {
		this.monitors.notify(this.match, this.matchFailReason);
	},
	setMatch: function (match, failReason) {
		if (match && this.match) {
			// If we're failing but not changing state, then the failReason has possibly changed
			// However, if we're succeeding then nothing has changed, so don't notify anybody
			return;
		}
		if (!match && !this.match && this.matchFailReason.equals(failReason)) {
			return;
		}
		this.match = match;
		if (!match) {
			this.matchFailReason = failReason;
		} else {
			this.matchFailReason = null;
		}
		this.notify();
	},
	subMatchUpdated: function (indexKey, subMatch) {
		this.update();
	},
	subMatchRemoved: function (indexKey, subMatch) {
		this.update();
	},
	dependencyUpdated: function (key, index) {
		this.update();
	},
	update: function () {
		try {
			this.matchAgainstBasicTypes();
			this.matchAgainstSubMatches();
			this.matchAgainstImmediateConstraints();
			this.setMatch(true);
		} catch (exception) {
			if (exception instanceof SchemaMatchFailReason) {
				this.setMatch(false, exception);
			} else {
				throw exception;
			}
		}
	},
	matchAgainstBasicTypes: function () {
		var basicType = this.data.basicType();
		for (var i = 0; i < this.basicTypes.length; i++) {
			if (this.basicTypes[i] == basicType || basicType == "integer" && this.basicTypes[i] == "number") {
				return;
			}
		}
		throw new SchemaMatchFailReason("Data does not match any of the basic types: " + this.basicTypes, this.schema);
	},
	matchAgainstSubMatches: function () {
		for (var i = 0; i < this.andMatches.length; i++) {
			var andMatch = this.andMatches[i];
			if (!andMatch.match) {
				var message = "extended schema #" + i + ": " + andMatch.message;
				throw new SchemaMatchFailReason(message, this.schema, andMatch.failReason);
			}
		}
		for (var i = 0; i < this.notMatches.length; i++) {
			var notMatch = this.notMatches[i];
			if (notMatch.match) {
				var message = "\"not\" schema #" + i + " matches";
				throw new SchemaMatchFailReason(message, this.schema);
			}
		}
		for (var key in this.xorSelectors) {
			var selector = this.xorSelectors[key];
			if (selector.selectedOption == null) {
				var message = "XOR #" + key + ": " + selector.failReason.message;
				throw new SchemaMatchFailReason(message, this.schema, selector.failReason);
			}
		}
		for (var key in this.orSelectors) {
			var selector = this.orSelectors[key];
			if (selector.selectedOptions.length == 0) {
				var message = "OR #" + key + ": no matches";
				throw new SchemaMatchFailReason(message, this.schema);
			}
		}
		for (var key in this.propertyMatches) {
			var subMatchList = this.propertyMatches[key];
			for (var i = 0; i < subMatchList.length; i++) {
				var subMatch = subMatchList[i];
				if (!subMatch.match) {
					var message = key + ": " + subMatch.matchFailReason.message;
					throw new SchemaMatchFailReason(message, this.schema, subMatch.matchFailReason);
				}
			}
		}
		for (var key in this.indexMatches) {
			var subMatchList = this.indexMatches[key];
			for (var i = 0; i < subMatchList.length; i++) {
				var subMatch = subMatchList[i];
				if (!subMatch.match) {
					var message = key + ": " + subMatch.matchFailReason.message;
					throw new SchemaMatchFailReason(message, this.schema, subMatch.matchFailReason);
				}
			}
		}
	},
	matchAgainstImmediateConstraints: function () {
		this.matchAgainstEnums();
		this.matchAgainstNumberConstraints();
		this.matchAgainstArrayConstraints();
		this.matchAgainstObjectConstraints();
	},
	matchAgainstEnums: function () {
		var enumList = this.schema.enumData();
		if (enumList.defined()) {
			for (var i = 0; i < enumList.length(); i++) {
				var enumValue = enumList.index(i);
				if (enumValue.equals(this.data)) {
					return;
				}
			}
			throw new SchemaMatchFailReason("Data does not match enum: " + JSON.stringify(enumList.value()) + " (" + JSON.stringify(this.data.value()) + ")", this.schema);
		}
	},
	matchAgainstNumberConstraints: function () {
		if (this.data.basicType() != "number" && this.data.basicType() != "integer") {
			return;
		}
		var value = this.data.value();
		var interval = this.schema.numberInterval();
		if (interval != undefined) {
			if (value%interval != 0) {
				throw new SchemaMatchFailReason("Number must be divisible by " + interval);
			}
		}
		var minimum = this.schema.minimum();
		if (minimum !== undefined) {
			if (this.schema.exclusiveMinimum()) {
				if (value <= minimum) {
					throw new SchemaMatchFailReason("Number must be > " + minimum);
				}
			} else if (value < minimum) {
				throw new SchemaMatchFailReason("Number must be >= " + minimum);
			}
		}
		var maximum = this.schema.maximum();
		if (maximum != undefined) {
			if (this.schema.exclusiveMaximum()) {
				if (value >= maximum) {
					throw new SchemaMatchFailReason("Number must be < " + maximum);
				}
			} else if (value > maximum) {
				throw new SchemaMatchFailReason("Number must be <= " + maximum);
			}
		}
	},
	matchAgainstArrayConstraints: function () {
		if (this.data.basicType() != "array") {
			return;
		}
		var minItems = this.schema.minItems();
		if (minItems !== undefined && minItems > this.data.length()) {
			throw new SchemaMatchFailReason("Data is not long enough - minimum length is " + minItems, this.schema);
		}
		var maxItems = this.schema.maxItems();
		if (maxItems !== undefined && maxItems < this.data.length()) {
			throw new SchemaMatchFailReason("Data is too long - maximum length is " + maxItems, this.schema);
		}
	},
	matchAgainstObjectConstraints: function () {
		if (this.data.basicType() != "object") {
			return;
		}
		var required = this.schema.requiredProperties();
		for (var i = 0; i < required.length; i++) {
			var key = required[i];
			if (!this.data.property(key).defined()) {
				throw new SchemaMatchFailReason("Missing key " + JSON.stringify(key), this.schema);
			}
		}
		this.matchAgainstDependencies();
	},
	matchAgainstDependencies: function () {
		for (var key in this.dependencies) {
			if (this.data.property(key) == undefined) {
				continue;
			}
			var dependencyList = this.dependencies[key];
			for (var i = 0; i < dependencyList.length; i++) {
				var dependency = dependencyList[i];
				if (typeof dependency == "string") {
					if (!this.data.property(dependency).defined()) {
						throw new SchemaMatchFailReason("Dependency - property " + JSON.stringify(key) + " requires property " + JSON.stringify(dependency), this.schema);
					}
				} else {
					if (!dependency.match) {
						throw new SchemaMatchFailReason("Dependency for " + key, this.schema, dependency.matchFailReason);
					}
				}
			}
		}
	}
};

function SchemaMatchFailReason(message, schema, subMatchFailReason) {
	this.message = message;
	this.schema = schema;
	this.subMatchFailReason = subMatchFailReason;
}
SchemaMatchFailReason.prototype = new Error();
SchemaMatchFailReason.prototype.toString = function () {
	return this.message + " in " + this.schema.title();
};
SchemaMatchFailReason.prototype.equals = function (other) {
	if (!(other instanceof SchemaMatchFailReason)) {
		return false;
	}
	if (this.subMatchFailReason == null) {
		if (other.subMatchFailReason != null) {
			return false;
		}
	} else if (other.subMatchFailReason == null || !this.subMatchFailReason.equals(other.subMatchFailReason)) {
		return false;
	}
	return this.message == other.message && (this.schema == null && other.schema == null || this.schema != null && other.schema != null && this.schema.equals(other.schema));
};

function XorSelector(schemaKey, options, dataObj) {
	var thisXorSelector = this;
	this.options = options;
	this.matchCallback = null;
	this.selectedOption = null;
	this.data = dataObj;
	
	this.subMatches = [];
	this.subSchemaKeys = [];
	var pendingUpdate = false;
	for (var i = 0; i < options.length; i++) {
		this.subSchemaKeys[i] = Utils.getKeyVariant(schemaKey, "option" + i);
		this.subMatches[i] = dataObj.addSchemaMatchMonitor(this.subSchemaKeys[i], options[i], function () {
			if (pendingUpdate) {
				return;
			}
			pendingUpdate = true;
			DelayedCallbacks.add(function () {
				pendingUpdate = false;
				thisXorSelector.update();
			});
		}, false);
	}
	this.update();
}
XorSelector.prototype = {
	onMatchChange: function (callback, executeImmediately) {
		this.matchCallback = callback;
		if (executeImmediately !== false) {
			callback.call(this, this.selectedOption);
		}
		return this;
	},
	update: function () {
		var nextOption = null;
		var failReason = "No matches";
		for (var i = 0; i < this.subMatches.length; i++) {
			if (this.subMatches[i].match) {
				if (nextOption == null) {
					nextOption = this.options[i];
					failReason = null;
				} else {
					failReason = "multiple matches";
					nextOption = null;
					break;
				}
			}
		}
		this.failReason = new SchemaMatchFailReason(failReason);
		if (this.selectedOption != nextOption) {
			this.selectedOption = nextOption;
			if (this.matchCallback != undefined) {
				this.matchCallback.call(this, this.selectedOption);
			}
		}
	}
};

function OrSelector(schemaKey, options, dataObj) {
	var thisOrSelector = this;
	this.options = options;
	this.matchCallback = null;
	this.selectedOptions = [];
	this.data = dataObj;
	
	this.subMatches = [];
	this.subSchemaKeys = [];
	var pendingUpdate = false;
	for (var i = 0; i < options.length; i++) {
		this.subSchemaKeys[i] = Utils.getKeyVariant(schemaKey, "option" + i);
		this.subMatches[i] = dataObj.addSchemaMatchMonitor(this.subSchemaKeys[i], options[i], function () {
			if (pendingUpdate) {
				return;
			}
			pendingUpdate = true;
			DelayedCallbacks.add(function () {
				pendingUpdate = false;
				thisOrSelector.update();
			});
		}, false);
	}
	this.update();
}
OrSelector.prototype = {
	onMatchChange: function (callback, executeImmediately) {
		this.matchCallback = callback;
		if (executeImmediately !== false) {
			callback.call(this, this.selectedOptions);
		}
		return this;
	},
	update: function () {
		var nextOptions = [];
		var failReason = "No matches";
		for (var i = 0; i < this.subMatches.length; i++) {
			if (this.subMatches[i].match) {
				nextOptions.push(this.options[i]);
			}
		}
		var difference = false;
		if (nextOptions.length != this.selectedOptions.length) {
			difference = true;
		} else {
			for (var i = 0; i < nextOptions.length; i++) {
				if (nextOptions[i] != this.selectedOptions[i]) {
					difference = true;
					break;
				}
			}
		}
		if (difference) {
			this.selectedOptions = nextOptions;
			if (this.matchCallback != undefined) {
				this.matchCallback.call(this, this.selectedOptions);
			}
		}
	}
};

var schemaChangeListeners = [];
publicApi.registerSchemaChangeListener = function (listener) {
	schemaChangeListeners.push(listener);
};
function notifySchemaChangeListeners(data, schemaList) {
	for (var i = 0; i < schemaChangeListeners.length; i++) {
		schemaChangeListeners[i].call(data, data, schemaList);
	}
}

function LinkList(linkList) {
	for (var i = 0; i < linkList.length; i++) {
		this[i] = linkList[i];
	}
	this.length = linkList.length;
}
LinkList.prototype = {
	rel: function(rel) {
		if (rel == undefined) {
			return this;
		}
		var result = [];
		var i;
		for (i = 0; i < this.length; i++) {
			if (this[i].rel === rel) {
				result[result.length] = this[i];
			}
		}
		return new LinkList(result);
	}
};

// TODO: see how many calls to dataObj can be changed to just use this object
function SchemaList(schemaList) {
	if (schemaList == undefined) {
		this.length = 0;
		return;
	}
	var i;
	for (i = 0; i < schemaList.length; i++) {
		this[i] = schemaList[i];
	}
	this.length = schemaList.length;
}
var ALL_TYPES_DICT = {
	"null": true,
	"boolean": true,
	"integer": true,
	"number": true,
	"string": true,
	"array": true,
	"object": true
};
SchemaList.prototype = {
	containsUrl: function(url) {
		if (url instanceof RegExp) {
			for (var i = 0; i < this.length; i++) {
				var schema = this[i];
				if (url.test(schema.referenceUrl())) {
					return true;
				}
			}
		} else {
			if (url.indexOf('#') < 0) {
				url += "#";
			}
			for (var i = 0; i < this.length; i++) {
				var schema = this[i];
				var referenceUrl = schema.referenceUrl();
				if (referenceUrl != null && referenceUrl.substring(referenceUrl.length - url.length) == url) {
					return true;
				}
			}
		}
		return false;
	},
	potentialLinks: function () {
		var result = [];
		var i, schema;
		for (i = 0; i < this.length; i++) {
			schema = this[i];
			result = result.concat(schema.links());
		}
		return result;
	},
	each: function (callback) {
		for (var i = 0; i < this.length; i++) {
			callback.call(this, i, this[i]);
		}
		return this;
	},
	concat: function(other) {
		var newList = [];
		for (var i = 0; i < this.length; i++) {
			newList.push(this[i]);
		}
		for (var i = 0; i < other.length; i++) {
			newList.push(other[i]);
		}
		return new SchemaList(newList);
	},
	decisionSchemas: function () {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			var schema = this[i];
			if (schema.xorSchemas().length > 0 || schema.orSchemas().length > 0) {
				result.push(schema);
			}
		}
		return new SchemaList(result);
	},
	definedProperties: function () {
		var additionalProperties = true;
		var definedKeys = {};
		this.each(function (index, schema) {
			if (additionalProperties) {
				if (!schema.allowedAdditionalProperties()) {
					additionalProperties = false;
					definedKeys = {};
				}
				var definedProperties = schema.definedProperties();
				for (var i = 0; i < definedProperties.length; i++) {
					definedKeys[definedProperties[i]] = true;
				}
			} else {
				if (!schema.allowedAdditionalProperties()) {
					additionalProperties = false;
					var newKeys = {};
					var definedProperties = schema.definedProperties();
					for (var i = 0; i < definedProperties.length; i++) {
						if (definedKeys[definedProperties[i]]) {
							newKeys[definedProperties[i]] = true;
						}
					}
					definedKeys = newKeys;
				}
			}
		});
		var result = [];
		for (var key in definedKeys) {
			result.push(key);
		}
		cacheResult(this, {
			definedProperties: result,
			allowedAdditionalProperties: additionalProperties
		});
		return result;
	},
	allowedAdditionalProperties: function () {
		var additionalProperties = true;
		this.each(function (index, schema) {
			additionalProperties = (additionalProperties && schema.allowedAdditionalProperties());
		});
		cacheResult(this, {
			additionalProperties: additionalProperties
		});
		return additionalProperties;
	},
	minProperties: function () {
		var minProperties = 0;
		for (var i = 0; i < this.length; i++) {
			var otherMinProperties = this[i].minProperties();
			if (otherMinProperties > minProperties) {
				minProperties = otherMinProperties;
			}
		}
		return minProperties;
	},
	maxProperties: function () {
		var maxProperties = undefined;
		for (var i = 0; i < this.length; i++) {
			var otherMaxProperties = this[i].maxProperties();
			if (!(otherMaxProperties > maxProperties)) {
				maxProperties = otherMaxProperties;
			}
		}
		return maxProperties;
	},
	basicTypes: function () {
		var basicTypes = ALL_TYPES_DICT;
		for (var i = 0; i < this.length; i++) {
			var otherBasicTypes = this[i].basicTypes();
			var newBasicTypes = {};
			for (var j = 0; j < otherBasicTypes.length; j++) {
				var type = otherBasicTypes[j];
				if (basicTypes[type]) {
					newBasicTypes[type] = true;
				}
			}
			basicTypes = newBasicTypes;
		}
		var basicTypesList = [];
		for (var basicType in basicTypes) {
			basicTypesList.push(basicType);
		}
		return basicTypesList;
	},
	numberInterval: function() {
		var candidate = undefined;
		for (var i = 0; i < this.length; i++) {
			var interval = this[i].numberInterval();
			if (interval == undefined) {
				continue;
			}
			if (candidate == undefined) {
				candidate = interval;
			} else {
				candidate = Utils.lcm(candidate, interval);
			}
		}
		for (var i = 0; i < this.length; i++) {
			var basicTypes = this[i].basicTypes();
			var hasInteger = false;
			for (var j = 0; j < basicTypes.length; j++) {
				if (basicTypes[j] == "number") {
					hasInteger = false;
					break;
				} else if (basicTypes[j] == "integer") {
					hasInteger = true;
				}
			}
			if (hasInteger) {
				if (candidate == undefined) {
					return 1;
				} else {
					return Utils.lcm(candidate, 1);
				}
			}
		}
		return candidate;
	},
	minimum: function () {
		var minimum = undefined;
		var exclusive = false;
		for (var i = 0; i < this.length; i++) {
			var otherMinimum = this[i].minimum();
			if (otherMinimum != undefined) {
				if (minimum == undefined || minimum < otherMinimum) {
					minimum = otherMinimum;
					exclusive = this[i].exclusiveMinimum();
				}
			}
		}
		cacheResult(this, {
			minimum: minimum,
			exclusiveMinimum: exclusive
		});
		return minimum;
	},
	exclusiveMinimum: function () {
		this.minimum();
		return this.exclusiveMinimum;
	},
	maximum: function () {
		var maximum = undefined;
		var exclusive = false;
		for (var i = 0; i < this.length; i++) {
			var otherMaximum = this[i].maximum();
			if (otherMaximum != undefined) {
				if (maximum == undefined || maximum > otherMaximum) {
					maximum = otherMaximum;
					exclusive = this[i].exclusiveMaximum();
				}
			}
		}
		cacheResult(this, {
			maximum: maximum,
			exclusiveMaximum: exclusive
		});
		return maximum;
	},
	exclusiveMaximum: function () {
		this.minimum();
		return this.exclusiveMinimum;
	},
	minLength: function () {
		var minLength = 0;
		for (var i = 0; i < this.length; i++) {
			var otherMinLength = this[i].minLength();
			if (otherMinLength > minLength) {
				minLength = otherMinLength;
			}
		}
		return minLength;
	},
	maxLength: function () {
		var maxLength = undefined;
		for (var i = 0; i < this.length; i++) {
			var otherMaxLength = this[i].maxLength();
			if (!(otherMaxLength > maxLength)) {
				maxLength = otherMaxLength;
			}
		}
		return maxLength;
	},
	minItems: function () {
		var minItems = 0;
		for (var i = 0; i < this.length; i++) {
			var otherMinItems = this[i].minItems();
			if (otherMinItems > minItems) {
				minItems = otherMinItems;
			}
		}
		return minItems;
	},
	maxItems: function () {
		var maxItems = undefined;
		for (var i = 0; i < this.length; i++) {
			var otherMaxItems = this[i].maxItems();
			if (!(otherMaxItems > maxItems)) {
				maxItems = otherMaxItems;
			}
		}
		return maxItems;
	},
	tupleTypingLength: function () {
		var maxTuple = 0;
		for (var i = 0; i < this.length; i++) {
			var otherTuple = this[i].tupleTypingLength();
			if (otherTuple > maxTuple) {
				maxTuple = otherTuple;
			}
		}
		return maxTuple;
	},
	requiredProperties: function () {
		var required = {};
		var requiredList = [];
		for (var i = 0; i < this.length; i++) {
			var requiredProperties = this[i].requiredProperties();
			for (var j = 0; j < requiredProperties.length; j++) {
				var key = requiredProperties[j];
				if (!required[key]) {
					required[key] = true;
					requiredList.push(key);
				}
			}
		}
		return requiredList;
	},
	enumValues: function () {
		var enums = undefined;
		for (var i = 0; i < this.length; i++) {
			var enumData = this[i].enumData();
			if (enumData.defined()) {
				if (enums == undefined) {
					enums = [];
					enumData.indices(function (index, subData) {
						enums[index] = subData;
					});
				} else {
					var newEnums = [];
					enumData.indices(function (index, subData) {
						for (var i = 0; i < enums.length; i++) {
							if (enums[i].equals(subData)) {
								newEnums.push(subData);
							}
						}
					});
					enums = newEnums;
				}
			}
		}
		if (enums != undefined) {
			var values = [];
			for (var i = 0; i < enums.length; i++) {
				values[i] = enums[i].value();
			}
			return values;
		}
	},
	createValue: function(callback) {
		if (callback != null) {
			this.getFull(function (schemas) {
				callback.call(this, schemas.createValue());
			});
			return;
		}
		var candidates = [];
		for (var i = 0; i < this.length; i++) {
			if (this[i].hasDefault()) {
				candidates.push(this[i].defaultValue());
			}
		}
		var basicTypes = this.basicTypes();
		var enumValues = this.enumValues();
		if (enumValues != undefined) {
			for (var i = 0; i < enumValues.length; i++) {
				candidates.push(enumValues[i]);
			}
		} else {
			for (var i = 0; i < basicTypes.length; i++) {
				var basicType = basicTypes[i];
				if (basicType == "null") {
					candidates.push(null);
				} else if (basicType == "boolean") {
					candidates.push(true);
				} else if (basicType == "integer" || basicType == "number") {
					var candidate = this.createValueNumber();
					if (candidate !== undefined) {
						candidates.push(candidate);
					}
				} else if (basicType == "string") {
					var candidate = this.createValueString();
					if (candidate !== undefined) {
						candidates.push(candidate);
					}
				} else if (basicType == "array") {
					var candidate = this.createValueArray();
					if (candidate !== undefined) {
						candidates.push(candidate);
					}
				} else if (basicType == "object") {
					var candidate = this.createValueObject();
					if (candidate !== undefined) {
						candidates.push(candidate);
					}
				}
			}
		}
		for (var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
			var candidate = candidates[candidateIndex];
			var newBasicType = Utils.guessBasicType(candidate);
			if (basicTypes.indexOf(newBasicType) == -1 && (newBasicType != "integer" || basicTypes.indexOf("number") == -1)) {
				continue;
			}
			return candidate;
		}
		return null;
	},
	createValueNumber: function () {
		var exclusiveMinimum = this.exclusiveMinimum();
		var minimum = this.minimum();
		var maximum = this.maximum();
		var exclusiveMaximum = this.exclusiveMaximum();
		var interval = this.numberInterval();
		var candidate = undefined;
		if (minimum != undefined && maximum != undefined) {
			if (minimum > maximum || (minimum == maximum && (exclusiveMinimum || exclusiveMaximum))) {
				return;
			}
			if (interval != undefined) {
				candidate = Math.ceil(minimum/interval)*interval;
				if (exclusiveMinimum && candidate == minimum) {
					candidate += interval;
				}
				if (candidate > maximum || (candidate == maximum && exclusiveMaximum)) {
					return;
				}
			} else {
				candidate = (minimum + maximum)*0.5;
			}
		} else if (minimum != undefined) {
			candidate = minimum;
			if (interval != undefined) {
				candidate = Math.ceil(candidate/interval)*interval;
			}
			if (exclusiveMinimum && candidate == minimum) {
				if (interval != undefined) {
					candidate += interval;
				} else {
					candidate++;
				}
			}
		} else if (maximum != undefined) {
			candidate = maximum;
			if (interval != undefined) {
				candidate = Math.floor(candidate/interval)*interval;
			}
			if (exclusiveMaximum && candidate == maximum) {
				if (interval != undefined) {
					candidate -= interval;
				} else {
					candidate--;
				}
			}
		} else {
			candidate = 0;
		}
		return candidate;
	},
	createValueString: function () {
		var candidate = "";
		return candidate;
	},
	createValueArray: function () {
		var candidate = [];
		var minItems = this.minItems();
		if (minItems != undefined) {
			while (candidate.length < minItems) {
				candidate.push(this.createValueForIndex(candidate.length));
			}
		}
		return candidate;
	},
	createValueObject: function () {
		var candidate = {};
		var requiredProperties = this.requiredProperties();
		for (var i = 0; i < requiredProperties.length; i++) {
			var key = requiredProperties[i];
			candidate[key] = this.createValueForProperty(key);
		}
		return candidate;
	},
	createValueForIndex: function(index, callback) {
		var indexSchemas = this.indexSchemas(index);
		return indexSchemas.createValue(callback);
	},
	indexSchemas: function(index) {
		var result = new SchemaList();
		for (var i = 0; i < this.length; i++) {
			result = result.concat(this[i].indexSchemas(index));
		}
		return result;
	},
	createValueForProperty: function(key, callback) {
		var propertySchemas = this.propertySchemas(key);
		return propertySchemas.createValue(callback);
	},
	propertySchemas: function(key) {
		var result = new SchemaList();
		for (var i = 0; i < this.length; i++) {
			result = result.concat(this[i].propertySchemas(key));
		}
		return result;
	},
	getFull: function(callback) {
		if (this.length == 0) {
			callback.call(this, this);
			return this;
		}
		var pending = 0;
		var result = [];
		function addAll(list) {
			pending += list.length;
			for (var i = 0; i < list.length; i++) {
				list[i].getFull(function(schema) {
					for (var i = 0; i < result.length; i++) {
						if (schema.equals(result[i])) {
							pending--;
							if (pending == 0) {
								var fullList = new SchemaList(result);
								callback.call(fullList, fullList);
							}
							return;
						}
					}
					result.push(schema);
					var extendSchemas = schema.extendSchemas();
					addAll(extendSchemas);
					pending--;
					if (pending == 0) {
						var fullList = new SchemaList(result);
						callback.call(fullList, fullList);
					}
				});
			}
		}
		addAll(this);
		return this;
	},
	formats: function () {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			var format = this[0].format();
			if (format != null) {
				result.push(format);
			}
		}
		return result;
	}
};

publicApi.createSchemaList = function (schemas) {
	if (!Array.isArray(schemas)) {
		schemas = [schemas];
	}
	return new SchemaList(schemas);
};

var SCHEMA_SET_UPDATE_KEY = Utils.getUniqueKey();

function SchemaSet(dataObj) {
	var thisSchemaSet = this;
	this.dataObj = dataObj;

	this.schemas = {};
	this.links = {};
	this.matches = {};
	this.xorSelectors = {};
	this.orSelectors = {};
	this.schemaFlux = 0;
	this.schemasStable = true;

	this.schemasStableListeners = new ListenerSet(dataObj);
	this.pendingNotify = false;

	this.cachedSchemaList = null;
	this.cachedLinkList = null;
}
var counter = 0;
SchemaSet.prototype = {
	update: function (key) {
		this.updateLinksWithKey(key);
		this.updateMatchesWithKey(key);
	},
	baseSchemas: function () {
		var result = [];
		for (var key in this.schemas) {
			if (Utils.keyIsRoot(key)) {
				result = result.concat(this.schemas[key]);
			}
		}
		return result;
	},
	updateLinksWithKey: function (key) {
		var schemaKey, i, linkList, linkInstance;
		var linksToUpdate = [];
		for (schemaKey in this.links) {
			linkList = this.links[schemaKey];
			for (i = 0; i < linkList.length; i++) {
				linkInstance = linkList[i];
				if (linkInstance.usesKey(key) || key == null) {
					linksToUpdate.push(linkInstance);
				}
			}
		}
		if (linksToUpdate.length > 0) {
			for (i = 0; i < linksToUpdate.length; i++) {
				linkInstance = linksToUpdate[i];
				linkInstance.update();
			}
			// TODO: have separate "link" listeners?
			this.invalidateSchemaState();
		}
	},
	updateMatchesWithKey: function (key) {
		// TODO: maintain a list of sorted keys, instead of sorting them each time
		var schemaKeys = [];		
		for (schemaKey in this.matches) {
			schemaKeys.push(schemaKey);
		}
		schemaKeys.sort();
		schemaKeys.reverse();
		for (var j = 0; j < schemaKeys.length; j++) {
			var matchList = this.matches[schemaKeys[j]];
			for (var i = 0; i < matchList.length; i++) {
				matchList[i].dataUpdated(key);
			}
		}
	},
	alreadyContainsSchema: function (schema, schemaKeyHistory) {
		for (var j = 0; j < schemaKeyHistory.length; j++) {
			var schemaKeyItem = schemaKeyHistory[j];
			if (this.schemas[schemaKeyItem] == undefined) {
				continue;
			}
			for (var i = 0; i < this.schemas[schemaKeyItem].length; i++) {
				var s = this.schemas[schemaKeyItem][i];
				if (schema.equals(s)) {
					return true;
				}
			}
		}
		return false;
	},
	addSchema: function (schema, schemaKey, schemaKeyHistory) {
		var thisSchemaSet = this;
		if (schemaKey == undefined) {
			schemaKey = Utils.getUniqueKey();
			counter = 0;
		}
		if (schemaKeyHistory == undefined) {
			schemaKeyHistory = [schemaKey];
		} else {
			schemaKeyHistory[schemaKeyHistory.length] = schemaKey;
		}
		if (this.schemas[schemaKey] == undefined) {
			this.schemas[schemaKey] = [];
		}
		this.schemaFlux++;
		if (typeof schema == "string") {
			schema = publicApi.createSchema({"$ref": schema});
		}
		schema.getFull(function (schema, req) {
			if (thisSchemaSet.alreadyContainsSchema(schema, schemaKeyHistory)) {
				thisSchemaSet.schemaFlux--;
				thisSchemaSet.checkForSchemasStable();
				return;
			}

			thisSchemaSet.schemas[schemaKey][thisSchemaSet.schemas[schemaKey].length] = schema;

			// TODO: this actually forces us to walk the entire data tree, as far as it is defined by the schemas
			//       Do we really want to do this?  I mean, it's necessary if we ever want to catch the "self" links, but if not then it's not that helpful.
			thisSchemaSet.dataObj.properties(function (key, child) {
				var subSchemas = schema.propertySchemas(key);
				for (var i = 0; i < subSchemas.length; i++) {
					child.addSchema(subSchemas[i], schemaKey, schemaKeyHistory);
				}
			});
			thisSchemaSet.dataObj.indices(function (i, child) {
				var subSchemas = schema.indexSchemas(i);
				for (var i = 0; i < subSchemas.length; i++) {
					child.addSchema(subSchemas[i], schemaKey, schemaKeyHistory);
				}
			});

			var ext = schema.extendSchemas();
			for (var i = 0; i < ext.length; i++) {
				thisSchemaSet.addSchema(ext[i], schemaKey, schemaKeyHistory);
			}

			thisSchemaSet.addLinks(schema.links(), schemaKey, schemaKeyHistory);
			thisSchemaSet.addXorSelectors(schema, schemaKey, schemaKeyHistory);
			thisSchemaSet.addOrSelectors(schema, schemaKey, schemaKeyHistory);

			thisSchemaSet.schemaFlux--;
			thisSchemaSet.invalidateSchemaState();
		});
	},
	addLinks: function (potentialLinks, schemaKey, schemaKeyHistory) {
		var i, linkInstance;
		if (this.links[schemaKey] == undefined) {
			this.links[schemaKey] = [];
		}
		for (i = 0; i < potentialLinks.length; i++) {
			linkInstance = new LinkInstance(this.dataObj, potentialLinks[i]);
			this.links[schemaKey].push(linkInstance);
			this.addMonitorForLink(linkInstance, schemaKey, schemaKeyHistory);
			linkInstance.update();
		}
		this.invalidateSchemaState();
	},
	addXorSelectors: function (schema, schemaKey, schemaKeyHistory) {
		var xorSchemas = schema.xorSchemas();
		var selectors = [];
		for (var i = 0; i < xorSchemas.length; i++) {
			var selector = new XorSchemaApplier(xorSchemas[i], Utils.getKeyVariant(schemaKey, "xor" + i), schemaKeyHistory, this);
			selectors.push(selector);
		}
		if (this.xorSelectors[schemaKey] == undefined) {
			this.xorSelectors[schemaKey] = selectors;
		} else {
			this.xorSelectors[schemaKey] = this.xorSelectors[schemaKey].concat(selectors);
		}
	},
	addOrSelectors: function (schema, schemaKey, schemaKeyHistory) {
		var orSchemas = schema.orSchemas();
		var selectors = [];
		for (var i = 0; i < orSchemas.length; i++) {
			var selector = new OrSchemaApplier(orSchemas[i], Utils.getKeyVariant(schemaKey, "or" + i), schemaKeyHistory, this);
			selectors.push(selector);
		}
		if (this.orSelectors[schemaKey] == undefined) {
			this.orSelectors[schemaKey] = selectors;
		} else {
			this.orSelectors[schemaKey] = this.orSelectors[schemaKey].concat(selectors);
		}
	},
	addLink: function (rawLink) {
		var schemaKey = Utils.getUniqueKey();
		var linkData = publicApi.create(rawLink);
		var potentialLink = new PotentialLink(linkData);
		this.addLinks([potentialLink], schemaKey);
	},
	addMonitorForLink: function (linkInstance, schemaKey, schemaKeyHistory) {
		var thisSchemaSet = this;
		var rel = linkInstance.rel();
		if (rel === "describedby") {
			var subSchemaKey = Utils.getKeyVariant(schemaKey);
			linkInstance.addMonitor(subSchemaKey, function (active) {
				thisSchemaSet.removeSchema(subSchemaKey);
				if (active) {
					var rawLink = linkInstance.rawLink;
					var schema = publicApi.createSchema({
						"$ref": rawLink.href
					});
					thisSchemaSet.addSchema(schema, subSchemaKey, schemaKeyHistory);
				}
			});
		}
	},
	addSchemaMatchMonitor: function (monitorKey, schema, monitor, executeImmediately) {
		var schemaMatch = new SchemaMatch(monitorKey, this.dataObj, schema);
		if (this.matches[monitorKey] == undefined) {
			this.matches[monitorKey] = [];
		}
		this.matches[monitorKey].push(schemaMatch);
		schemaMatch.addMonitor(monitor, executeImmediately);
		return schemaMatch;
	},
	removeSchema: function (schemaKey) {
		//Utils.log(Utils.logLevel.DEBUG, "Actually removing schema:" + schemaKey);

		this.dataObj.indices(function (i, subData) {
			subData.removeSchema(schemaKey);
		});
		this.dataObj.properties(function (i, subData) {
			subData.removeSchema(schemaKey);
		});

		var key, i, j;
		var keysToRemove = [];
		for (key in this.schemas) {
			if (Utils.keyIsVariant(key, schemaKey)) {
				keysToRemove.push(key);
			}
		}
		for (key in this.links) {
			if (Utils.keyIsVariant(key, schemaKey)) {
				keysToRemove.push(key);
			}
		}
		for (key in this.matches) {
			if (Utils.keyIsVariant(key, schemaKey)) {
				keysToRemove.push(key);
			}
		}
		for (i = 0; i < keysToRemove.length; i++) {
			key = keysToRemove[i];
			delete this.schemas[key];
			delete this.links[key];
			delete this.matches[key];
		}

		if (keysToRemove.length > 0) {
			this.invalidateSchemaState();
		}
	},
	clear: function () {
		this.schemas = {};
		this.links = {};
		this.matches = {};
		this.invalidateSchemaState();
	},
	getSchemas: function () {
		if (this.cachedSchemaList !== null) {
			return this.cachedSchemaList;
		}
		var schemaResult = [];

		var i, j, key, schemaList, schema, alreadyExists;
		for (key in this.schemas) {
			schemaList = this.schemas[key];
			for (i = 0; i < schemaList.length; i++) {
				schema = schemaList[i];
				alreadyExists = false;
				for (j = 0; j < schemaResult.length; j++) {
					if (schema.equals(schemaResult[j])) {
						alreadyExists = true;
						break;
					}
				}
				if (!alreadyExists) {
					schemaResult.push(schema);
				}
			}
		}
		this.cachedSchemaList = new SchemaList(schemaResult);
		return this.cachedSchemaList;
	},
	getLinks: function(rel) {
		var key, i, keyInstance, keyList;
		if (this.cachedLinkList !== null) {
			return this.cachedLinkList.rel(rel);
		}
		var linkResult = [];
		for (key in this.links) {
			keyList = this.links[key];
			for (i = 0; i < keyList.length; i++) {
				keyInstance = keyList[i];
				if (keyInstance.active) {
					linkResult.push(keyInstance.rawLink);
				}
			}
		}
		this.cachedLinkList = new LinkList(linkResult);
		return this.cachedLinkList.rel(rel);
	},
	invalidateSchemaState: function () {
		this.cachedSchemaList = null;
		this.cachedLinkList = null;
		this.schemasStable = false;
		this.checkForSchemasStable();
	},
	checkForSchemasStable: function () {
		if (this.schemaFlux > 0) {
			// We're in the middle of adding schemas
			// We don't need to mark it as unstable, because if we're
			//  adding or removing schemas or links it will be explicitly invalidated
			return false;
		}
		var i, key, schemaList, schema;
		for (key in this.schemas) {
			schemaList = this.schemas[key];
			for (i = 0; i < schemaList.length; i++) {
				schema = schemaList[i];
				if (!schema.isComplete()) {
					this.schemasStable = false;
					return false;
				}
			}
		}
		
		var thisSchemaSet = this;
		if (!this.pendingNotify) {
			this.pendingNotify = true;
			DelayedCallbacks.add(function () {
				thisSchemaSet.pendingNotify = false;
				if (!thisSchemaSet.schemasStable) {
					thisSchemaSet.schemasStable = true;
					notifySchemaChangeListeners(thisSchemaSet.dataObj, thisSchemaSet.getSchemas());
				}
				thisSchemaSet.schemasStableListeners.notify(thisSchemaSet.dataObj, thisSchemaSet.getSchemas());
			});
		}
		return true;
	},
	addSchemasForProperty: function (key, subData) {
		for (var schemaKey in this.schemas) {
			for (var i = 0; i < this.schemas[schemaKey].length; i++) {
				var schema = this.schemas[schemaKey][i];
				var subSchemas = schema.propertySchemas(key);
				for (var j = 0; j < subSchemas.length; j++) {
					subData.addSchema(subSchemas[j], schemaKey);
				}
			}
		}
	},
	addSchemasForIndex: function (index, subData) {
		for (var schemaKey in this.schemas) {
			for (var i = 0; i < this.schemas[schemaKey].length; i++) {
				var schema = this.schemas[schemaKey][i];
				var subSchemas = schema.indexSchemas(index);
				for (var j = 0; j < subSchemas.length; j++) {
					subData.addSchema(subSchemas[j], schemaKey);
				}
			}
		}
	},
	removeSubSchemas: function (subData) {
		//    throw new Error("This should be using more than this.schemas");
		for (var schemaKey in this.schemas) {
			subData.removeSchema(schemaKey);
		}
	},
	whenSchemasStable: function (handlerFunction) {
		this.schemasStableListeners.add(handlerFunction);
		this.checkForSchemasStable();
	}
};

function LinkInstance(dataObj, potentialLink) {
	this.dataObj = dataObj;
	this.potentialLink = potentialLink;
	this.active = false;
	this.rawLink = null;
	this.updateMonitors = new MonitorSet(dataObj);
}
LinkInstance.prototype = {
	update: function (key) {
		this.active = this.potentialLink.canApplyTo(this.dataObj);
		if (this.active) {
			this.rawLink = this.potentialLink.linkForData(this.dataObj);
		}
		this.updateMonitors.notify(this.active);
	},
	rel: function () {
		return this.potentialLink.rel();
	},
	usesKey: function (key) {
		return this.potentialLink.usesKey(key);
	},
	addMonitor: function (schemaKey, monitor) {
		this.updateMonitors.add(schemaKey, monitor);
	}
};

function XorSchemaApplier(options, schemaKey, schemaKeyHistory, schemaSet) {
	var inferredSchemaKey = Utils.getKeyVariant(schemaKey, "$");
	this.xorSelector = new XorSelector(schemaKey, options, schemaSet.dataObj);
	this.xorSelector.onMatchChange(function (selectedOption) {
		schemaSet.removeSchema(inferredSchemaKey);
		if (selectedOption != null) {
			schemaSet.addSchema(selectedOption, inferredSchemaKey, schemaKeyHistory);
		}
	});
}

function OrSchemaApplier(options, schemaKey, schemaKeyHistory, schemaSet) {
	var inferredSchemaKeys = [];
	var optionsApplied = [];
	for (var i = 0; i < options.length; i++) {
		inferredSchemaKeys[i] = Utils.getKeyVariant(schemaKey, "$" + i);
		optionsApplied[i] = false;
	}
	this.orSelector = new OrSelector(schemaKey, options, schemaSet.dataObj);
	this.orSelector.onMatchChange(function (selectedOptions) {
		for (var i = 0; i < options.length; i++) {
			var found = false;
			for (var j = 0; j < selectedOptions.length; j++) {
				if (options[i] == selectedOptions[j]) {
					found = true;
					break;
				}
			}
			if (found && !optionsApplied[i]) {
				schemaSet.addSchema(options[i], inferredSchemaKeys[i], schemaKeyHistory);
			} else if (!found && optionsApplied[i]) {
				schemaSet.removeSchema(inferredSchemaKeys[i]);
			}
			optionsApplied[i] = found;
		}
	});
}

//Tidying
// TODO: check all " == undefined", in case they should be " === undefined" instead (null-safety)
// TODO: profile memory consumption - you're throwing closures around the place, it might go wrong
// TODO: try/catch clauses for all listeners/monitors
// TODO: document everything
// TODO: does the assigned baseUrl/fragment of data change when it's removed or assigned?
// TODO: various things are indexed by keys, and might have multiple entries - if we allow an entry to have more than one key, we need to do fewer calculations, and there is less duplication.  This will also help speed up schema matching, as we won't have any duplicates.

//Features:
// TODO: Speculative schema matching (independent of applied schemas)
// TODO: something about types - list of uniqueIds for the data object defining the type?
// TODO: as long as we keep a request in the cache, keep a map of all custom-defined fragments
// TODO: have monitors return boolean, saying whether they are interested in future updates (undefined means true)
// TODO: re-structure monitor keys
// TODO: separate schema monitors from type monitors?

var configData = publicApi.create({
	intelligentLinks: true,
	intelligentPut: true
});
publicApi.config = configData;
publicApi.UriTemplate = UriTemplate;

})(this); // Global wrapper

(function (global) {
	function encodeUiState (uiState) {
		var json = JSON.stringify(uiState);
		if (json == "{}") {
			return null;
		}
		return json;
	}
	function decodeUiState (uiStateString) {
		if (uiStateString == "" || uiStateString == null) {
			return {};
		}
		return JSON.parse(uiStateString);
	}
	function htmlEscapeSingleQuote (str) {
		return str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&#39;");
	}

	var prefixPrefix = "Jsonary";
	var prefixCounter = 0;

	var componentNames = {
		ADD_REMOVE: "add/remove",
		TYPE_SELECTOR: "type-selector",
		RENDERER: "data renderer",
		add: function (newName, beforeName) {
			if (this[newName] != undefined) {
				return;
			}
			this[newName] = newName;
			if (componentList.indexOf(beforeName) != -1) {
				componentList.splice(componentList.indexOf(beforeName), 0, this[newName]);
			} else {
				componentList.unshift(this[newName]);
			}
		}
	};	
	var componentList = [componentNames.ADD_REMOVE, componentNames.TYPE_SELECTOR, componentNames.RENDERER];
	
	function RenderContext(elementIdPrefix) {
		var thisContext = this;
		this.elementLookup = {};

		if (elementIdPrefix == undefined) {
			elementIdPrefix = prefixPrefix + "." + (prefixCounter++) + ".";
		}
		var elementIdCounter = 0;
		this.getElementId = function () {
			return elementIdPrefix + (elementIdCounter++);
		};

		var renderDepth = 0;
		this.enhancementContexts = {};
		this.enhancementActions = {};
		this.enhancementInputs = {};

		Jsonary.registerChangeListener(function (patch, document) {
			patch.each(function (index, operation) {
				var dataObjects = document.affectedData(operation);
				for (var i = 0; i < dataObjects.length; i++) {
					thisContext.update(dataObjects[i], operation);
				}
			});
		});
		Jsonary.registerSchemaChangeListener(function (data, schemas) {
			var uniqueId = data.uniqueId;
			var elementIds = thisContext.elementLookup[uniqueId];
			if (elementIds == undefined || elementIds.length == 0) {
				return;
			}
			var elements = [];
			for (var i = 0; i < elementIds.length; i++) {
				var element = document.getElementById(elementIds[i]);
				if (element == undefined) {
					elementIds.splice(i, 1);
					i--;
					continue;
				}
				elements[i] = element;
			}
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				var prevContext = element.jsonaryContext;
				var prevUiState = decodeUiState(element.getAttribute("data-jsonary"));
				var renderer = selectRenderer(data, prevUiState, prevContext.usedComponents);
				if (renderer.uniqueId == prevContext.renderer.uniqueId) {
					renderer.render(element, data, prevContext);
				} else {
					prevContext.baseContext.render(element, data, prevUiState);
				}
			}
		});
		this.rootContext = this;
	}
	RenderContext.prototype = {
		usedComponents: [],
		rootContext: null,
		baseContext: null,
		subContext: function (elementId, data, uiStartingState) {
			var usedComponents = [];
			if (this.data == data) {
				usedComponents = this.usedComponents.slice(0);
				if (this.renderer != undefined) {
					usedComponents = usedComponents.concat(this.renderer.component);
				}
			}
			if (typeof elementId == "object") {
				elementId = elementId.id;
			}
			function Context(rootContext, baseContext, elementId, data, uiState, usedComponents) {
				this.rootContext = rootContext;
				this.baseContext = baseContext;
				this.elementId = elementId;
				this.data = data;
				this.uiState = uiState;
				this.usedComponents = usedComponents;
			}
			Context.prototype = this.rootContext;
			return new Context(this.rootContext, this, elementId, data, uiStartingState, usedComponents);
		},
		render: function (element, data, uiStartingState) {
			// If data is a URL, then fetch it and call back
			if (typeof data == "string") {
				data = Jsonary.getData(data);
			}
			if (data.getData != undefined) {
				var thisContext = this;
				data.getData(function (actualData) {
					thisContext.render(element, actualData, uiStartingState);
				});
				return;
			}

			if (typeof uiStartingState != "object") {
				uiStartingState = {};
			}
			if (element.id == undefined || element.id == "") {
				element.id = this.getElementId();
			}

			var previousContext = element.jsonaryContext;
			var subContext = this.subContext(element, data, uiStartingState);
			var encodedState = encodeUiState(uiStartingState);
			if (encodedState != null) {
				element.setAttribute("data-jsonary", encodedState);
			} else {
				element.removeAttribute("data-jsonary");
			}
			element.jsonaryContext = subContext;

			if (previousContext) {
				// Something was rendered here before - remove this element from the lookup list for that data ID
				var previousId = previousContext.data.uniqueId;
				var index = this.elementLookup[previousId].indexOf(element.id);
				if (index >= 0) {
					this.elementLookup[previousId].splice(index, 1);
				}
			}
			var uniqueId = data.uniqueId;
			if (this.elementLookup[uniqueId] == undefined) {
				this.elementLookup[uniqueId] = [];
			}
			if (this.elementLookup[uniqueId].indexOf(element.id) == -1) {
				this.elementLookup[uniqueId].push(element.id);
			}
			var renderer = selectRenderer(data, uiStartingState, subContext.usedComponents);
			if (renderer != undefined) {
				subContext.renderer = renderer;
				renderer.render(element, data, subContext);
			} else {
				element.innerHTML = "NO RENDERER FOUND";
			}
		},
		renderHtml: function (data, uiStartingState) {
			var elementId = this.getElementId();
			if (typeof data == "string") {
				data = Jsonary.getData(data);
			}
			if (data.getData != undefined) {
				var thisContext = this;
				var rendered = false;
				data.getData(function (actualData) {
					if (!rendered) {
						rendered = true;
						data = actualData;
					} else {
						thisContext.render(document.getElementById(elementId), actualData, uiStartingState);
					}
				});
				if (!rendered) {
					rendered = true;
					return '<span id="' + elementId + '">Loading...</span>';
				}
			}

			if (typeof uiStartingState != "object") {
				uiStartingState = {};
			}
			var subContext = this.subContext(elementId, data, uiStartingState);

			var startingStateString = encodeUiState(uiStartingState);
			var renderer = selectRenderer(data, uiStartingState, subContext.usedComponents);
			subContext.renderer = renderer;
			
			var innerHtml = renderer.renderHtml(data, subContext);
			var uniqueId = data.uniqueId;
			if (this.elementLookup[uniqueId] == undefined) {
				this.elementLookup[uniqueId] = [];
			}
			if (this.elementLookup[uniqueId].indexOf(elementId) == -1) {
				this.elementLookup[uniqueId].push(elementId);
			}
			this.addEnhancement(elementId, subContext);
			if (startingStateString != null) {
				return '<span id="' + elementId + '" data-jsonary=\'' + htmlEscapeSingleQuote(startingStateString) + '\'>' + innerHtml + '</span>';
			} else {
				return '<span id="' + elementId + '">' + innerHtml + '</span>';
			}
		},
		update: function (data, operation) {
			var uniqueId = data.uniqueId;
			var elementIds = this.elementLookup[uniqueId];
			if (elementIds == undefined || elementIds.length == 0) {
				return;
			}
			var elements = [];
			for (var i = 0; i < elementIds.length; i++) {
				var element = document.getElementById(elementIds[i]);
				if (element == undefined) {
					elementIds.splice(i, 1);
					i--;
					continue;
				}
				elements[i] = element;
			}
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				var prevContext = element.jsonaryContext;
				var prevUiState = decodeUiState(element.getAttribute("data-jsonary"));
				var renderer = selectRenderer(data, prevUiState, prevContext.usedComponents);
				if (renderer.uniqueId == prevContext.renderer.uniqueId) {
					renderer.update(element, data, prevContext, operation);
				} else {
					prevContext.baseContext.render(element, data, prevUiState);
				}
			}
		},
		actionHtml: function(innerHtml, actionName) {
			var params = [];
			for (var i = 2; i < arguments.length; i++) {
				params.push(arguments[i]);
			}
			var elementId = this.getElementId();
			this.addEnhancementAction(elementId, actionName, this, params);
			return '<a href="javascript:void(0)" id="' + elementId + '" style="text-decoration: none">' + innerHtml + '</a>';
		},
		inputNameForAction: function (actionName) {
			var name = this.getElementId();
			this.enhancementInputs[name] = {
				inputName: name,
				actionName: actionName,
				context: this
			};
			return name;
		},
		addEnhancement: function(elementId, context) {
			this.enhancementContexts[elementId] = context;
		},
		addEnhancementAction: function (elementId, actionName, context, params) {
			if (params == null) {
				params = [];
			}
			this.enhancementActions[elementId] = {
				actionName: actionName,
				context: context,
				params: params
			};
		},
		enhanceElement: function (element) {
			var rootElement = element;
			while (element) {
				if (element.nodeType == 1) {
					this.enhanceElementSingle(element);
				}
				if (element.firstChild) {
					element = element.firstChild;
					continue;
				}
				while (!element.nextSibling && element != rootElement) {
					element = element.parentNode;
				}
				if (element == rootElement) {
					break;
				}
				element = element.nextSibling;
			}
		},
		enhanceElementSingle: function (element) {
			var elementId = element.id;
			var context = this.enhancementContexts[elementId];
			if (context != undefined) {
				element.jsonaryContext = context;
				delete this.enhancementContexts[elementId];
				var renderer = context.renderer;
				if (renderer != undefined) {
					renderer.enhance(element, context.data, context);
				}
			}
			var action = this.enhancementActions[element.id];
			if (action != undefined) {
				delete this.enhancementActions[element.id];
				element.onclick = function () {
					var actionContext = action.context;
					var args = [actionContext, action.actionName].concat(action.params);
					if (actionContext.renderer.action.apply(actionContext.renderer, args)) {
						// Action returned positive - we should force a re-render
						var element = document.getElementById(actionContext.elementId);
						actionContext.renderer.render(element, actionContext.data, actionContext);
					}
					return false;
				};
			}
			var inputAction = this.enhancementInputs[element.name];
			if (inputAction != undefined) {
				delete this.enhancementInputs[element.name];
				element.onchange = function () {
					var value = this.value;
					var inputContext = inputAction.context;
					inputContext.renderer.action(inputContext, inputAction.actionName, value);
				};
			}
			element = null;
		}
	};
	var pageContext = new RenderContext();

	function render(element, data, uiStartingState) {
		pageContext.render(element, data, uiStartingState);
		return this;
	}
	function renderHtml(data, uiStartingState) {
		return pageContext.renderHtml(data, uiStartingState);
	}

	if (global.jQuery != undefined) {
		render.empty = function (element) {
			global.jQuery(element).empty();
		};
	} else {
		render.empty = function (element) {
			element.innerHTML = "";
		};
	}
	render.Components = componentNames;
	
	/**********/

	var rendererIdCounter = 0;
	
	function Renderer(sourceObj) {
		this.renderFunction = sourceObj.render || sourceObj.enhance;
		this.renderHtmlFunction = sourceObj.renderHtml;
		this.updateFunction = sourceObj.update;
		this.filterFunction = sourceObj.filter;
		this.actionFunction = sourceObj.action;
		for (var key in sourceObj) {
			if (this[key] == undefined) {
				this[key] = sourceObj[key];
			}
		}
		this.uniqueId = rendererIdCounter++;
		this.component = (sourceObj.component != undefined) ? sourceObj.component : componentList[componentList.length - 1];
		if (typeof this.component == "string") {
			this.component = [this.component];
		}
	}
	Renderer.prototype = {
		render: function (element, data, context) {
			if (element[0] != undefined) {
				element = element[0];
			}
			render.empty(element);
			element.innerHTML = this.renderHtml(data, context);
			if (this.renderFunction != null) {
				this.renderFunction(element, data, context);
			}
			context.enhanceElement(element);
			return this;
		},
		renderHtml: function (data, context) {
			var innerHtml = "";
			if (this.renderHtmlFunction != undefined) {
				innerHtml = this.renderHtmlFunction(data, context);
			}
			return innerHtml;
		},
		enhance: function (element, data, context) {
			if (this.renderFunction != null) {
				this.renderFunction(element, data, context);
			}
			return this;
		},
		update: function (element, data, context, operation) {
			var redraw;
			if (this.updateFunction != undefined) {
				redraw = this.updateFunction(element, data, context, operation);
			} else {
				redraw = this.defaultUpdate(element, data, context, operation);
			}
			if (redraw) {
				this.render(element, data, context);
			}
			return this;
		},
		action: function (context, actionName, data) {
			return this.actionFunction.apply(this, arguments);
		},
		canRender: function (data, schemas, uiState) {
			if (this.filterFunction != undefined) {
				return this.filterFunction(data, schemas, uiState);
			}
			return true;
		},
		defaultUpdate: function (element, data, context, operation) {
			var redraw = false;
			var checkChildren = operation.action() != "replace";
			var pointerPath = data.pointerPath();
			if (operation.subjectEquals(pointerPath) || (checkChildren && operation.subjectChild(pointerPath) !== false)) {
				redraw = true;
			} else if (operation.target() != undefined) {
				if (operation.targetEquals(pointerPath) || (checkChildren && operation.targetChild(pointerPath) !== false)) {
					redraw = true;
				}
			}
			return redraw;
		}
	}

	var rendererLookup = {};
	var rendererList = [];
	function register(obj) {
		var renderer = new Renderer(obj);
		rendererLookup[renderer.uniqueId] = renderer;
		rendererList.push(renderer);
	}
	render.register = register;
	
	function lookupRenderer(rendererId) {
		return rendererLookup[rendererId];
	}

	function selectRenderer(data, uiStartingState, usedComponents) {
		var schemas = data.schemas();
		for (var j = 0; j < componentList.length; j++) {
			if (usedComponents.indexOf(componentList[j]) == -1) {
				var component = componentList[j];
				for (var i = rendererList.length - 1; i >= 0; i--) {
					var renderer = rendererList[i];
					if (renderer.component.indexOf(component) == -1) {
						continue;
					}
					if (renderer.canRender(data, schemas, uiStartingState)) {
						return renderer;
					}
				}
			}
		}
	}

	if (typeof global.jQuery != "undefined") {
		var jQueryRender = function (data, uiStartingState) {
			var element = this[0];
			if (element != undefined) {
				render(element, data, uiStartingState);
			}
			return this;
		};
		Jsonary.extendData({
			$renderTo: function (query, uiState) {
				if (typeof query == "string") {
					query = jQuery(query);
				}
				var element = query[0];
				if (element != undefined) {
					render(element, this, uiState);
				}
			}
		});
		jQueryRender.register = function (jQueryObj) {
			if (jQueryObj.render != undefined) {
				var oldRender = jQueryObj.render;
				jQueryObj.render = function (element, data) {
					var query = $(element);
					oldRender.call(this, query, data);
				}
			}
			if (jQueryObj.update != undefined) {
				var oldUpdate = jQueryObj.update;
				jQueryObj.update = function (element, data, operation) {
					var query = $(element);
					oldUpdate.call(this, query, data, operation);
				}
			}
			render.register(jQueryObj);
		};
		jQueryRender.empty = function (query) {
			query.each(function (index, element) {
				render.empty(element);
			});
		};
		jQuery.fn.extend({renderJson: jQueryRender});
		jQuery.extend({renderJson: jQueryRender});
	}

	Jsonary.extend({
		render: render,
		renderHtml: renderHtml
	});
	Jsonary.extendData({
		renderTo: function (element, uiState) {
			render(element, this, uiState);
		}
	});
})(this);

