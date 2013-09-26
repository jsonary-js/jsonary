var fs = require('fs');
var http = require('http');
var path = require('path');

var CookieClient = module.exports = function CookieClient () {
	if (!(this instanceof CookieClient)) {
		return new CookieClient();
	}
	// Big list of everything - not very efficient
	this.cookies = [];
};
CookieClient.prototype = {
	clear: function () {
		this.cookies = [];
	},
	addCookiesFromHeaders: function(headers, defaults) {
		if (headers['set-cookie']) {
			var cookieHeaders = Array.isArray(headers['set-cookie']) ? headers['set-cookie'] : [headers['set-cookie']];
			for (var i = 0; i < cookieHeaders.length; i++) {
				var cookieString = cookieHeaders[i];
				var cookie = new Cookie(cookieString, defaults);
				var replaced = false;
				for (var j = 0; j < this.cookies.length; j++) {
					if (cookie.replaces(this.cookies[j])) {
						this.cookies[j] = cookie;
						replaced = true;
						break;
					}
				}
				if (!replaced) {
					this.cookies.push(cookie);
				}
			}
		}
	},
	cookieStringForRequest: function () {
		var cookies = this.cookiesForRequest.apply(this, arguments);
		var keyValue = {};
		for (var i = 0; i < cookies.length; i++) {
			var cookie = cookies[i];
			keyValue[cookie.name] = cookie.value;
		}
		var result = [];
		for (var key in keyValue) {
			result.push(key + '=' + keyValue[key]);
		}
		return result.join('; ');
	},
	cookiesForRequest: function(domain, path, secure) {
		var result = [];
		var now = new Date();
		for (var i = 0; i < this.cookies.length; i++) {
			var cookie = this.cookies[i];
			if (!isCookieAllowed(cookie.domain)) {
				continue;
			}
			if (cookie.expires < now) {
				this.cookies.splice(i, 1);
				i--;
				continue;
			}
			if (cookie.matches(domain, path, secure)) {
				result.push(cookie);
			}
		}
		return result;
	}
};

var Cookie = function Cookie(str, defaults) {
	var pairs = [];
	var parts = str.split(/ *; */);
	for (var i = 0; i < parts.length; i++) {
		var pair = parts[i].split(/ *= */);
		pairs.push(pair);
	}

	var firstPair = pairs.shift();
	this.name = firstPair[0];
	this.value = firstPair[1];
	for (var i = 0; i < pairs.length; i++) {
		var pair = pairs[i];
		var key = pair[0].toLowerCase();
		var value = pair[1];
		if (key === 'expires') {
			this.expires = new Date(value);
		} else if (key === 'max-age') {
			value = parseFloat(value);
			if (!isNaN(value)) {
				this.expires = new Date(Date.now() + value*1000);
			}
		} else if (key === 'path') {
			this.path = value;
		} else if (key === 'domain') {
			this.domain = value;
		} else if (key === 'secure') {
			this.secure = true;
		} else if (key === 'httponly') {
			this.httpOnly = true;
		}
	}
	this.expires = this.expires || Infinity;
	this.path = this.path.trim() || defaults.path;
	this.domain = this.domain || defaults.domain;
	this.secure = this.secure || false;
	this.httpOnly = this.httpOnly || false;
};
Cookie.prototype = {
	replaces: function (other) {
		return this.domain === other.domain
			&& this.name === other.name
			&& (this.path === other.path
				|| (other.path.substring(0, this.path.length) == this.path
					&& (this.path.charAt(this.path.length - 1) == '/' || other.path.charAt(this.path.length) == '/')
				)
			);
	},
	matches: function (domain, path, secure) {
		if (domain.substring(domain.length - this.domain.length) !== this.domain) {
			return false
		} else if (domain !== this.domain && this.domain.charAt(0) !== '.' && domain.charAt(domain.length - this.domain.length - 1) !== '.') {
			return false;
		} else if (path.substring(0, this.path.length) !== this.path) {
			return false;
		} else if (path.length !== this.path.length && path.charAt(this.path.length) !== '/' && this.path.charAt(this.path.length - 1) !== '/') {
			return false;
		} else if (!secure && this.secure) {
			return false;
		}
		return true;
	}
};

var pslExceptions = [];
var pslRules = [];
function isCookieAllowed(domain) {
	domain = domain.replace(/^\./, ''); // strip leading '.'
	domain = domain.toLowerCase();
	for (var i = 0; i < pslExceptions.length; i++) {
		if (domain === pslExceptions[i]) {
			return true;
		}
	}
	for (var i = 0; i < pslRules.length; i++) {
		if (domain === pslRules[i]) {
			return false;
		}
	}
	return true;
}
function addPslException(line) {
	line = line.replace(/^\*/, ''); // strip leading '*'
	pslExceptions.push(line);
}
function addPslRule(line) {
	line = line.replace(/^\*/, ''); // strip leading '*'
	pslRules.push(line);
}

var pslFilename = path.join(__dirname, pslFilename);

fs.exists(pslFilename, function (exists) {
	if (exists) {
		readPSLFile();
		return;
	}
	console.log("cookie-client: Fetching public suffix list");
	http.get('http://mxr.mozilla.org/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1', function (response) {
		if (response.statusCode !== 200) {
			throw new Error("cookie-client: problem fetching public suffix list (status " + response.statusCode);
		}
		var data;
		response.setEncoding('utf8'); // Encoding is required
		response.on('data', function (chunk) {
			data = data ? data + chunk : chunk;
		});
		response.on('end', function () {
			writePSLFile(data);
		});
	});
	
	function writePSLFile(data) {
		fs.writeFile(pslFilename, data, {encoding:'utf8'}, function (error) {
			if (error) {
				throw error;
			}
			readPSLFile();
		});
	}
	
	function readPSLFile() {
		fs.readFile(pslFilename, function (error, data) {
			if (error) {
				throw error;
			}
			var lines = data.toString('utf8').split("\n");
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i].trim();
				if (line == "" || line.substring(0, 2) == '//') {
					continue;
				}
				if (line.charAt(0) == '!') {
					addPslException(line.substring(1));
				} else {
					addPslRule(line);
				}
			}
		});
	}
});
