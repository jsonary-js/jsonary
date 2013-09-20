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
			if (level >= Utils.logLevel.ERROR) {
				window.alert("ERROR: " + message);
				console.log("ERROR: " + message);
				console.trace();
			}
			if (level >= Utils.logLevel.WARNING) {
				console.log("WARNING: " + message);
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
	encodeData: function (data, encType, variant) {
		if (encType == undefined) {
			encType = "application/x-www-form-urlencoded";
		}
		if (encType == "application/json") {
			return JSON.stringify(data);
		} else if (encType == "application/x-www-form-urlencoded") {
			if (variant == "dotted") {
				return Utils.formEncode(data, "", '.', '', '|').replace(/%20/g, '+').replace(/%2F/g, "/");
			} else if (variant == 'pretty') {
				return Utils.formEncode(data, "", '[', ']').replace(/%20/g, '+').replace(/%2F/g, "/").replace(/%5B/g, '[').replace(/%5D/g, ']').replace(/%7C/g, '|');
			} else {
				return Utils.formEncode(data, "", '[', ']').replace(/%20/g, '+');
			}
		} else {
			throw new Error("Unknown encoding type: " + this.encType);
		}
	},
	decodeData: function (data, encType, variant) {
		if (encType == undefined) {
			encType = "application/x-www-form-urlencoded";
		}
		if (encType == "application/json") {
			return JSON.parse(data);
		} else if (encType == "application/x-www-form-urlencoded") {
			data = data.replace(/\+/g, '%20');
			if (variant == "dotted") {
				return Utils.formDecode(data.replace(/%7C/g, '|'), '.', '', '|');
			} else {
				return Utils.formDecode(data, '[', ']');
			}
		} else {
			throw new Error("Unknown encoding type: " + this.encType);
		}
	},
	formEncode: function (data, prefix, sepBefore, sepAfter, arrayJoin) {
		if (prefix == undefined) {
			prefix = "";
		}
		var result = [];
		if (Array.isArray(data)) {
			for (var i = 0; i < data.length; i++) {
				var key = (prefix == "") ? i : prefix + encodeURIComponent(sepBefore + sepAfter);
				var complexKey = (prefix == "") ? i : prefix + encodeURIComponent(sepBefore + i + sepAfter);
				var value = data[i];
				if (value == null) {
					result.push(key + "=null");
				} else if (typeof value == "object") {
					var subResult = Utils.formEncode(value, complexKey, sepBefore, sepAfter, arrayJoin);
					if (subResult) {
						result.push(subResult);
					}
				} else if (typeof value == "boolean") {
					if (value) {
						result.push(key + "=true");
					} else {
						result.push(key + "=false");
					}
				} else if (value === "") {
					result.push(key);
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
					key = prefix + encodeURIComponent(sepBefore + key + sepAfter);
				} else {
					key = encodeURIComponent(key);
				}
				if (value === undefined) {
				} else if (value === null) {
					result.push(key + "=null");
				} else if (arrayJoin && Array.isArray(value)) {
					if (value.length > 0) {
						var arrayItems = [];
						while (arrayItems.length < value.length) {
							arrayItems[arrayItems.length] = encodeURIComponent(value[arrayItems.length]);
						}
						var joined = arrayJoin + arrayItems.join(arrayJoin);
						result.push(key + "=" + joined);
					}
				} else if (typeof value == "object") {
					var subResult = Utils.formEncode(value, key, sepBefore, sepAfter, arrayJoin);
					if (subResult) {
						result.push(subResult);
					}
				} else if (typeof value == "boolean") {
					if (value) {
						result.push(key + "=true");
					} else {
						result.push(key + "=false");
					}
				} else if (value === "") {
					result.push(key);
				} else {
					result.push(key + "=" + encodeURIComponent(value));
				}
			}
		} else {
			result.push(encodeURIComponent(data));
		}
		return result.join("&");
	},
	formDecodeString: function (value) {
		if (value == "true") {
			value = true;
		} else if (value == "false") {
			value = false;
		} else if (value == "null") {
			value = null;
		} else if (parseFloat(value) + "" == value) {
			value = parseFloat(value);
		}
		return value;
	},
	formDecode: function (data, sepBefore, sepAfter, arrayJoin) {
		var result = {};
		var parts = data.split("&");
		for (var partIndex = 0; partIndex < parts.length; partIndex++) {
			var part = parts[partIndex];
			var key = part;
			var value = "";
			if (part.indexOf("=") >= 0) {
				key = part.substring(0, part.indexOf("="));
				value = decodeURIComponent(part.substring(part.indexOf("=") + 1));
				if (arrayJoin && value.charAt(0) == arrayJoin) {
					value = value.split(arrayJoin);
					value.shift();
					for (var i = 0; i < value.length; i++) {
						value[i] = Utils.formDecodeString(value[i]);
					}
				} else {
					value = Utils.formDecodeString(value);
				}
			}
			key = decodeURIComponent(key);
			var subject = result;
			var keyparts = key.split(sepBefore);
			for (var i = 1; i < keyparts.length; i++) {
				keyparts[i] = keyparts[i].substring(0, keyparts[i].length - sepAfter.length);
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
	escapeHtml: function(text) {
		text += "";
		return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
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
		for (var i = 0; i < pointerComponents.length; i++) {
			result += "/" + Utils.encodePointerComponent(pointerComponents[i]);
		}
		return result;
	},
	prettyJson: function (data) {
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
};
(function () {
	var counter = 0;
	Utils.getUniqueKey = function () {
		return counter++;
	};
})();
for (var logLevel in Utils.logLevel) {
	Utils.logLevel[Utils.logLevel[logLevel]] = Utils.logLevel[Utils.logLevel[logLevel]] || logLevel;
}

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
publicApi.escapeHtml = Utils.escapeHtml;
publicApi.prettyJson = Utils.prettyJson;

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
