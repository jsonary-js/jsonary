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
	var result = new Uri(relative + "");
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
