/* Bundled on 2013-12-10 */
(function() {
/* Copyright (C) 2012-2013 Geraint Luff

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**** _compatability.js ****/

	if (typeof window != "undefined" && typeof localStorage == "undefined") {
		window.localStorage = {};
	}
	
	
	// This is not a full ES5 shim - it just covers the functions that Jsonary uses.
	
	if (!Array.isArray) {
		Array.isArray = function (candidate) {
			return Object.prototype.toString.apply(candidate) === '[object Array]';
		};
	}
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (value, start) {
			for (var i = start || 0; i < this.length; i++) {
				if (this[i] === value) {
					return i;
				}
			}
			return -1;
		};
	}
	if (!Object.keys) {
		Object.keys = function (obj) {
			var result = [];
			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					result.push(key);
				}
			}
			return result;
		};
	}
	if (!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/g,'');
		};
	}
	
	// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
	if ( !Date.prototype.toISOString ) {
	  ( function() {
	    
	    function pad(number) {
	      var r = String(number);
	      if ( r.length === 1 ) {
	        r = '0' + r;
	      }
	      return r;
	    }
	 
	    Date.prototype.toISOString = function() {
	      return this.getUTCFullYear()
	        + '-' + pad( this.getUTCMonth() + 1 )
	        + '-' + pad( this.getUTCDate() )
	        + 'T' + pad( this.getUTCHours() )
	        + ':' + pad( this.getUTCMinutes() )
	        + ':' + pad( this.getUTCSeconds() )
	        + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
	        + 'Z';
	    };
	  
	  }() );
	}
	
	// Polyfill from MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
	if (!Object.create) {
		Object.create = (function(){
			function F(){}
	
			return function(o){
				if (arguments.length != 1) {
					throw new Error('Object.create implementation only accepts one parameter.');
				}
				F.prototype = o
				return new F()
			}
		})()
	}
	
	// json2.js, from Douglas Crockford's GitHub repo
	
	/*
	    json2.js
	    2012-10-08
	
	    Public Domain.
	
	    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
	
	    See http://www.JSON.org/js.html
	
	
	    This code should be minified before deployment.
	    See http://javascript.crockford.com/jsmin.html
	
	    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	    NOT CONTROL.
	
	
	    This file creates a global JSON object containing two methods: stringify
	    and parse.
	
	        JSON.stringify(value, replacer, space)
	            value       any JavaScript value, usually an object or array.
	
	            replacer    an optional parameter that determines how object
	                        values are stringified for objects. It can be a
	                        function or an array of strings.
	
	            space       an optional parameter that specifies the indentation
	                        of nested structures. If it is omitted, the text will
	                        be packed without extra whitespace. If it is a number,
	                        it will specify the number of spaces to indent at each
	                        level. If it is a string (such as '\t' or '&nbsp;'),
	                        it contains the characters used to indent at each level.
	
	            This method produces a JSON text from a JavaScript value.
	
	            When an object value is found, if the object contains a toJSON
	            method, its toJSON method will be called and the result will be
	            stringified. A toJSON method does not serialize: it returns the
	            value represented by the name/value pair that should be serialized,
	            or undefined if nothing should be serialized. The toJSON method
	            will be passed the key associated with the value, and this will be
	            bound to the value
	
	            For example, this would serialize Dates as ISO strings.
	
	                Date.prototype.toJSON = function (key) {
	                    function f(n) {
	                        // Format integers to have at least two digits.
	                        return n < 10 ? '0' + n : n;
	                    }
	
	                    return this.getUTCFullYear()   + '-' +
	                         f(this.getUTCMonth() + 1) + '-' +
	                         f(this.getUTCDate())      + 'T' +
	                         f(this.getUTCHours())     + ':' +
	                         f(this.getUTCMinutes())   + ':' +
	                         f(this.getUTCSeconds())   + 'Z';
	                };
	
	            You can provide an optional replacer method. It will be passed the
	            key and value of each member, with this bound to the containing
	            object. The value that is returned from your method will be
	            serialized. If your method returns undefined, then the member will
	            be excluded from the serialization.
	
	            If the replacer parameter is an array of strings, then it will be
	            used to select the members to be serialized. It filters the results
	            such that only members with keys listed in the replacer array are
	            stringified.
	
	            Values that do not have JSON representations, such as undefined or
	            functions, will not be serialized. Such values in objects will be
	            dropped; in arrays they will be replaced with null. You can use
	            a replacer function to replace those with JSON values.
	            JSON.stringify(undefined) returns undefined.
	
	            The optional space parameter produces a stringification of the
	            value that is filled with line breaks and indentation to make it
	            easier to read.
	
	            If the space parameter is a non-empty string, then that string will
	            be used for indentation. If the space parameter is a number, then
	            the indentation will be that many spaces.
	
	            Example:
	
	            text = JSON.stringify(['e', {pluribus: 'unum'}]);
	            // text is '["e",{"pluribus":"unum"}]'
	
	
	            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
	            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
	
	            text = JSON.stringify([new Date()], function (key, value) {
	                return this[key] instanceof Date ?
	                    'Date(' + this[key] + ')' : value;
	            });
	            // text is '["Date(---current time---)"]'
	
	
	        JSON.parse(text, reviver)
	            This method parses a JSON text to produce an object or array.
	            It can throw a SyntaxError exception.
	
	            The optional reviver parameter is a function that can filter and
	            transform the results. It receives each of the keys and values,
	            and its return value is used instead of the original value.
	            If it returns what it received, then the structure is not modified.
	            If it returns undefined then the member is deleted.
	
	            Example:
	
	            // Parse the text. Values that look like ISO date strings will
	            // be converted to Date objects.
	
	            myData = JSON.parse(text, function (key, value) {
	                var a;
	                if (typeof value === 'string') {
	                    a =
	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
	                    if (a) {
	                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
	                            +a[5], +a[6]));
	                    }
	                }
	                return value;
	            });
	
	            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
	                var d;
	                if (typeof value === 'string' &&
	                        value.slice(0, 5) === 'Date(' &&
	                        value.slice(-1) === ')') {
	                    d = new Date(value.slice(5, -1));
	                    if (d) {
	                        return d;
	                    }
	                }
	                return value;
	            });
	
	
	    This is a reference implementation. You are free to copy, modify, or
	    redistribute.
	*/
	
	// Create a JSON object only if one does not already exist. We create the
	// methods in a closure to avoid creating global variables.
	
	if (typeof JSON !== 'object') {
	    JSON = {};
	}
	
	(function () {
	    'use strict';
	
	    function f(n) {
	        // Format integers to have at least two digits.
	        return n < 10 ? '0' + n : n;
	    }
	
	    if (typeof Date.prototype.toJSON !== 'function') {
	
	        Date.prototype.toJSON = function (key) {
	
	            return isFinite(this.valueOf())
	                ? this.getUTCFullYear()     + '-' +
	                    f(this.getUTCMonth() + 1) + '-' +
	                    f(this.getUTCDate())      + 'T' +
	                    f(this.getUTCHours())     + ':' +
	                    f(this.getUTCMinutes())   + ':' +
	                    f(this.getUTCSeconds())   + 'Z'
	                : null;
	        };
	
	        String.prototype.toJSON      =
	            Number.prototype.toJSON  =
	            Boolean.prototype.toJSON = function (key) {
	                return this.valueOf();
	            };
	    }
	
	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        gap,
	        indent,
	        meta = {    // table of character substitutions
	            '\b': '\\b',
	            '\t': '\\t',
	            '\n': '\\n',
	            '\f': '\\f',
	            '\r': '\\r',
	            '"' : '\\"',
	            '\\': '\\\\'
	        },
	        rep;
	
	
	    function quote(string) {
	
	// If the string contains no control characters, no quote characters, and no
	// backslash characters, then we can safely slap some quotes around it.
	// Otherwise we must also replace the offending characters with safe escape
	// sequences.
	
	        escapable.lastIndex = 0;
	        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	            var c = meta[a];
	            return typeof c === 'string'
	                ? c
	                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	        }) + '"' : '"' + string + '"';
	    }
	
	
	    function str(key, holder) {
	
	// Produce a string from holder[key].
	
	        var i,          // The loop counter.
	            k,          // The member key.
	            v,          // The member value.
	            length,
	            mind = gap,
	            partial,
	            value = holder[key];
	
	// If the value has a toJSON method, call it to obtain a replacement value.
	
	        if (value && typeof value === 'object' &&
	                typeof value.toJSON === 'function') {
	            value = value.toJSON(key);
	        }
	
	// If we were called with a replacer function, then call the replacer to
	// obtain a replacement value.
	
	        if (typeof rep === 'function') {
	            value = rep.call(holder, key, value);
	        }
	
	// What happens next depends on the value's type.
	
	        switch (typeof value) {
	        case 'string':
	            return quote(value);
	
	        case 'number':
	
	// JSON numbers must be finite. Encode non-finite numbers as null.
	
	            return isFinite(value) ? String(value) : 'null';
	
	        case 'boolean':
	        case 'null':
	
	// If the value is a boolean or null, convert it to a string. Note:
	// typeof null does not produce 'null'. The case is included here in
	// the remote chance that this gets fixed someday.
	
	            return String(value);
	
	// If the type is 'object', we might be dealing with an object or an array or
	// null.
	
	        case 'object':
	
	// Due to a specification blunder in ECMAScript, typeof null is 'object',
	// so watch out for that case.
	
	            if (!value) {
	                return 'null';
	            }
	
	// Make an array to hold the partial results of stringifying this object value.
	
	            gap += indent;
	            partial = [];
	
	// Is the value an array?
	
	            if (Object.prototype.toString.apply(value) === '[object Array]') {
	
	// The value is an array. Stringify every element. Use null as a placeholder
	// for non-JSON values.
	
	                length = value.length;
	                for (i = 0; i < length; i += 1) {
	                    partial[i] = str(i, value) || 'null';
	                }
	
	// Join all of the elements together, separated with commas, and wrap them in
	// brackets.
	
	                v = partial.length === 0
	                    ? '[]'
	                    : gap
	                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
	                    : '[' + partial.join(',') + ']';
	                gap = mind;
	                return v;
	            }
	
	// If the replacer is an array, use it to select the members to be stringified.
	
	            if (rep && typeof rep === 'object') {
	                length = rep.length;
	                for (i = 0; i < length; i += 1) {
	                    if (typeof rep[i] === 'string') {
	                        k = rep[i];
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            } else {
	
	// Otherwise, iterate through all of the keys in the object.
	
	                for (k in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, k)) {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            }
	
	// Join all of the member texts together, separated with commas,
	// and wrap them in braces.
	
	            v = partial.length === 0
	                ? '{}'
	                : gap
	                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
	                : '{' + partial.join(',') + '}';
	            gap = mind;
	            return v;
	        }
	    }
	
	// If the JSON object does not yet have a stringify method, give it one.
	
	    if (typeof JSON.stringify !== 'function') {
	        JSON.stringify = function (value, replacer, space) {
	
	// The stringify method takes a value and an optional replacer, and an optional
	// space parameter, and returns a JSON text. The replacer can be a function
	// that can replace values, or an array of strings that will select the keys.
	// A default replacer method can be provided. Use of the space parameter can
	// produce text that is more easily readable.
	
	            var i;
	            gap = '';
	            indent = '';
	
	// If the space parameter is a number, make an indent string containing that
	// many spaces.
	
	            if (typeof space === 'number') {
	                for (i = 0; i < space; i += 1) {
	                    indent += ' ';
	                }
	
	// If the space parameter is a string, it will be used as the indent string.
	
	            } else if (typeof space === 'string') {
	                indent = space;
	            }
	
	// If there is a replacer, it must be a function or an array.
	// Otherwise, throw an error.
	
	            rep = replacer;
	            if (replacer && typeof replacer !== 'function' &&
	                    (typeof replacer !== 'object' ||
	                    typeof replacer.length !== 'number')) {
	                throw new Error('JSON.stringify');
	            }
	
	// Make a fake root object containing our value under the key of ''.
	// Return the result of stringifying the value.
	
	            return str('', {'': value});
	        };
	    }
	
	
	// If the JSON object does not yet have a parse method, give it one.
	
	    if (typeof JSON.parse !== 'function') {
	        JSON.parse = function (text, reviver) {
	
	// The parse method takes a text and an optional reviver function, and returns
	// a JavaScript value if the text is a valid JSON text.
	
	            var j;
	
	            function walk(holder, key) {
	
	// The walk method is used to recursively walk the resulting structure so
	// that modifications can be made.
	
	                var k, v, value = holder[key];
	                if (value && typeof value === 'object') {
	                    for (k in value) {
	                        if (Object.prototype.hasOwnProperty.call(value, k)) {
	                            v = walk(value, k);
	                            if (v !== undefined) {
	                                value[k] = v;
	                            } else {
	                                delete value[k];
	                            }
	                        }
	                    }
	                }
	                return reviver.call(holder, key, value);
	            }
	
	
	// Parsing happens in four stages. In the first stage, we replace certain
	// Unicode characters with escape sequences. JavaScript handles many characters
	// incorrectly, either silently deleting them, or treating them as line endings.
	
	            text = String(text);
	            cx.lastIndex = 0;
	            if (cx.test(text)) {
	                text = text.replace(cx, function (a) {
	                    return '\\u' +
	                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	                });
	            }
	
	// In the second stage, we run the text against regular expressions that look
	// for non-JSON patterns. We are especially concerned with '()' and 'new'
	// because they can cause invocation, and '=' because it can cause mutation.
	// But just to be safe, we want to reject all unexpected forms.
	
	// We split the second stage into 4 regexp operations in order to work around
	// crippling inefficiencies in IE's and Safari's regexp engines. First we
	// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
	// replace all simple value tokens with ']' characters. Third, we delete all
	// open brackets that follow a colon or comma or that begin the text. Finally,
	// we look to see that the remaining characters are only whitespace or ']' or
	// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
	
	            if (/^[\],:{}\s]*$/
	                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
	                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
	                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
	
	// In the third stage we use the eval function to compile the text into a
	// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
	// in JavaScript: it can begin a block or an object literal. We wrap the text
	// in parens to eliminate the ambiguity.
	
	                j = eval('(' + text + ')');
	
	// In the optional fourth stage, we recursively walk the new structure, passing
	// each name/value pair to a reviver function for possible transformation.
	
	                return typeof reviver === 'function'
	                    ? walk({'': j}, '')
	                    : j;
	            }
	
	// If the text is not JSON parseable, then a SyntaxError is thrown.
	
	            throw new SyntaxError('JSON.parse');
	        };
	    }
	}());
	

/**** _header.js ****/

	(function(publicApi) { // Global wrapper
	
	var Jsonary = publicApi;
		
	publicApi.toString = function() {
		return "<Jsonary>";
	};
	publicApi.plugins = {};
	
	function setTimeout(fn, t) {
		throw new Error("setTimeout() should not be used");
	}
	
	

/**** uri.js ****/

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
		},
		queryObj: function () {
			var result = {};
			if (this.query) {
				for (var i = 0; i < this.query.length; i++) {
					var pair = this.query[i];
					result[pair.key] = pair.value;
				}
			}
			return result;
		},
		resolve: function (relative) {
			var result = new Uri(relative + "");
			if (result.scheme == null) {
				result.scheme = this.scheme;
				result.doubleSlash = this.doubleSlash;
				if (result.domain == null) {
					result.domain = this.domain;
					result.port = this.port;
					result.username = this.username;
					result.password = this.password;
					if (result.path == null) {
						result.path = this.path;
						if (result.query == null) {
							result.query = this.query;
						}
					} else if (result.path.charAt(0) != "/" && this.path != null) {
						var precedingSlash = this.path.charAt(0) == "/";
						var thisParts;
						if (precedingSlash) {
							thisParts = this.path.substring(1).split("/");
						} else {
							thisParts = this.path.split("/");
						}
						if (thisParts[thisParts.length - 1] == "..") {
							thisParts.push("");
						}
						thisParts.pop();
						for (var i = thisParts.length - 1; i >= 0; i--) {
							if (thisParts[i] == ".") {
								thisParts.slice(i, 1);
							}
						}
						var resultParts = result.path.split("/");
						for (var i = 0; i < resultParts.length; i++) {
							var part = resultParts[i];
							if (part == ".") {
								continue;
							} else if (part == "..") {
								if (thisParts.length > 0 && thisParts[thisParts.length - 1] != "..") {
									thisParts.pop();
								} else if (!precedingSlash) {
									thisParts = thisParts.concat(resultParts.slice(i));
									break;
								}
							} else {
								thisParts.push(part);
							}
						}
						result.path = (precedingSlash ? "/" : "") + thisParts.join("/");
					}
				}
			}
			return result.toString();
		}
	};
	publicApi.baseUri = null;
	Uri.resolve = function(base, relative) {
		if (relative == undefined) {
			relative = base;
			if (publicApi.baseUri) {
				base = publicApi.baseUri;
			} else if (typeof window != 'undefined') {
				base = window.location.href;
			} else {
				return base;
			}
		}
		if (base == undefined) {
			return relative;
		}
		if (!(base instanceof Uri)) {
			base = new Uri(base);
		}
		return base.resolve(relative);
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
		var oldJson = JSON.stringify(pairs);
		pairs.toString = function () {
			if (JSON.stringify(this) == oldJson) {
				return queryString;
			}
			return queryFunctions.toString.call(this);
		};
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
			for (var i = this.length - 1; i >= 0; i--) {
				if (this[i].key == key) {
					return this[i].value;
				}
			}
			return defaultValue;
		},
		set: function(key, value) {
			for (var i = this.length - 1; i >= 0; i--) {
				if (this[i].key == key) {
					this[i].value = value;
					return;
				}
			}
			this.push({key: key, value: value});
		}
	};
	
	publicApi.Uri = Uri;
	

/**** uri-templates.js ****/

	var UriTemplate = (function () {
	
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
		
		function notReallyPercentEncode(string) {
			return encodeURI(string).replace(/%25[0-9][0-9]/g, function (doubleEncoded) {
				return "%" + doubleEncoded.substring(3);
			});
		}
	
		function uriTemplateSubstitution(spec) {
			var modifier = "";
			if (uriTemplateGlobalModifiers[spec.charAt(0)]) {
				modifier = spec.charAt(0);
				spec = spec.substring(1);
			}
			var separator = "";
			var prefix = "";
			var shouldEscape = true;
			var showVariables = false;
			var trimEmptyString = false;
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
				trimEmptyString = true;
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
			var varSpecMap = {};
			for (var i = 0; i < varList.length; i++) {
				var varName = varList[i];
				var truncate = null;
				if (varName.indexOf(":") != -1) {
					var parts = varName.split(":");
					varName = parts[0];
					truncate = parseInt(parts[1]);
				}
				var suffices = {};
				while (uriTemplateSuffices[varName.charAt(varName.length - 1)]) {
					suffices[varName.charAt(varName.length - 1)] = true;
					varName = varName.substring(0, varName.length - 1);
				}
				var varSpec = {
					truncate: truncate,
					name: varName,
					suffices: suffices
				};
				varSpecs.push(varSpec);
				varSpecMap[varName] = varSpec;
				varNames.push(varName);
			}
			var subFunction = function (valueFunction) {
				var result = "";
				var startIndex = 0;
				for (var i = 0; i < varSpecs.length; i++) {
					var varSpec = varSpecs[i];
					var value = valueFunction(varSpec.name);
					if (value == null || (Array.isArray(value) && value.length == 0) || (typeof value == 'object' && Object.keys(value).length == 0)) {
						startIndex++;
						continue;
					}
					if (i == startIndex) {
						result += prefix;
					} else {
						result += (separator || ",");
					}
					if (Array.isArray(value)) {
						if (showVariables) {
							result += varSpec.name + "=";
						}
						for (var j = 0; j < value.length; j++) {
							if (j > 0) {
								result += varSpec.suffices['*'] ? (separator || ",") : ",";
								if (varSpec.suffices['*'] && showVariables) {
									result += varSpec.name + "=";
								}
							}
							result += shouldEscape ? encodeURIComponent(value[j]).replace(/!/g, "%21") : notReallyPercentEncode(value[j]);
						}
					} else if (typeof value == "object") {
						if (showVariables && !varSpec.suffices['*']) {
							result += varSpec.name + "=";
						}
						var first = true;
						for (var key in value) {
							if (!first) {
								result += varSpec.suffices['*'] ? (separator || ",") : ",";
							}
							first = false;
							result += shouldEscape ? encodeURIComponent(key).replace(/!/g, "%21") : notReallyPercentEncode(key);
							result += varSpec.suffices['*'] ? '=' : ",";
							result += shouldEscape ? encodeURIComponent(value[key]).replace(/!/g, "%21") : notReallyPercentEncode(value[key]);
						}
					} else {
						if (showVariables) {
							result += varSpec.name;
							if (!trimEmptyString || value != "") {
								result += "=";
							}
						}
						if (varSpec.truncate != null) {
							value = value.substring(0, varSpec.truncate);
						}
						result += shouldEscape ? encodeURIComponent(value).replace(/!/g, "%21"): notReallyPercentEncode(value);
					}
				}
				return result;
			};
			var guessFunction = function (stringValue, resultObj) {
				if (prefix) {
					if (stringValue.substring(0, prefix.length) == prefix) {
						stringValue = stringValue.substring(prefix.length);
					} else {
						return null;
					}
				}
				if (varSpecs.length == 1 && varSpecs[0].suffices['*']) {
					var varSpec = varSpecs[0];
					var varName = varSpec.name;
					var arrayValue = varSpec.suffices['*'] ? stringValue.split(separator || ",") : [stringValue];
					var hasEquals = (shouldEscape && stringValue.indexOf('=') != -1);	// There's otherwise no way to distinguish between "{value*}" for arrays and objects
					for (var i = 1; i < arrayValue.length; i++) {
						var stringValue = arrayValue[i];
						if (hasEquals && stringValue.indexOf('=') == -1) {
							// Bit of a hack - if we're expecting "=" for key/value pairs, and values can't contain "=", then assume a value has been accidentally split
							arrayValue[i - 1] += (separator || ",") + stringValue;
							arrayValue.splice(i, 1);
							i--;
						}
					}
					for (var i = 0; i < arrayValue.length; i++) {
						var stringValue = arrayValue[i];
						if (shouldEscape && stringValue.indexOf('=') != -1) {
							hasEquals = true;  
						}
						var innerArrayValue = stringValue.split(",");
						for (var j = 0; j < innerArrayValue.length; j++) {
							if (shouldEscape) {
								innerArrayValue[j] = decodeURIComponent(innerArrayValue[j]);
							}
						}
						if (innerArrayValue.length == 1) {
							arrayValue[i] = innerArrayValue[0];
						} else {
							arrayValue[i] = innerArrayValue;
						}
					}
				
					if (showVariables || hasEquals) {
						var objectValue = resultObj[varName] || {};
						for (var j = 0; j < arrayValue.length; j++) {
							var innerValue = stringValue;
							if (typeof arrayValue[j] == "string") {
								var stringValue = arrayValue[j];
								var innerVarName = stringValue.split("=", 1)[0];
								var stringValue = stringValue.substring(innerVarName.length + 1);
								innerValue = stringValue;
							} else {
								var stringValue = arrayValue[j][0];
								var innerVarName = stringValue.split("=", 1)[0];
								var stringValue = stringValue.substring(innerVarName.length + 1);
								arrayValue[j][0] = stringValue;
								innerValue = arrayValue[j];
							}
							if (objectValue[innerVarName] !== undefined) {
								if (Array.isArray(objectValue[innerVarName])) {
									objectValue[innerVarName].push(innerValue);
								} else {
									objectValue[innerVarName] = [objectValue[innerVarName], innerValue];
								}
							} else {
								objectValue[innerVarName] = innerValue;
							}
						}
						if (Object.keys(objectValue).length == 1 && objectValue[varName] !== undefined) {
							resultObj[varName] = objectValue[varName];
						} else {
							resultObj[varName] = objectValue;
						}
					} else {
						if (resultObj[varName] !== undefined) {
							if (Array.isArray(resultObj[varName])) {
								resultObj[varName] = resultObj[varName].concat(arrayValue);
							} else {
								resultObj[varName] = [resultObj[varName]].concat(arrayValue);
							}
						} else {
							if (arrayValue.length == 1 && !varSpec.suffices['*']) {
								resultObj[varName] = arrayValue[0];
							} else {
								resultObj[varName] = arrayValue;
							}
						}
					}
				} else {
					var arrayValue = (varSpecs.length == 1) ? [stringValue] : stringValue.split(separator || ",");
					var specIndexMap = {};
					for (var i = 0; i < arrayValue.length; i++) {
						// Try from beginning
						for (var firstStarred = 0; firstStarred < varSpecs.length - 1 && firstStarred < i; firstStarred++) {
							if (varSpecs[firstStarred].suffices['*']) {
								break;
							}
						}
						if (j == i) {
							// The first [i] of them have no "*" suffix
							specIndexMap[i] = i;
							continue;
						} else {
							// Try from the end
							for (var lastStarred = varSpecs.length - 1; lastStarred > 0 && (varSpecs.length - lastStarred) < (arrayValue.length - i); lastStarred--) {
								if (varSpecs[lastStarred].suffices['*']) {
									break;
								}
							}
							if ((varSpecs.length - lastStarred) == (arrayValue.length - i)) {
								// The last [length - i] of them have no "*" suffix
								specIndexMap[i] = lastStarred;
								continue;
							}
						}
						// Just give up and use the first one
						specIndexMap[i] = firstStarred;
					}
					for (var i = 0; i < arrayValue.length; i++) {
						var stringValue = arrayValue[i];
						var innerArrayValue = stringValue.split(",");
					
						if (showVariables) {
							var stringValue = innerArrayValue[0]; // using innerArrayValue
							var varName = stringValue.split("=", 1)[0];
							var stringValue = stringValue.substring(varName.length + 1);
							innerArrayValue[0] = stringValue;
							var varSpec = varSpecMap[varName] || varSpecs[0];
						} else {
							var varSpec = varSpecs[specIndexMap[i]];
							var varName = varSpec.name;
						}
	
						for (var j = 0; j < innerArrayValue.length; j++) {
							if (shouldEscape) {
								innerArrayValue[j] = decodeURIComponent(innerArrayValue[j]);
							}
						}
	
						if ((showVariables || varSpec.suffices['*'])&& resultObj[varName] !== undefined) {
							if (Array.isArray(resultObj[varName])) {
								resultObj[varName] = resultObj[varName].concat(innerArrayValue);
							} else {
								resultObj[varName] = [resultObj[varName]].concat(innerArrayValue);
							}
						} else {
							if (innerArrayValue.length == 1 && !varSpec.suffices['*']) {
								resultObj[varName] = innerArrayValue[0];
							} else {
								resultObj[varName] = innerArrayValue;
							}
						}
					}
				}
			};
			subFunction.varNames = varNames;
			return {
				prefix: prefix,
				substitution: subFunction,
				unSubstitution: guessFunction
			};
		}
	
		function UriTemplate(template) {
			if (!(this instanceof UriTemplate)) {
				return new UriTemplate(template);
			}
			var parts = template.split("{");
			var textParts = [parts.shift()];
			var prefixes = [];
			var substitutions = [];
			var unSubstitutions = [];
			var varNames = [];
			while (parts.length > 0) {
				var part = parts.shift();
				var spec = part.split("}")[0];
				var remainder = part.substring(spec.length + 1);
				var funcs = uriTemplateSubstitution(spec);
				substitutions.push(funcs.substitution);
				unSubstitutions.push(funcs.unSubstitution);
				prefixes.push(funcs.prefix);
				textParts.push(remainder);
				varNames = varNames.concat(funcs.substitution.varNames);
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
			this.fromUri = function (substituted) {
				var result = {};
				for (var i = 0; i < textParts.length; i++) {
					var part = textParts[i];
					if (substituted.substring(0, part.length) !== part) {
						return undefined;
					}
					substituted = substituted.substring(part.length);
					if (i >= textParts.length - 1) {
						if (substituted == "") {
							break;
						} else {
							return undefined;
						}
					}
					var nextPart = textParts[i + 1];
					var offset = i;
					while (true) {
						if (offset == textParts.length - 2) {
							var endPart = substituted.substring(substituted.length - nextPart.length);
							if (endPart !== nextPart) {
								return undefined;
							}
							var stringValue = substituted.substring(0, substituted.length - nextPart.length);
							substituted = endPart;
						} else if (nextPart) {
							var nextPartPos = substituted.indexOf(nextPart);
							var stringValue = substituted.substring(0, nextPartPos);
							substituted = substituted.substring(nextPartPos);
						} else if (prefixes[offset + 1]) {
							var nextPartPos = substituted.indexOf(prefixes[offset + 1]);
							var stringValue = substituted.substring(0, nextPartPos);
							substituted = substituted.substring(nextPartPos);
						} else if (textParts.length > offset + 2) {
							// If the separator between this variable and the next is blank (with no prefix), continue onwards
							offset++;
							nextPart = textParts[offset + 1];
							continue;
						} else {
							var stringValue = substituted;
							substituted = "";
						}
						break;
					}
					unSubstitutions[i](stringValue, result);
				}
				return result;
			}
			this.varNames = varNames;
		}
		UriTemplate.prototype = {
			fillFromObject: function (obj) {
				return this.fill(function (varName) {
					return obj[varName];
				});
			}
		};
		
		if (typeof module != 'undefined') {
			module.exports = UriTemplate;
		}
		if (this) {
			this.UriTemplate = UriTemplate;
		}
		return UriTemplate;
	}).call(this);

/**** utils.js ****/

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
			if (data === "") {
				return result;
			}
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
		escapeHtml: function(text, singleQuotesOnly) {
			text += "";
			var escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");
			return singleQuotesOnly ? escaped : escaped.replace(/"/g, "&quot;");
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
		return Utils.getKeyVariant(baseKey, variantName ? ("~" + variantName) : undefined);
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
	
	function ResultCollector(resultCallback) {
		if (!(this instanceof ResultCollector)) {
			return new ResultCollector(resultCallback);
		}
		resultCallback = resultCallback || function (result) {return result};
		var thisResultCollector = this;
		
		this.done = false;
		function done() {
			thisResultCollector.done = true;
			thisResultCollector.result = function () {
				throw Error('More results than expected in ResultCollector');
			};
			doneCallback.call(this, resultObj);
			return thisResultCollector;
		}
	
		var resultObj = {}, pending = 0;
		var doneCallback = null;
		this.whenDone = function (callback) {
			doneCallback = callback;
			if (pending === 0) {
				done();
			}
			return this;
		};
		
		this.wait = function () {
			pending++;
			return this;
		};
		this.result = function () {
			pending--;
			var result = resultCallback.apply(this, arguments);
			if (!!doneCallback && pending === 0) {
				done();
			}
			return result;
		};
		this.forKey = function (key) {
			return function () {
				var df = doneCallback;
				doneCallback = null;
				var result = resultObj[key] = thisResultCollector.result.apply(this, arguments);
				thisResultCollector.whenDone(df);
				return result;
			}
		};
	}
	ResultCollector.prototype = {
		resultForKey: function (key) {
			var args = [];
			while (args.length < arguments.length - 1) {
				args[args.length] = arguments[args.length + 1];
			}
			return this.forKey(key).apply(this, args);
		}
	};
	publicApi.ResultCollector = ResultCollector;

/**** monitors.js ****/

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
	
	// DelayedCallbacks is used for notifications that might be external to the library
	// The callbacks are still executed synchronously - however, they are not executed while the system is in a transitional state.
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
				this.depth++;
				callback();
				this.depth--
			}
		},
		add: function (callback) {
			this.depth++;
			this.callbacks.push(callback);
			this.decrement();
		}
	};
	

/**** request.js ****/

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
	
	var beforeAjaxMonitors = new MonitorSet(null);
	publicApi.beforeAjax = function (callback) {
		beforeAjaxMonitors.add('monitor', callback);
	};
	
	publicApi.ajaxFunction = function (params, callback) {
		var xhrUrl = params.url;
		var xhrData = params.data;
		var encType = params.encType;
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status >= 200 && xhr.status < 300) {
					var data = xhr.responseText || null;
					try {
						data = JSON.parse(data);
					} catch (e) {
						if (xhr.status !=204) {
							callback(e, data);
							return;
						} else {
							data = null;
						}
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
					callback(null, data, headers);
				} else {
					var data = xhr.responseText || null;
					try {
						data = JSON.parse(data);
					} catch (e) {
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
					callback(new HttpError(xhr.status, xhr), data, headers);
				}
			}
		};
		xhr.open(params.method, xhrUrl, true);
		if (params.headers) {
			for (var key in params.headers) {
				var values = params.headers[key];
				if (!Array.isArray(values)) {
					values = [values];
				}
	
				var parts = key.split('-');
				for (var i = 0; i < parts.length; i++) {
					if (parts[i].length > 0) {
						parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substring(1).toLowerCase();
					}
				}
				key = parts.join('-');
				xhr.setRequestHeader(key, values.join(", "));
			}
		}
		xhr.setRequestHeader("Content-Type", encType);
		xhr.setRequestHeader("If-Modified-Since", "Thu, 01 Jan 1970 00:00:00 GMT");
		xhr.send(xhrData);
	};
	
	// Default cache
	(function () {
		var cacheData = {};
		var cacheTimes = {};
		/* empty() doesn't do anything, and this makes Node scripts never-ending (need timer.unref())
		var emptyTimeout = setInterval(function () {
			defaultCache.empty();
		}, 10*1000);
		*/
	
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
		this.document = request.document;
		if (fragment == null) {
			fragment = "";
		}
		this.url = this.baseUrl + "#" + encodeURI(fragment);
	
		this.getRoot = function (callback) {
			request.getRoot(function(data) {
				callback.call(data, data, thisFragmentRequest);
			});
			return this;
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
			return this;
		};
		this.getRawResponse = function (callback) {
			request.getResponse(function(data) {
				callback.call(data, data, thisFragmentRequest);
			});
			return this;
		};
	}
	FragmentRequest.prototype = {
		toString: function () {
			return "[Jsonary Request]";
		}
	}
	
	function requestJson(url, method, data, encType, cacheFunction, hintSchema, oldHeaders) {
		var headers = {};
		if (oldHeaders) {
			for (var key in oldHeaders) {
				headers[key.toLowerCase()] = oldHeaders[key];
			}
		}
	
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
	
		if (method == "GET") {
			data = Jsonary.encodeData(data, encType);
			if (data != '') {
				if (url.indexOf("?") == url.length - 1) {
					// It already ends with a query - do nothing
				} else if (url.indexOf("?") == -1) {
					url += "?";
				} else {
					url += "&";
				}
				url += data;
			}
			data = {};
		}
	
		var cacheable = (cacheFunction && method == "GET" && encType == "application/x-www-form-urlencoded" && 	!/^data:/.test(url));
		if (cacheable) {
			var cacheKey = JSON.stringify(url) + ":" + JSON.stringify(data);
			var result = cacheFunction(cacheKey);
			if (result != undefined) {
				return {
					request: result,
					fragmentRequest: new FragmentRequest(result, fragment)
				};
			}
		}
		var request = new Request(url, method, data, encType, hintSchema, headers, function (request) {
			if (cacheable) {
				cacheFunction(cacheKey, request);
			}
		});
		return {
			request: request,
			fragmentRequest: new FragmentRequest(request, fragment)
		};
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
		var request = requestJson(params.url, params.method, params.data, params.encType, null, hintSchema, params.headers).fragmentRequest;
		if (callback != undefined) {
			request.getData(callback);
		}
		return request;
	};
	publicApi.isRequest = function (obj) {
		return (obj instanceof Request) || (obj instanceof FragmentRequest);
	}
	
	function HttpError (code) {
		this.httpCode = code;
		this.message = "HTTP Status: " + code;
	}
	HttpError.prototype = new Error();
	publicApi.HttpError = HttpError;
	
	function Request(url, method, data, encType, hintSchema, headers, executeImmediately) {
		executeImmediately(this);
		url = Utils.resolveRelativeUri(url);
	
		data = (method == "GET" || method == "DELETE") ? null : Utils.encodeData(data, encType);
	
		Utils.log(Utils.logLevel.STANDARD, "Sending request for: " + url);
		var thisRequest = this;
		this.successful = null;
		this.error = null;
		this.url = url;
	
		var isDefinitive = (data == undefined) || (data == "");
		this.responseListeners = new ListenerSet(this);
		this.document = new Document(url, isDefinitive, true);
	
		this.fetched = false;
		this.fetchData(url, method, data, encType, hintSchema, headers);
		this.invalidate = function() {
			var makeRequest = function () {
				if (thisRequest.successful == null) {
					// We've already got a pending request
					return;
				}
				if (method == "GET") {
					thisRequest.fetchData(url, method, data, encType, hintSchema, headers);
				}
			};
			var thisRequest = this;
			this.document.whenAccessed(makeRequest);
			this.document.whenStable = function (callback) {
				delete thisRequest.document.whenStable;
				makeRequest();
				return thisRequest.document.whenStable(callback);
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
			var lines = headerText.replace(/\r\n/g, "\n").split("\n");
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
				keyName = keyName.toLowerCase();
				var values = value.split(', ');
				for (var j = 0; j < values.length; j++) {
					var value = values[j];
					if (headers[keyName] == undefined) {
						headers[keyName] = value;
					} else if (typeof headers[keyName] == "object") {
						headers[keyName].push(value);
					} else {
						headers[keyName] = [headers[keyName], value];
					}
				}
			}
			Utils.log(Utils.logLevel.DEBUG, "headers: " + JSON.stringify(headers, null, 4));
			var contentType = headers["content-type"].split(";")[0];
			var remainder = headers["content-type"].substring(contentType.length + 1);
			while (remainder.length > 0) {
				remainder = remainder.replace(/^,\s*/, '');
				var partName = remainder.split("=", 1)[0];
				remainder = remainder.substring(partName.length + 1).trim();
				partName = partName.trim();
				if (partName == "") {
					continue;
				}
				if (remainder.charAt(0) === '"') {
					partValue = /^"([^\\"]|\\.)*("|$)/.exec(remainder)[0];
					remainder = remainder.substring(partValue.length).trim();
					// Slight hack, perhaps
					try {
						contentTypeParameters[partName] = JSON.parse(partValue);
					} catch (e) {
						contentTypeParameters[partName] = partValue;
					}
				} else {
					partValue = /^[^,]*/.exec(remainder)[0];
					remainder = remainder.substring(partValue.length).trim();
					contentTypeParameters[partName] = partValue;
				}
			}
	
			thisRequest.headers = headers;
			thisRequest.contentType = contentType;
			thisRequest.contentTypeParameters = contentTypeParameters;
	
			thisRequest.document.http.error = null;
			thisRequest.document.http.headers = headers;
			thisRequest.document.setRaw(data);
			thisRequest.profileUrl = null;
			thisRequest.document.raw.removeSchema(SCHEMA_SET_FIXED_KEY);
			if (contentTypeParameters["profile"] != undefined) {
				var schemaUrl = contentTypeParameters["profile"];
				schemaUrl = Utils.resolveRelativeUri(thisRequest.url, schemaUrl);
				thisRequest.profileUrl = schemaUrl;
				thisRequest.document.raw.addSchema(schemaUrl, SCHEMA_SET_FIXED_KEY);
			} else if (hintSchema != undefined) {
				thisRequest.document.raw.addSchema(hintSchema, SCHEMA_SET_FIXED_KEY);
			}
			if (contentTypeParameters["root"] != undefined) {
				var link = {
					"href": contentTypeParameters["root"],
					"rel": "root"
				};
				thisRequest.document.raw.addLink(link);
			}
			
			// Links
			if (headers["link"]) {
				var links = (typeof headers["link"] == "object") ? headers['link'] : [headers['link']];
				for (var i = 0; i < links.length; i++) {
					var link = links[i];
					var parts = link.trim().split(";");
					var url = parts.shift().trim();
					url = url.substring(1, url.length - 1);
					var linkObj = {
						"href": url
					};
					for (var j = 0; j < parts.length; j++) {
						var part = parts[j];
						var key = part.substring(0, part.indexOf("="));
						var value = part.substring(key.length + 1);
						key = key.trim();
						if (value.charAt(0) == '"') {
							value = JSON.parse(value);
						}
						if (key == "type") {
							key = "mediaType";
						}
						linkObj[key] = value;
					}
					thisRequest.document.raw.addLink(linkObj);
				}
			}
	
			thisRequest.checkForFullResponse();
			thisRequest.waitingForRoot = true;
			thisRequest.document.raw.whenSchemasStable(function () {
				delete thisRequest.waitingForRoot;
				var rootLink = thisRequest.document.raw.getLink("root");
				if (rootLink != undefined) {
					var fragment = decodeURI(rootLink.href.substring(rootLink.href.indexOf("#") + 1));
					thisRequest.document.setRoot(fragment);
				} else {
					thisRequest.document.setRoot("");
				}
			});
		},
		ajaxError: function (error, data, headers) {
			this.fetched = true;
			var thisRequest = this;
			thisRequest.successful = false;
			thisRequest.error = error;
			Utils.log(Utils.logLevel.WARNING, "Error fetching: " + this.url + " (" + error.message + ")");
			thisRequest.document.http.error = error;
			thisRequest.document.http.headers = headers;
			thisRequest.document.setRaw(data);
			thisRequest.document.raw.whenSchemasStable(function () {
				thisRequest.document.setRoot("");
				thisRequest.checkForFullResponse();
			});
		},
		fetchData: function(url, method, data, encType, hintSchema, headers) {
			Jsonary.log(Jsonary.logLevel.DEBUG, "Document " + this.document.uniqueId + " is unstable");
			var stableListeners = new ListenerSet(this);
			this.document.whenStable = function (callback) {
				stableListeners.add(callback);
				return this;
			};
			
			var thisRequest = this;
			this.successful = null;
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
			if (publicApi.config.antiCacheUrls) {
				var extra = "_=" + Math.random();
				if (xhrUrl.indexOf("?") == -1) {
					xhrUrl += "?" + extra;
				} else {
					xhrUrl += "&" + extra;
				}
			}
			
			var params = {
				url: xhrUrl,
				data: xhrData,
				encType: encType,
				method: method,
				headers: headers || {}
			};
			beforeAjaxMonitors.notify(params);
			var dataCallback = function (error, data, headers) {
				if (!error) {
					// Special RESTy knowledge
					// TODO: check if result follows same schema as original - if so, assume it's the new value, to prevent extra request
					// If we don't *have* the original, search for any rel="self" links and replace (if we have the original, these should already have been replaced)
					if (params.method == "PUT") {
						publicApi.invalidate(params.url);
					}			
	
					thisRequest.ajaxSuccess(data, headers, hintSchema);
				} else {
					thisRequest.ajaxError(error, data, headers);
				}
				Jsonary.log(Jsonary.logLevel.DEBUG, "Document " + thisRequest.document.uniqueId + " is stable");
				delete thisRequest.document.whenStable;
				stableListeners.notify(thisRequest.document);
			};
			if (/^data:/.test(xhrUrl)) {
				var firstPart = xhrUrl.split(',', 1)[0];
				var encodedData = xhrUrl.substring(firstPart.length + 1);
				firstPart = firstPart.substring(5); // remove "data:"
				var dataParams = firstPart.split(';');
				var dataType = dataParams[0]
				var base64 = dataParams.indexOf('base64') !== -1;
				var resHeaders = "Content-Type: " + dataType.replace(/\s/g, '');
				var error = null, decodedData;
				if (base64) {
					error = new Error("base64 data URLs not supported yet");
					decodedData = encodedData;
				} else {
					decodedData = decodeURIComponent(encodedData.replace(/\+/g, '%20'));
				}
				try {
					decodedData = JSON.parse(decodedData);
				} catch (e) {
				}
				return dataCallback(error, decodedData, resHeaders);
			}
			publicApi.ajaxFunction(params, dataCallback);
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
		this.error = null;
	
		this.fetched = false;
		this.invalidate = function() {
			this.fetchData(url, "GET", undefined, "application/x-www-form-urlencoded", schemaUrl);
		};
	}
	RequestFake.prototype = Request.prototype;
	
	

/**** patch.js ****/

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
			if (typeof path == "object") {
				path = path.pointerPath();
			}
			var minDepth = NaN;
			if (this._subject.substring(0, path.length) == path) {
				var remainder = this._subject.substring(path.length);
				if (remainder.length == 0) {
					minDepth = 0;
				} else if (remainder.charAt(0) == "/") {
					minDepth = remainder.split("/").length;
				}
			}
			if (this._target != undefined) {
				if (this._target.substring(0, path.length) == path) {
					var targetDepth;
					var remainder = this._target.substring(path.length);
					if (remainder.length == 0) {
						targetDepth = 0;
					} else if (remainder.charAt(0) == "/") {
						targetDepth = remainder.split("/").length;
					}
					if (!isNaN(targetDepth) && targetDepth < minDepth) {
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
					return Utils.decodePointerComponent(remainder);
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
					return Utils.decodePointerComponent(remainder);
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
			if (typeof prefix == "object") {
				prefix = prefix.pointerPath();
			}
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
	
	
	

/**** data.js ****/

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
		var thisDocument = this;
		this.readOnly = !!readOnly;
		this.isDefinitive = !!isDefinitive;
		this.url = url;
		this.http = {
			error: null
		};
	
		var rootPath = null;
		this.rootPath = function () {
			return rootPath;
		};
		var rawSecrets = {};
		this.raw = new Data(this, rawSecrets);
		this.uniqueId = this.raw.uniqueId;
		this.root = null;
		
		var documentChangeListeners = [];
		this.registerChangeListener = function (listener) {
			documentChangeListeners.push(listener);
		};
		function notifyChangeListeners(patch) {
			DelayedCallbacks.increment();
			var listeners = changeListeners.concat(documentChangeListeners);
			DelayedCallbacks.add(function () {
				for (var i = 0; i < listeners.length; i++) {
					listeners[i].call(thisDocument, patch, thisDocument);
				}
			});
			DelayedCallbacks.decrement();
		}
	
		var accessCallbacks = [];
		this.access = function () {
			while (accessCallbacks.length) {
				accessCallbacks.shift().call(this);
			}
		}
		this.whenAccessed = function (callback) {
			if (publicApi.config.accessImmediately) {
				callback.call(this);
			} else {
				accessCallbacks.push(callback);
			}
		}
	
		this.setRaw = function (value) {
			var needsFakePatch = this.raw.defined();
			rawSecrets.setValue(value);
			// It's an update to a read-only document
			if (needsFakePatch) {
				rawSecrets.setValue(value);
				var patch = new Patch();
				patch.replace(this.raw.pointerPath(), value);
				notifyChangeListeners(patch);
			}
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
			this.access();
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
			var rawPatch = patch.filter("?");
			var rootPatch = patch.filterRemainder("?");
			this.raw.patch(rawPatch);
			this.root.patch(rootPatch);
			notifyChangeListeners(patch);
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
		
		var baseUrl = (this.url || '').split('#')[0];
		var fragmentMap = {};
		this.addSelfLink = function (link) {
			var href = link.rawLink.href;
			if (href.substring(0, baseUrl.length + 1) == baseUrl + '#') {
				var fragment = decodeURIComponent(href.substring(baseUrl.length + 1));
				fragmentMap[fragment] = link.dataObj;
			}
		};
		this.removeSelfLink = function (link) {
			var href = link.rawLink.href;
			if (href.substring(0, baseUrl.length + 1) == baseUrl + '#') {
				var fragment = decodeURIComponent(href.substring(baseUrl.length + 1));
				if (fragmentMap[fragment] == link.dataObj) {
					delete fragmentMap[fragment];
				}
			}
		};
		this.getFragment = function (fragment, callback) {
			if (fragmentMap[fragment] !== undefined) {
				callback.call(this, fragmentMap[fragment]);
				return;
			}
			this.getRoot(function (data) {
				if (fragment == "") {
					callback.call(this, data);
				} else {
					var fragmentData = data.subPath(fragment);
					callback.call(this, fragmentData);
				}
			});
		};
	}
	
	Document.prototype = {
		toString: function () {
			return "[Jsonary Document]";
		},
		resolveUrl: function (url) {
			return Uri.resolve(this.url, url);
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
		},
		whenStable: function (callback) {
			callback.call(this, this);
			return this;
		}
	}
	
	var INDEX_REGEX = /^(0|[1-9]\d*)$/
	function isIndex(value) {
		return INDEX_REGEX.test(value);
	}
	
	var META_SCHEMA_KEY = "meta-schema-key";
	
	var uniqueIdCounter = 0;
	function Data(document, secrets, parent, parentKey) {
		this.uniqueId = uniqueIdCounter++;
		this.document = document;
		this.readOnly = function (includeSchemas) {
			if (includeSchemas || includeSchemas === undefined) {
				return document.readOnly
					|| this.schemas().readOnly()
					|| (parent != undefined && parent.readOnly(true));
			} else {
				return document.readOnly;
			}
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
			document.access();
			return basicType;
		};
		this.value = function() {
			document.access();
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
			document.access();
			return keys.slice(0);
		};
		this.length = function () {
			document.access();
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
						if (!parent) {
							secrets.setValue(undefined);
						}
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
					if (typeof child == "string") {
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
					if (typeof targetChild == "string") {
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
		this.schemas = function (forceForUndefined) {
			if (forceForUndefined && basicType == undefined && parent) {
				if (parent.basicType() === 'array' && isIndex(parentKey)) {
					return parent.schemas(true).indexSchemas(parentKey);
				} else if (parent.basicType() === 'object') {
					return parent.schemas(true).propertySchemas(parentKey);
				}
			}
			document.access();
			return secrets.schemas.getSchemas();
		};
		this.whenSchemasStable = function(callback) {
			document.access();
			secrets.schemas.whenSchemasStable(callback);
			return this;
		};
		this.links = function (rel) {
			document.access();
			return secrets.schemas.getLinks(rel);
		};
		this.addLink = function (rawLink) {
			document.access();
			secrets.schemas.addLink(rawLink);
			return this;
		};
		this.addSchema = function (schema, schemaKey) {
			document.access();
			var thisData = this;
			if (schema instanceof SchemaList) {
				schema.each(function (index, schema) {
					thisData.addSchema(schema, schemaKey);
				});
			} else {
				secrets.schemas.addSchema(schema, schemaKey);
			}
			return this;
		};
		this.removeSchema = function ( schemaKey) {
			document.access();
			secrets.schemas.removeSchema(schemaKey);
			return this;
		};
		// TODO: remove this
		this.addSchemaMatchMonitor = function (monitorKey, schema, monitor, executeImmediately, impatientCallbacks) {
			document.access();
			return secrets.schemas.addSchemaMatchMonitor(monitorKey, schema, monitor, executeImmediately, impatientCallbacks);
		};
		this.validate = function () {
			document.access();
			return secrets.schemas.validate();
		};
	}
	Data.prototype = {
		toString: function () {
			return "[Jsonary Data]";
		},
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
				throw new Error("Path must begin with / (or be empty): " + path);
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
			if (this.readOnly(false)) {
				return this;
			}
			var url = this.resolveUrl('#:copy');
			var copy = publicApi.create(this.value(), url, true);
			copy.addSchema(this.schemas().fixed());
			return copy;
		},
		editableCopy: function () {
			var url = this.resolveUrl('#:copy');
			var copy = publicApi.create(this.value(), url, false);
			copy.addSchema(this.schemas().fixed());
			return copy;
		},
		asSchema: function () {
			var readOnlyCopy = this.readOnlyCopy();
			var schema = new Schema(readOnlyCopy);
			if (this.readOnly(false)) {
				cacheResult(this, {asSchema: schema});
			}
			if (!readOnlyCopy.property("$ref").defined()) {
				readOnlyCopy.addSchema("http://json-schema.org/hyper-schema", META_SCHEMA_KEY);
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
			if (this.readOnly(false)) {
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
		properties: function (keys, callback, additionalCallback) {
			var dataKeys;
			if (typeof keys == 'function') {
				callback = keys;
				keys = this.keys();
			}
			if (callback) {
				for (var i = 0; i < keys.length; i++) {
					var subData = this.property(keys[i]);
					callback.call(subData, keys[i], subData);
				}
			}
			if (additionalCallback) {
				if (typeof additionalCallback != 'function') {
					additionalCallback = callback;
				}
				var dataKeys = this.keys();
				for (var i = 0; i < dataKeys.length; i++) {
					if (keys.indexOf(dataKeys[i]) == -1) {
						var subData = this.property(dataKeys[i]);
						additionalCallback.call(subData, dataKeys[i], subData);
					}
				}
			}
			return this;
		},
		resolveUrl: function (url) {
			var data = this;
			while (data) {
				var selfLink = data.getLink("self");
				if (selfLink) {
					return Uri.resolve(selfLink.href, url);
				}
				data = data.parent();
			}
			return this.document.resolveUrl(url);
		},
		get: function (path) {
			if (!path) {
				return this.value();
			}
			return this.subPath(path).value();
		},
		set: function (path, value) {
			if (arguments.length == 1) {
				return this.setValue(path);
			}
			this.subPath(path).setValue(value);
			return this;
		},
		json: function (indent) {
			return JSON.stringify(this.value(), null, indent);
		},
		whenStable: function (callback) {
			var thisData = this;
			this.document.whenStable(function () {
				thisData.whenSchemasStable(callback.bind(thisData, thisData));
			});
			return this;
		},
		valid: function () {
			return this.validate().valid;
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
		var rawData = (typeof rawData == "object") ? JSON.parse(JSON.stringify(rawData)) : rawData; // Hacky recursive copy
		var definitive = baseUrl != undefined && readOnly;
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
	publicApi.isData = function (obj) {
		return obj instanceof Data;
	};
	
	Data.prototype.deflate = function () {
		var result = this.document.deflate();
		return {
			document: this.document.deflate(),
			path: this.pointerPath()
		}
	};
	Document.prototype.deflate = function (canUseUrl) {
		if (this.isDefinitive) {
			return this.url;
		}
		var rawData = this.raw;
		var schemas = [];
		rawData.schemas().fixed().each(function (index, schema) {
			if (schema.referenceUrl() != undefined) {
				schemas.push(schema.referenceUrl());
			} else {
				schemas.push(schema.data.deflate());
			}
		});
		var result = {
			baseUrl: this.url,
			readOnly: this.readOnly,
			value: rawData.value(),
			schemas: schemas,
			root: this.rootPath()
		}
		return result;
	};
	publicApi.inflate = function (deflated, callback) {
		if (deflated.path !== undefined && deflated.document !== undefined) {
			return publicApi.inflate(deflated.document).root.subPath(deflated.path);
		}
		if (typeof deflated == "string") {
			var request = requestJson(deflated).request;
			if (callback) {
				request.document.getRoot(function (root) {
					root.whenSchemasStable(function () {
						callback(null, request.document);
					});
				});
			}
			return request.document;
		}
		var data = publicApi.create(deflated.value, deflated.baseUrl, deflated.readOnly);
		for (var i = 0; i < deflated.schemas.length; i++) {
			var schema = deflated.schemas[i];
			if (typeof schema == "object") {
				var schema = publicApi.inflate(schema).asSchema();
			}
			data.addSchema(schema);
		}
		data.document.setRoot(deflated.root);
		var result = data.document;
		if (callback) {
			callback(null, result);
		}
		return result;
	};
	

/**** schema.js ****/

	function getSchema(url, callback) {
		return publicApi.getData(url).getRawResponse(function(data, fragmentRequest) {
			// Set the root to avoid blocking on self-referential schemas
			if (!data.document.root) {
				data.document.setRoot('');
			}
		}).getData(function (data, fragmentRequest) {
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
	publicApi.isSchema = function (obj) {
		return obj instanceof Schema;
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
		this.links = function (rel) {
			var filtered = [];
			for (var i = 0; i < potentialLinks.length; i++) {
				var link = potentialLinks[i];
				if (rel == undefined || link.rel == rel) {
					filtered.push(link);
				}
			}
			return filtered;
		};
		this.schemaTitle = this.title();	
	}
	Schema.prototype = {
		"toString": function () {
			return "[Jsonary Schema]";
		},
		referenceUrl: function (includeRef) {
			if (includeRef && this.data.property('$ref').defined()) {
				return this.data.resolveUrl(this.data.propertyValue("$ref"));
			}
			return this.data.referenceUrl();
		},
		isFull: function () {
			var refUrl = this.data.propertyValue("$ref");
			return refUrl === undefined;
		},
		getFull: function (callback, pastUrls) {
			var refUrl = this.data.propertyValue("$ref");
			if (refUrl === undefined) {
				if (callback) {
					callback.call(this, this, undefined);
				}
				return this;
			}
			pastUrls = pastUrls || [];
			refUrl = this.data.resolveUrl(refUrl);
			if (pastUrls.indexOf(refUrl) !== -1) {
				Jsonary.log(Jsonary.logLevel.ERROR, "Circular $ref cycle: " + JSON.stringify(pastUrls));
				var schema = Jsonary.createSchema({title: "Circular $ref cycle", description: JSON.stringify(pastUrls)});
				if (callback) {
					callback.call(schema, schema, undefined);
				}
				return schema;
			}
			pastUrls.push(refUrl);
			if (refUrl.charAt(0) == "#" && (refUrl.length == 1 || refUrl.charAt(1) == "/")) {
				var documentRoot = this.data.document.root;
				var pointerPath = decodeURIComponent(refUrl.substring(1));
				var schema = documentRoot.subPath(pointerPath).asSchema();
				if (callback) {
					schema.getFull(callback, pastUrls);
					callback.call(schema, schema, null);
				} else {
					return schema.getFull(null, pastUrls);
				}
			} else if (callback) {
				if (refUrl.charAt(0) == "#") {
					var fragment = decodeURIComponent(refUrl.substring(1));
					var document = this.data.document;
					document.getFragment(fragment, function (data) {
						var schema = data.asSchema();
						callback.call(schema, schema, null);
					});
				} else {
					getSchema(refUrl, callback);
				}
			} else {
				var result = this;
				this.getFull(function (fullResult) {
					result = fullResult;
				}); // We don't pass in pastUrls here - the with-callback will do that for us
				return result;
			}
		},
		title: function () {
			return this.data.propertyValue("title") || null;
		},
		forceTitle: function () {
			var title = this.data.propertyValue("title") || null;
			if (title === null) {
				if (this.enumData().defined()) {
					return "enum";
				}
				var basicTypes = this.basicTypes();
				if (basicTypes.length == 1) {
					if (basicTypes[0] == 'array' && !this.tupleTyping()) {
						var indexSchemas = this.indexSchemas(0);
						var itemTitle = indexSchemas.forceTitle();
						if (itemTitle) {
							return "array of " + itemTitle + " items";
						}
					} else {
						return basicTypes[0];
					}
				}
			}
			return title;
		},
		hasDefault: function() {
			return this.data.property("default").defined();
		},
		defaultValue: function() {
			return this.data.propertyValue("default");
		},
		additionalPropertySchemas: function () {
			var schemas = [];
			if (this.data.property("additionalProperties").basicType() == 'object') {
				schemas.push(this.data.property("additionalProperties").asSchema().getFull());
			}
			return new SchemaList(schemas);
		},
		propertySchemas: function (key) {
			var schemas = [];
			var subSchema = this.data.property("properties").property(key);
			if (subSchema.defined()) {
				schemas.push(subSchema.asSchema().getFull());
			}
			this.data.property("patternProperties").properties(function (patternKey, subData) {
				var regEx = new RegExp(patternKey);
				if (regEx.test(key)) {
					schemas.push(subData.asSchema().getFull());
				}
			});
			if (schemas.length == 0) {
				subSchema = this.data.property("additionalProperties");
				if (subSchema.defined()) {
					schemas.push(subSchema.asSchema().getFull());
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
						return [dependency.asSchema()];
					}
				}
			}
			return [];
		},
		itemSchemas: function (i) {
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
				var result = subSchema.asSchema().getFull();
				return new SchemaList([result]);
			}
			return new SchemaList();
		},
		tupleTyping: function () {
			var items = this.data.property("items");
			if (items.basicType() == "array") {
				return items.length();
			}
			return 0;
		},
		uniqueItems: function () {
			return !!this.data.propertyValue('uniqueItems');
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
			return new SchemaList(result).getFull();
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
			return new SchemaList(result).getFull();
		},
		types: function () {
			var typeData = this.data.property("type");
			if (typeData.defined()) {
				if (typeData.basicType() === "string") {
					if (typeData.value() == "all" || typeData.value() == "any") {
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
			if (typeData.defined()) {
				for (var i = 0; i < typeData.length(); i++) {
					if (typeData.item(i).basicType() != "string") {
						var orGroup = [];
						typeData.items(function (index, subData) {
							if (subData.basicType() == "string") {
								orGroup.push(getTypeSchema(subData.value()));
							} else {
								orGroup.push(subData.asSchema());
							}
						});
						result.push(orGroup);
						break;
					}
				}
			}
			if (this.data.property("anyOf").defined()) {
				var orGroup = [];
				this.data.property("anyOf").items(function (index, subData) {
					orGroup.push(subData.asSchema());
				});
				result.push(orGroup);
			}
			return result;
		},
		equals: function (otherSchema, resolveRef) {
			var thisSchema = this;
			if (resolveRef) {
				otherSchema = otherSchema.getFull();
				thisSchema = this.getFull();
			}
			if (thisSchema === otherSchema) {
				return true;
			}
			var thisRefUrl = thisSchema.referenceUrl();
			var otherRefUrl = otherSchema.referenceUrl();
			if (resolveRef && !thisSchema.isFull()) {
				thisRefUrl = thisSchema.data.resolveUrl(this.data.propertyValue("$ref"));
			}
			if (resolveRef && !otherSchema.isFull()) {
				otherRefUrl = otherSchema.data.resolveUrl(otherSchema.data.propertyValue("$ref"));
			}
			if (thisRefUrl !== undefined && otherRefUrl !== undefined) {
				return Utils.urlsEqual(thisRefUrl, otherRefUrl);
			}
			return this.data.equals(otherSchema.data);
		},
		readOnly: function () {
			return !!(this.data.propertyValue("readOnly") || this.data.propertyValue("readonly"));
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
			var maxItems = this.data.propertyValue("maxItems");
			// If tuple typing is enabled, then "additionalItems" provides a length constraint
			if (this.tupleTyping() && this.data.propertyValue("additionalItems") === false) {
				if (!(this.tupleTypingLength() >= maxItems)) {
					maxItems = this.tupleTypingLength();
				}
			}
			return maxItems;
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
		pattern: function () {
			var patternString = this.data.propertyValue("pattern");
			if (patternString !== undefined) {
				return new RegExp(patternString);
			}
			return null;
		},
		patternString: function () {
			return this.data.propertyValue("pattern");
		},
		numberInterval: function() {
			var result = this.data.propertyValue("multipleOf");
			if (result == undefined) {
				result = this.data.propertyValue("divisibleBy");
			}
			return result;
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
		definedProperties: function(ignoreList) {
			if (ignoreList) {
				this.definedProperties(); // created cached function
				return this.definedProperties(ignoreList);
			}
			var keys = this.data.property("properties").keys();
			this.definedProperties = function (ignoreList) {
				ignoreList = ignoreList || [];
				var result = [];
				for (var i = 0; i < keys.length; i++) {
					if (ignoreList.indexOf(keys[i]) == -1) {
						result.push(keys[i]);
					}
				}
				return result;
			};
			return keys.slice(0);
		},
		knownProperties: function(ignoreList) {
			if (ignoreList) {
				this.knownProperties(); // created cached function
				return this.knownProperties(ignoreList);
			}
			var result = {};
			this.data.property("properties").properties(function (key, subData) {
				result[key] = true;
			});
			var required = this.requiredProperties();
			for (var i = 0; i < required.length; i++) {
				result[required[i]] = true;
			}
			var keys = Object.keys(result);
			this.knownProperties = function (ignoreList) {
				ignoreList = ignoreList || [];
				var result = [];
				for (var i = 0; i < keys.length; i++) {
					if (ignoreList.indexOf(keys[i]) == -1) {
						result.push(keys[i]);
					}
				}
				return result;
			};
			return keys.slice(0);
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
		isAdditionalProperty: function (key) {
			if (this.data.property("properties").property(key).defined()) {
				return false;
			}
			var patterns = this.data.property("patternProperties").keys();
			for (var i = 0; i < patterns.length; i++) {
				var regEx = new RegExp(patterns[i]);
				if (regEx.test(key)) {
					return false;
				}
			}
			return true;
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
		},
		unordered: function () {
			return !this.tupleTyping() && this.data.propertyValue('unordered');
		},
		createValue: function () {
			var list = this.asList();
			return list.createValue.apply(list, arguments);
		},
		createData: function () {
			var list = this.asList();
			return list.createData.apply(list, arguments);
		}
	};
	Schema.prototype.basicTypes = Schema.prototype.types;
	Schema.prototype.extendSchemas = Schema.prototype.andSchemas;
	Schema.prototype.indexSchemas = Schema.prototype.itemSchemas;
	Schema.prototype.isComplete = Schema.prototype.isFull;
	
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
		if (template == "{@}") {
			return "{+%73elf}";
		}
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
		canApplyTo: function (candidateData) {
			var i, key, subData = null, basicType;
			for (i = 0; i < this.dataParts.length; i++) {
				key = this.dataParts[i];
				if (key === null) {
					subData = candidateData;
				} else if (candidateData.basicType() == "object") {
					subData = candidateData.property(key);
				} else if (candidateData.basicType() == "array" && isIndex(key)) {
					subData = candidateData.index(key);
				}
				if (subData == undefined || !subData.defined()) {
					return false;
				}
				if (subData.basicType() == "null") {
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
			rawLink.rel = rawLink.rel.toLowerCase();
			rawLink.title = rawLink.title;
			return new ActiveLink(rawLink, this, publicData);
		},
		usesKey: function (key) {
			var i;
			for (i = 0; i < this.dataParts.length; i++) {
				if (this.dataParts[i] === key || this.dataParts[i] === null) {
					return true;
				}
			}
			return false;
		},
		rel: function () {
			return this.data.propertyValue("rel").toLowerCase();
		}
	};
	
	var defaultLinkHandlers = [];
	var defaultLinkPreHandlers = [];
	publicApi.addLinkHandler = function(handler) {
		defaultLinkHandlers.unshift(handler);
	};
	publicApi.removeLinkHandler = function (handler) {
		var index = defaultLinkHandlers.indexOf(handler);
		if (index !== -1) {
			defaultLinkHandlers.splice(index, 1);
		} else {
			Utils.log(Utils.logLevel.WARNING, "Attempted to remove link handler that wasn't registered");
		}
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
		this.title = rawLink.title;
		if (rawLink.method != undefined) {
			this.method = rawLink.method;
		} else if (rawLink.rel == "edit") {
			this.method = "PUT"
		} else if (rawLink.rel == "create") {
			this.method = "POST"
		} else if (rawLink.rel == "delete") {
			this.method = "DELETE"
		} else {
			this.method = "GET";
		}
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
	ActiveLink.prototype = {
		toString: function() {
			return this.href;
		},
		createSubmissionData: function(origData, callback) {
			if (typeof origData === 'function') {
				callback = origData;
				origData = undefined;
			}
			var hrefBase = this.hrefBase;
			var submissionSchemas = this.submissionSchemas.getFull();
			if (callback && !origData && submissionSchemas.length == 0 && this.method == "PUT") {
				var readOnlySchema = Jsonary.createSchema({readOnly: true});
				var resultData = Jsonary.create('...').addSchema(readOnlySchema, 'tmp');
				Jsonary.getData(this.href, function (data) {
					resultData.removeSchema('tmp');
					resultData.set(data.get());
					resultData.addSchema(data.schemas().fixed());
					if (typeof callback === 'function') {
						callback(resultData);
					}
				});
				return resultData;
			}
			var baseUri = (publicApi.isData(origData) && origData.resolveUrl('')) || hrefBase;
			return submissionSchemas.createData(origData, baseUri, callback);
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
				if (typeof handler !== 'function') {
					if (handler) {
						continue;
					} else {
						break;
					}
				}
				if (handler.call(this, this, submissionData, request) === false) {
					break;
				}
			}
			return request;
		},
		valueForUrl: function (url) {
			var template = this.definition.uriTemplate;
		
			var extractedValues = template.fromUri(url);
			var result = {};
			function decodeStringValue(stringValue, schemas) {
				schemas = schemas.getFull();
				var types = schemas.types();
				if (types.indexOf('null') != -1 && stringValue == 'null') {
					return null;
				} else if (types.indexOf('boolean') != -1 && (stringValue == "true" || stringValue == "false")) {
					return (stringValue == "true");
				} else if (types.indexOf('string') != -1) {
					return stringValue;
				} else if (types.indexOf('number') != -1 && !isNaN(parseFloat(stringValue))) {
					return parseFloat(stringValue);
				} else if (types.indexOf('integer') != -1 && parseFloat(stringValue)%1 == 0) {
					return parseFloat(stringValue);
				} else if (types.indexOf('object')) {
					return Jsonary.decodeData(stringValue);
				}
				return undefined;
			}
			var schemas = this.subjectData.schemas();
			for (var varName in extractedValues) {
				var value = extractedValues[varName];
				var decodedVarName = translateUriTemplateName(varName);
				if (decodedVarName == null) {
					if (typeof value == "string") {
						value = decodeStringValue(value, schemas);
					}
					if (value === undefined) {
						return undefined;
					}
					result = value;
				} else {
					if (typeof value == "string") {
						value = decodeStringValue(value, schemas.propertySchemas(decodedVarName));
					}
					if (value === undefined) {
						return undefined;
					}
					result[decodedVarName] = value;
				}
			}
			return result;
		}
	};
	
	

/**** schemamatch.js ****/

	function SchemaMatch(monitorKey, data, schema, impatientCallbacks) {
		var thisSchemaMatch = this;
		this.monitorKey = monitorKey;
		this.match = false;
		this.matchFailReason = new SchemaMatchFailReason("initial failure", null);
		this.monitors = new MonitorSet(schema);
		this.impatientCallbacks = impatientCallbacks;
		
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
				}, false, true);
				thisSchemaMatch.andMatches.push(subMatch);
			});
		},
		setupNotMatches: function () {
			var thisSchemaMatch = this;
			this.notMatches = [];
			var notSchemas = this.schema.notSchemas();
			for (var i = 0; i < notSchemas.length; i++) {
				(function (index, subSchema) {
					var keyVariant = Utils.getKeyVariant(thisSchemaMatch.monitorKey, "not" + index);
					var subMatch = thisSchemaMatch.data.addSchemaMatchMonitor(keyVariant, subSchema, function () {
						thisSchemaMatch.update();
					}, false, true);
					thisSchemaMatch.notMatches.push(subMatch);
				})(i, notSchemas[i]);
			}
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
							}, false, true);
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
							}, false, true);
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
						}, false, true);
						thisSchemaMatch.dependencies[key].push(subMatch);
					})(i);
				}
			}
		},
		notify: function () {
			this.monitors.notify(this.match, this.matchFailReason);
		},
		setMatch: function (match, failReason) {
			var thisMatch = this;
			var oldMatch = this.match;
			var oldFailReason = this.matchFailReason;
			
			this.match = match;
			if (!match) {
				this.matchFailReason = failReason;
			} else {
				this.matchFailReason = null;
			}
			if (this.impatientCallbacks) {
				return this.notify();
			}
			
			if (this.pendingNotify) {
				return;
			}
			this.pendingNotify = true;
			DelayedCallbacks.add(function () {
				thisMatch.pendingNotify = false;
				if (thisMatch.match && oldMatch) {
					// Still matches - no problem
					return;
				}
				if (!thisMatch.match && !oldMatch && thisMatch.matchFailReason.equals(oldFailReason)) {
					// Still failing for the same reason
					return;
				}
				thisMatch.notify();
			});
		},	subMatchUpdated: function (indexKey, subMatch) {
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
			this.matchAgainstStringConstraints();
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
				if ((value/interval)%1 != 0) { // *slightly* less prone to floating-point errors than a simple modulo, for some reason?
					throw new SchemaMatchFailReason("Number must be multiple of " + interval);
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
		matchAgainstStringConstraints: function () {
			if (this.data.basicType() != "string") {
				return;
			}
			var minLength = this.schema.minLength();
			if (this.data.value().length < minLength) {
				throw new SchemaMatchFailReason("String must be at least " + minLength + " chars");
			}
			var maxLength = this.schema.maxLength();
			if (maxLength != null) {
				if (this.data.value().length > maxLength) {
					throw new SchemaMatchFailReason("String must be at most " + maxLength + " chars");
				}
			}
			var pattern = this.schema.pattern();
			if (pattern && !pattern.test(this.data.value())) {
				throw new SchemaMatchFailReason("String must match pattern: " + this.schema.patternString());
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
			if (this.schema.uniqueItems()) {
				var dataLength = this.data.length();
				for (var index1 = 0; index1 < dataLength; index1++) {
					for (var index2 = index1 + 1; index2 < dataLength; index2++) {
						if (this.data.item(index1).equals(this.data.item(index2))) {
							throw new SchemaMatchFailReason("Items must be unique (items " + index1 + " and " + index2 + ")", this.schema);
						}
					}
				}
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
			var dataKeys = this.data.keys();
			if (this.schema.allowedAdditionalProperties() == false) {
				for (var i = 0; i < dataKeys.length; i++) {
					if (this.schema.isAdditionalProperty(dataKeys[i])) {
						throw new SchemaMatchFailReason("Not allowed additional property: " + JSON.stringify(key), this.schema);
					}
				}
			}
			var maxProperties = this.schema.maxProperties();
			if (maxProperties != null) {
				if (dataKeys.length > maxProperties) {
					throw new SchemaMatchFailReason("Too many properties (> " + maxProperties + ")", this.schema);
				}
			}
			var minProperties = this.schema.minProperties();
			if (dataKeys.length < minProperties) {
				throw new SchemaMatchFailReason("Too few properties (< " + minProperties + ")", this.schema);
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
				thisXorSelector.update();
			}, false, true);
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
				thisOrSelector.update();
			}, false, true);
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
	

/**** schemaset.js ****/

	var schemaChangeListeners = [];
	publicApi.registerSchemaChangeListener = function (listener) {
		schemaChangeListeners.push(listener);
	};
	var schemaChanges = {
	};
	var schemaNotifyPending = false;
	function notifyAllSchemaChanges() {
		schemaNotifyPending = false;
		var dataEntries = [];
		for (var uniqueId in schemaChanges) {
			var data = schemaChanges[uniqueId];
			dataEntries.push({
				data: data,
				pointerPath: data.pointerPath()
			});
		}
		schemaChanges = {};
		dataEntries.sort(function (a, b) {
			return a.pointerPath.length - b.pointerPath.length;
		});
		var dataObjects = [];
		for (var i = 0; i < dataEntries.length; i++) {
			dataObjects[i] = dataEntries[i].data;
		}
		for (var i = 0; i < schemaChangeListeners.length; i++) {
			schemaChangeListeners[i].call(null, dataObjects);
		}
	}
	function notifySchemaChangeListeners(data) {
		schemaChanges[data.uniqueId] = data;
		if (!schemaNotifyPending) {
			schemaNotifyPending = true;
			DelayedCallbacks.add(notifyAllSchemaChanges);
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
	function SchemaList(schemaList, fixedList) {
		if (schemaList == undefined) {
			this.length = 0;
			return;
		}
		if (fixedList == undefined) {
			fixedList = schemaList;
		}
		this.fixed = function () {
			var fixedSchemaList = (fixedList.length < schemaList.length) ? new SchemaList(fixedList) : this;
			this.fixed = function () {
				return fixedSchemaList;
			};
			return fixedSchemaList;
		};
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
		"toString": function () {
			return "[Jsonary Schema List]";
		},
		indexOf: function (schema, resolveRef) {
			var i = this.length - 1;
			while (i >= 0) {
				if (schema.equals(this[i], resolveRef)) {
					return i;
				}
				i--;
			}
			return i;
		},
		containsUrl: function(url) {
			if (url instanceof RegExp) {
				for (var i = 0; i < this.length; i++) {
					var schema = this[i];
					if (url.test(schema.referenceUrl(true))) {
						return true;
					}
				}
			} else {
				if (url.indexOf('#') < 0) {
					url += "#";
				}
				for (var i = 0; i < this.length; i++) {
					var schema = this[i];
					var referenceUrl = schema.referenceUrl(true);
					if (referenceUrl != null && referenceUrl.substring(referenceUrl.length - url.length) == url) {
						return true;
					}
				}
			}
			return false;
		},
		links: function (rel) {
			var result = [];
			var i, schema;
			for (i = 0; i < this.length; i++) {
				var schema = this[i];
				result = result.concat(schema.links());
			}
			this.links = function (rel) {
				var filtered = [];
				for (var i = 0; i < result.length; i++) {
					var link = result[i];
					if (rel == undefined || link.rel == rel) {
						filtered.push(link);
					}
				}
				return filtered;
			};
			return this.links(rel);
		},
		each: function (callback) {
			for (var i = 0; i < this.length; i++) {
				callback.call(this, i, this[i]);
			}
			return this;
		},
		all: function (callback) {
			for (var i = 0; i < this.length; i++) {
				if (!callback(i, this[i])) {
					return false;
				}
			}
			return true;
		},
		any: function (callback) {
			for (var i = 0; i < this.length; i++) {
				if (callback(i, this[i])) {
					return true;
				}
			}
			return false;
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
		title: function () {
			var titles = [];
			for (var i = 0; i < this.length; i++) {
				var title = this[i].title();
				if (title) {
					titles.push(title);
				}
			}
			return titles.join(' - ');
		},
		forceTitle: function () {
			var titles = [];
			for (var i = 0; i < this.length; i++) {
				var title = this[i].forceTitle();
				if (title) {
					titles.push(title);
				}
			}
			return titles.join(' - ');
		},
		definedProperties: function (ignoreList) {
			if (ignoreList) {
				this.definedProperties(); // create cached function
				return this.definedProperties(ignoreList);
			}
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
			var result = Object.keys(definedKeys);
			cacheResult(this, {
				allowedAdditionalProperties: additionalProperties
			});
			this.definedProperties = function (ignoreList) {
				ignoreList = ignoreList || [];
				var newList = [];
				for (var i = 0; i < result.length; i++) {
					if (ignoreList.indexOf(result[i]) == -1) {
						newList.push(result[i]);
					}
				}
				return newList;
			};
			return result.slice(0);
		},
		knownProperties: function (ignoreList) {
			if (ignoreList) {
				this.knownProperties(); // create cached function
				return this.knownProperties(ignoreList);
			}
			var result;
			if (this.allowedAdditionalProperties()) {
				result = this.requiredProperties();
				var definedProperties = this.definedProperties();
				for (var i = 0; i < definedProperties.length; i++) {
					if (result.indexOf(definedProperties[i]) == -1) {
						result.push(definedProperties[i]);
					}
				}
			} else {
				var result = this.definedProperties();
			}
			this.knownProperties = function (ignoreList) {
				ignoreList = ignoreList || [];
				var newList = [];
				for (var i = 0; i < result.length; i++) {
					if (ignoreList.indexOf(result[i]) == -1) {
						newList.push(result[i]);
					}
				}
				return newList;
			};
			return result.slice(0);
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
		types: function () {
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
			return Object.keys(basicTypes);
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
			cacheResult(this, {
				numberInterval: candidate
			});
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
			return this.exclusiveMinimum();
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
			return this.exclusiveMinimum();
		},
		minLength: function () {
			var minLength = 0;
			for (var i = 0; i < this.length; i++) {
				var otherMinLength = this[i].minLength();
				if (otherMinLength > minLength) {
					minLength = otherMinLength;
				}
			}
			cacheResult(this, {
				minLength: minLength
			});
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
			cacheResult(this, {
				maxLength: maxLength
			});
			return maxLength;
		},
		patterns: function () {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				var regex = this[i].pattern();
				if (regex) {
					result.push(regex);
				}
			}
			return result;
		},
		minItems: function () {
			var minItems = 0;
			for (var i = 0; i < this.length; i++) {
				var otherMinItems = this[i].minItems();
				if (otherMinItems > minItems) {
					minItems = otherMinItems;
				}
			}
			cacheResult(this, {
				minItems: minItems
			});
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
			cacheResult(this, {
				maxItems: maxItems
			});
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
		readOnly: function () {
			var readOnly = false;
			for (var i = 0; i < this.length; i++) {
				if (this[i].readOnly()) {
					readOnly = true;
					break;
				}
			}
			this.readOnly = function () {
				return readOnly;
			}
			return readOnly;
		},
		enumDataList: function () {
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
			return enums;
		},
		enumValues: function () {
			var enums = this.enumDataList();
			if (enums) {
				var values = [];
				for (var i = 0; i < enums.length; i++) {
					values[i] = enums[i].value();
				}
				return values;
			}
		},
		allCombinations: function (callback) {
			if (callback && !this.isFull()) {
				this.getFull(function (full) {
					full.allCombinations(callback);
				});
				return [];
			}
			var thisSchemaSet = this;
			// This is a little inefficient
			var xorSchemas = this.xorSchemas();
			for (var i = 0; i < xorSchemas.length; i++) {
				var found = false;
				for (var optionNum = 0; optionNum < xorSchemas[i].length; optionNum++) {
					var option = xorSchemas[i][optionNum];
					if (this.indexOf(option, !!callback) >= 0) {
						found = true;
						break;
					}
				}
				if (!found) {
					var result = [];
					var pending = 1;
					var gotResult = function() {
						pending--;
						if (pending <= 0) {
							callback(result);
						}
					};
					for (var optionNum = 0; optionNum < xorSchemas[i].length; optionNum++) {
						var option = xorSchemas[i][optionNum];
						if (callback) {
							pending++;
							this.concat([option]).allCombinations(function (subCombos) {
								result = result.concat(subCombos);
								gotResult();
							});
						} else {
							var subCombos = this.concat([option]).allCombinations();
							result = result.concat(subCombos);
						}
					}
					if (callback) {
						gotResult();
					}
					return result;
				}
			}
			
			var orSchemas = this.orSchemas();
			var totalCombos = null;
			var orSelectionOptionSets = [];
			var orPending = 1;
			function gotOrResult() {
				orPending--;
				if (orPending <= 0) {
					var totalCombos = [new SchemaList([])];
					for (var optionSetIndex = 0; optionSetIndex < orSelectionOptionSets.length; optionSetIndex++) {
						var optionSet = orSelectionOptionSets[optionSetIndex];
						var newTotalCombos = [];
						for (var optionIndex = 0; optionIndex < optionSet.length; optionIndex++) {
							for (var comboIndex = 0; comboIndex < totalCombos.length; comboIndex++) {
								newTotalCombos.push(totalCombos[comboIndex].concat(optionSet[optionIndex]));
							}
						}
						totalCombos = newTotalCombos;
					}
					for (var i = 0; i < totalCombos.length; i++) {
						totalCombos[i] = thisSchemaSet.concat(totalCombos[i]);
					}
					
					callback(totalCombos);
				}
			};
			for (var i = 0; i < orSchemas.length; i++) {
				(function (i) {
					var remaining = [];
					var found = false;
					for (var optionNum = 0; optionNum < orSchemas[i].length; optionNum++) {
						var option = orSchemas[i][optionNum];
						if (thisSchemaSet.indexOf(option, !!callback) == -1) {
							remaining.push(option);
						} else {
							found = true;
						}
					}
					if (remaining.length > 0) {
						var orSelections = [[]];
						for (var remNum = 0; remNum < remaining.length; remNum++) {
							var newCombos = [];
							for (var combNum = 0; combNum < orSelections.length; combNum++) {
								newCombos.push(orSelections[combNum]);
								newCombos.push(orSelections[combNum].concat([remaining[remNum]]));
							}
							orSelections = newCombos;
						} 
						if (!found) {
							orSelections.shift();
						}
						if (callback) {
							orSelectionOptionSets[i] = [];
							for (var j = 0; j < orSelections.length; j++) {
								var orSelectionSet = new SchemaList(orSelections[j]);
								orPending++;
								orSelectionSet.allCombinations(function (subCombos) {
									orSelectionOptionSets[i] = orSelectionOptionSets[i].concat(subCombos);
									gotOrResult();
								});
							}
						} else {
							orSelectionOptionSets[i] = orSelections;
						}
					}
				})(i);
			}
			
			var totalCombos = [new SchemaList([])];
			for (var optionSetIndex = 0; optionSetIndex < orSelectionOptionSets.length; optionSetIndex++) {
				var optionSet = orSelectionOptionSets[optionSetIndex];
				var newTotalCombos = [];
				for (var optionIndex = 0; optionIndex < optionSet.length; optionIndex++) {
					for (var comboIndex = 0; comboIndex < totalCombos.length; comboIndex++) {
						newTotalCombos.push(totalCombos[comboIndex].concat(optionSet[optionIndex]));
					}
				}
				totalCombos = newTotalCombos;
			}
			for (var i = 0; i < totalCombos.length; i++) {
				totalCombos[i] = this.concat(totalCombos[i]);
			}
			
			if (callback) {
				gotOrResult();
			}
			return totalCombos;
		},
		createValue: function(origValue, callback, ignoreChoices, ignoreDefaults, banCoercion) {
			var thisSchemaSet = this;
			if (typeof origValue === 'function') {
				var tmp = origValue;
				origValue = callback;
				callback = tmp;
			}
			if (publicApi.isData(origValue)) {
				origValue = origValue.value();
			}
			
			if (typeof banCoercion === 'undefined') {
				if (callback) {
					this.createValue(origValue, function (value) {
						if (typeof value === 'undefined') {
							thisSchemaSet.createValue(origValue, callback, ignoreChoices, ignoreDefaults, false);
						} else {
							callback(value);
						}
					}, ignoreChoices, ignoreDefaults, true)
					return;
				}
				var value = this.createValue(origValue, callback, ignoreChoices, ignoreDefaults, true);
				if (typeof value === 'undefined') {
					value = this.createValue(origValue, callback, ignoreChoices, ignoreDefaults, false);
				}
				return value;
			}
			
			if (!ignoreDefaults) {
				var nextOrigValue = function () {
					nextOrigValue = tryDefaults;
					return origValue;
				};
				var defaultPos = 0;
				var tryDefaults = function () {
					while (defaultPos < thisSchemaSet.length) {
						var schema = thisSchemaSet[defaultPos++];
						if (schema.hasDefault()) {
							return schema.defaultValue();
						}
					}
					nextOrigValue = tryCustomValueCreation;
				};
				var customValuePos = 0;
				var tryCustomValueCreation = function () {
					while (customValuePos < customValueCreationFunctions.length) {
						var func = customValueCreationFunctions[customValuePos++];
						return func(thisSchemaSet);
					}
					nextOrigValue = null;
				};
				if (callback) {
					var handleValue = function (value) {
						if (typeof value !== 'undefined') {
							return callback(value);
						}
						while (nextOrigValue) {
							var initialValue = nextOrigValue();
							if (typeof initialValue !== 'undefined') {
								return thisSchemaSet.createValue(initialValue, handleValue, ignoreChoices, true, banCoercion);
							}
						}
						if (!banCoercion) {
							// Ignore supplied value, and try creating from scratch
							thisSchemaSet.createValue(callback, undefined, ignoreChoices, true, banCoercion);
						} else {
							callback(undefined);
						}
					};
					return handleValue(undefined);
				} else {
					while (nextOrigValue) {
						var initialValue = nextOrigValue();
						if (typeof initialValue !== 'undefined') {
							var createdValue = this.createValue(initialValue, undefined, ignoreChoices, true, banCoercion);
							if (typeof createdValue !== 'undefined') {
								return createdValue;
							}
						}
					}
					if (!banCoercion) {
						// Ignore supplied value, and try creating from scratch
						return this.createValue(undefined, undefined, ignoreChoices, true, banCoercion);
					} else {
						return undefined;
					}
				}
			}
	
			if (!ignoreChoices) {
				if (callback != null) {
					this.allCombinations(function (allCombinations) {
						function nextOption(index) {
							if (index >= allCombinations.length) {
								return callback(undefined);
							}
							allCombinations[index].createValue(origValue, function (value) {
								if (typeof value !== 'undefined') {
									callback(value);
								} else {
									nextOption(index + 1);
								}
							}, true, ignoreDefaults, banCoercion);
						}
						nextOption(0);
					});
					return;
				}
				// Synchronous version
				var allCombinations = this.allCombinations();
				for (var i = 0; i < allCombinations.length; i++) {
					var value = allCombinations[i].createValue(origValue, undefined, true, ignoreDefaults, banCoercion);
					if (value !== undefined) {
						return value;
					}
				}
				return;
			}
	
			var basicTypes = this.basicTypes();
			var pending = 1;
			var chosenCandidate = undefined;
			function gotCandidate(candidate) {
				if (candidate !== undefined) {
					var newBasicType = Utils.guessBasicType(candidate);
					if (basicTypes.indexOf(newBasicType) == -1 && (newBasicType != "integer" || basicTypes.indexOf("number") == -1)) {
						candidate = undefined;
					}
				}
				if (candidate !== undefined && chosenCandidate === undefined) {
					chosenCandidate = candidate;
				}
				pending--;
				if (callback && pending <= 0) {
					callback(chosenCandidate);
				}
				if (pending <= 0) {
					return chosenCandidate;
				}
			}
	
			var enumValues = this.enumValues();
			if (enumValues != undefined) {
				for (var i = 0; i < enumValues.length; i++) {
					if (typeof origValue !== 'undefined' && !Utils.recursiveCompare(origValue, enumValues[i])) {
						continue;
					}
					pending++;
					if (gotCandidate(enumValues[i])) {
						return chosenCandidate;
					}
				}
			} else {
				if (typeof origValue !== 'undefined') {
					var basicType = Utils.guessBasicType(origValue);
					if (basicType == 'integer') {
						// pull "number" to front first, so it goes "integer", "number", ...
						var numberIndex = basicTypes.indexOf('number');
						if (numberIndex !== -1) {
							basicTypes.splice(numberIndex, 1);
							basicTypes.unshift('number');
						}
					}
					var index = basicTypes.indexOf(basicType);
					if (index !== -1) {
						basicTypes.splice(index, 1);
						basicTypes.unshift(basicType);
					}
				}
				for (var i = 0; (typeof chosenCandidate === 'undefined') && i < basicTypes.length; i++) {
					pending++;
					var basicType = basicTypes[i];
					if (basicType == "null") {
						if (gotCandidate(null)) {
							return chosenCandidate;
						}
					} else if (basicType == "boolean") {
						var candidate = this.createValueBoolean(origValue, banCoercion);
						if (gotCandidate(candidate)) {
							return true;
						}
					} else if (basicType == "integer" || basicType == "number") {
						var candidate = this.createValueNumber(origValue, banCoercion);
						if (gotCandidate(candidate)) {
							return chosenCandidate;
						}
					} else if (basicType == "string") {
						var candidate = this.createValueString(origValue, banCoercion);
						if (gotCandidate(candidate)) {
							return chosenCandidate;
						}
					} else if (basicType == "array") {
						if (callback) {
							this.createValueArray(origValue, function (candidate) {
								gotCandidate(candidate);
							}, banCoercion);
						} else {
							var candidate = this.createValueArray(origValue, undefined, banCoercion);
							if (gotCandidate(candidate)) {
								return chosenCandidate;
							}
						}
					} else if (basicType == "object") {
						if (callback) {
							var candidate = this.createValueObject(origValue, function (candidate) {
								gotCandidate(candidate);
							}, banCoercion);
						} else {
							var candidate = this.createValueObject(origValue, undefined, banCoercion);
							if (gotCandidate(candidate)) {
								return chosenCandidate;
							}
						}
					}
				}
			}
			return gotCandidate(chosenCandidate);
		},
		createValueBoolean: function (origValue, banCoercion) {
			if (origValue === undefined) {
				return true;
			}
			if (banCoercion && typeof origValue !== 'boolean') {
				return undefined;
			}
			return !!origValue;
		},
		createValueNumber: function (origValue, banCoercion) {
			if (!banCoercion && typeof origValue === 'string') {
				var asNumber = parseFloat(origValue);
				if (!isNaN(asNumber)) {
					origValue = asNumber;
				} else {
					return undefined;
				}
			}
			if (typeof origValue === 'number') {
				if (interval != undefined) {
					if (origValue % interval != 0) {
						origValue = Math.round(origValue/interval)*interval;
					}
				}
				if (minimum == undefined || origValue > minimum || (origValue == minimum && !exclusiveMinimum)) {
					if (maximum == undefined || origValue < maximum || (origValue == maximum && exclusiveMaximum)) {
						return origValue;
					}
				}
			} else if (typeof origValue !== 'undefined') {
				return undefined;
			}
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
		createValueString: function (origValue, banCoercion) {
			var candidates = [""];
			if (typeof origValue !== 'undefined') {
				if (typeof origValue === 'string') {
					candidates.unshift(origValue);
				} else if (banCoercion) {
					return undefined;
				} else if (typeof origValue === 'number') {
					candidates.unshift("" + origValue);
				} else if (typeof origValue === 'boolean') {
					candidates.unshift(origValue ? 'true' : 'false');
				} else {
					return undefined;
				}
			}
			var minLength = this.minLength();
			var maxLength = this.maxLength()
			var patterns = this.patterns();
			if (maxLength != null && minLength > maxLength) {
				return undefined;
			}
			for (var i = 0; i < candidates.length; i++) {
				var candidate = candidates[i];
				if (candidate.length < minLength) {
					var extraChar = '?';
					candidate += (new Array(minLength - candidate.length + 1)).join(extraChar);
				} else if (candidate.length > maxLength) {
					candidate = candidate.substring(0, maxLength);
				}
				for (var j = 0; j < patterns.length; j++) {
					if (!patterns[j].test(candidate)) {
						continue;
					}
				}
				return candidate;
			}
		},
		createValueArray: function (origValue, callback, banCoercion) {
			if (typeof origValue === 'function') {
				var tmp = origValue;
				origValue = callback;
				callback = tmp;
			}
			if (typeof origValue !== 'undefined' && !Array.isArray(origValue)) {
				return undefined;
			}
			var thisSchemaSet = this;
			var candidate = [];
			var minItems = this.minItems();
			var maxItems = this.maxItems();
			if (maxItems != null && minItems > maxItems) {
				return;
			}
			var pending = 1;
			for (var i = 0; candidate && i < minItems; i++) {
				(function (i) {
					pending++;
					var origItemValue = Array.isArray(origValue) ? origValue[i] : undefined;
					if (callback) {
						thisSchemaSet.createValueForIndex(i, origItemValue, function (value) {
							if (typeof value === 'undefined') {
								candidate = undefined;
							} else if (candidate) {
								candidate[i] = value;
							}
							pending--;
							if (pending == 0) {
								callback(candidate);
							}
						}, banCoercion || undefined);
					} else {
						var itemValue = thisSchemaSet.createValueForIndex(i, origItemValue, undefined, banCoercion || undefined);
						if (typeof itemValue === 'undefined') {
							candidate = undefined;
						} else if (candidate) {
							candidate[i] = itemValue;
						}
					}
				})(i);
			}
			if (candidate && Array.isArray(origValue)) {
				if (maxItems != null && origValue.length > maxItems) {
					origValue = origValue.slice(0, maxItems);
				} else {
					maxItems = origValue.length;
				}
				for (var i = minItems; candidate && i <= origValue.length && i < maxItems; i++) {
					(function (i) {
						pending++;
						var origItemValue = Array.isArray(origValue) ? origValue[i] : undefined;
						if (callback) {
							thisSchemaSet.createValueForIndex(i, origItemValue, function (value) {
								if (candidate && typeof value !== 'undefined' && i < maxItems) {
									candidate[i] = value;
								} else if (banCoercion) {
									candidate = undefined;
								} else if (i < maxItems) {
									maxItems = i;
								}
								pending--;
								if (pending == 0) {
									callback(candidate);
								}
							}, banCoercion || undefined);
						} else {
							var itemValue = thisSchemaSet.createValueForIndex(i, origItemValue, undefined, banCoercion || undefined);
							if (candidate && typeof itemValue !== 'undefined') {
								candidate[i] = itemValue;
							} else if (banCoercion) {
								candidate = undefined;
							} else if (i < maxItems) {
								maxItems = i;
							}
						}
					})(i);
				}
			}
			pending--;
			if (callback && pending == 0) {
				callback(candidate);
			}
			return candidate;
		},
		createValueObject: function (origValue, callback, banCoercion) {
			if (typeof origValue === 'function') {
				var tmp = origValue;
				origValue = callback;
				callback = tmp;
			}
			if (typeof origValue !== 'undefined' && (typeof origValue !== 'object' || Array.isArray(origValue))) {
				return undefined;
			}
			var thisSchemaSet = this;
			var candidate = {};
			var pending = 1;
			var requiredProperties = this.requiredProperties();
			for (var i = 0; candidate && i < requiredProperties.length; i++) {
				(function (key) {
					pending++;
					var origPropValue = (typeof origValue == 'object' && !Array.isArray(origValue)) ? origValue[key] : undefined;
					if (callback) {
						thisSchemaSet.createValueForProperty(key, origPropValue, function (value) {
							if (typeof value === 'undefined') {
								candidate = undefined;
							} else if (candidate) {
								candidate[key] = value;
							}
							pending--;
							if (pending == 0) {
								callback(candidate);
							}
						}, banCoercion || undefined);
					} else {
						var propValue = thisSchemaSet.createValueForProperty(key, origPropValue, undefined, banCoercion || undefined);
						if (typeof propValue === 'undefined') {
							candidate = undefined;
						} else if (candidate) {
							candidate[key] = propValue;
						}
					}
				})(requiredProperties[i]);
			}
			if (candidate && typeof origValue === 'object' && !Array.isArray(origValue)) {
				var definedProperties = this.definedProperties();
				for (var i = 0; candidate && i < definedProperties.length; i++) {
					var key = definedProperties[i];
					if (!candidate || typeof candidate[key] !== 'undefined') {
						continue;
					}
					(function (key) {
						var origPropValue = origValue[key];
						if (typeof origPropValue === 'undefined') {
							// Don't need to create key if not in original data
							return;
						}
						pending++;
						if (callback) {
							thisSchemaSet.createValueForProperty(key, origPropValue, function (value) {
								if (candidate && typeof value !== 'undefined') {
									candidate[key] = value;
								} else if (banCoercion) {
									candidate = undefined;
								}
								pending--;
								if (pending == 0) {
									callback(candidate);
								}
							}, banCoercion || undefined);
						} else {
							var propValue = thisSchemaSet.createValueForProperty(key, origPropValue, undefined, banCoercion || undefined);
							if (candidate && typeof propValue !== 'undefined') {
								candidate[key] = propValue;
							} else if (banCoercion) {
								candidate = undefined;
							}
						}
					})(key);
				}
			}
			pending--;
			if (callback && pending == 0) {
				callback(candidate);
			}
			return candidate;
		},
		createValueForIndex: function(index, origValue, callback, banCoercion) {
			if (typeof origValue === 'function') {
				var tmp = origValue;
				origValue = callback;
				callback = tmp;
			}
			if (publicApi.isData(origValue)) {
				origValue = origValue.value();
			}
			var indexSchemas = this.indexSchemas(index);
			return indexSchemas.createValue(origValue, callback, undefined, undefined, banCoercion);
		},
		createValueForProperty: function(key, origValue, callback, banCoercion) {
			if (typeof origValue === 'function') {
				var tmp = origValue;
				origValue = callback;
				callback = tmp;
			}
			if (publicApi.isData(origValue)) {
				origValue = origValue.value();
			}
			var propertySchemas = this.propertySchemas(key);
			return propertySchemas.createValue(origValue, callback, undefined, undefined, banCoercion);
		},
		createData: function (origValue, baseUri, callback) {
			var thisSchemaSet = this;
			if (typeof origValue === 'function') {
				var tmp = origValue;
				origValue = callback;
				callback = tmp;
			} else if (typeof baseUri === 'function' || typeof baseUri === 'boolean') {
				callback = baseUri;
				baseUri = undefined;
			}
			if (publicApi.isData(origValue)) {
				baseUri = baseUri || origValue.resolveUrl('');
				origValue == origValue.value();
			}
			if (callback) {
				var tempKey = Utils.getUniqueKey();
				// Temporarily read-only
				var tempSchema = publicApi.createSchema({readOnly: true});
				var data = publicApi.create('...', baseUri).addSchema(tempSchema, tempKey);
				this.createValue(origValue, function (value) {
					DelayedCallbacks.increment();
					data.removeSchema(tempKey);
					data.setValue(value);
					data.addSchema(thisSchemaSet.fixed());
					DelayedCallbacks.decrement();
					if (typeof callback === 'function') {
						callback(data);
					}
				});
				return data;
			}
			return publicApi.create(this.createValue(origValue), baseUri).addSchema(this.fixed());
		},
		indexSchemas: function(index) {
			var result = new SchemaList();
			for (var i = 0; i < this.length; i++) {
				result = result.concat(this[i].indexSchemas(index));
			}
			return result;
		},
		tupleTyping: function () {
			var result = 0;
			for (var i = 0; i < this.length; i++) {
				result = Math.max(result, this[i].tupleTyping());
			}
			return result;
		},
		uniqueItems: function () {
			var result = false;
			for (var i = 0; i < this.length; i++) {
				result = result || this[i].uniqueItems();
			}
			return result;
		},
		propertySchemas: function(key) {
			var result = new SchemaList();
			for (var i = 0; i < this.length; i++) {
				result = result.concat(this[i].propertySchemas(key));
			}
			return result;
		},
		additionalPropertySchemas: function (key) {
			var result = new SchemaList();
			for (var i = 0; i < this.length; i++) {
				result = result.concat(this[i].additionalPropertySchemas(key));
			}
			return result;
		},
		propertyDependencies: function(key) {
			var result = [];
			var stringDeps = {};
			for (var i = 0; i < this.length; i++) {
				var deps = this[i].propertyDependencies(key);
				for (var j = 0; j < deps.length; j++) {
					if (typeof deps[j] == "string") {
						if (!stringDeps[deps[j]]) {
							stringDeps[deps[j]] = true;
							result.push(deps[j]);
						}
					} else {
						result.push(deps[j]);
					}
				}
			}
			return result;
		},
		isFull: function () {
			for (var i = 0; i < this.length; i++) {
				if (!this[i].isFull()) {
					return false;
				}
				var andSchemas = this[i].andSchemas();
				for (var j = 0; j < andSchemas.length; j++) {
					if (this.indexOf(andSchemas[j], true) == -1) {
						return false;
					}
				}
			}
			return true;
		},
		getFull: function(callback) {
			if (!callback) {
				var result = [];
				var extraSchemas = [];
				for (var i = 0; i < this.length; i++) {
					result[i] = this[i].getFull();
					var extendSchemas = result[i].extendSchemas();
					for (var j = 0; j < extendSchemas.length; j++) {
						extraSchemas.push(extendSchemas[j]);
					}
				}
				return new SchemaList(result.concat(extraSchemas));
			}
			if (this.length == 0) {
				callback.call(this, this);
				return this;
			}
			var pending = 0;
			var result = [];
			var fixedList = this.fixed();
			function addAll(list) {
				pending += list.length;
				for (var i = 0; i < list.length; i++) {
					list[i].getFull(function(schema) {
						for (var i = 0; i < result.length; i++) {
							if (schema.equals(result[i])) {
								pending--;
								if (pending == 0) {
									var fullList = new SchemaList(result, fixedList);
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
							var fullList = new SchemaList(result, fixedList);
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
				var format = this[i].format();
				if (format != null) {
					result.push(format);
				}
			}
			return result;
		},
		containsFormat: function (formatString) {
			return this.formats().indexOf(formatString) !== -1;
		},
		unordered: function () {
			if (this.tupleTyping()) {
				return false;
			}
			for (var i = 0; i < this.length; i++) {
				if (this[i].unordered()) {
					return true;
				}
			}
			return false;
		},
		xorSchemas: function () {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				result = result.concat(this[i].xorSchemas());
			}
			return result;
		},
		orSchemas: function () {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				result = result.concat(this[i].orSchemas());
			}
			return result;
		}
	};
	SchemaList.prototype.basicTypes = SchemaList.prototype.types;
	SchemaList.prototype.potentialLinks = SchemaList.prototype.links;
	
	publicApi.extendSchemaList = function (obj) {
		for (var key in obj) {
			if (SchemaList.prototype[key] == undefined) {
				SchemaList.prototype[key] = obj[key];
			}
		}
	};
	var customValueCreationFunctions = [];
	publicApi.extendCreateValue = function (creationFunction) {
		customValueCreationFunctions.push(creationFunction);
	}
	
	publicApi.createSchemaList = function (schemas) {
		if (!Array.isArray(schemas)) {
			schemas = [schemas];
		}
		return new SchemaList(schemas);
	};
	
	var SCHEMA_SET_FIXED_KEY = Utils.getUniqueKey();
	var SCHEMA_SET_VALIDATION_KEY = Utils.getUniqueKey();
	
	function SchemaSet(dataObj) {
		var thisSchemaSet = this;
		this.dataObj = dataObj;
	
		this.schemas = {};
		this.schemasFixed = {};
		this.links = {};
		this.matches = {};
		this.xorSelectors = {};
		this.orSelectors = {};
		this.dependencySelectors = {};
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
			this.updateDependenciesWithKey(key);
			this.updateMatchesWithKey(key);
		},
		updateFromSelfLink: function () {
			this.cachedLinkList = null;
			var activeSelfLinks = [];
			// Disable all "self" links
			for (var schemaKey in this.links) {
				var linkList = this.links[schemaKey];
				for (i = 0; i < linkList.length; i++) {
					var linkInstance = linkList[i];
					if (linkInstance.rel() == "self") {
						linkInstance.active = false;
					}
				}
			}
			// Recalculate all "self" links, keeping them disabled
			for (var schemaKey in this.links) {
				var linkList = this.links[schemaKey];
				for (i = 0; i < linkList.length; i++) {
					var linkInstance = linkList[i];
					if (linkInstance.rel() == "self") {
						linkInstance.update();
						if (linkInstance.active) {
							activeSelfLinks.push(linkInstance);
							linkInstance.active = false;
							// Reset cache again
							this.cachedLinkList = null;
						}
					}
				}
			}
			// Re-enable all self links that should be active
			for (var i = 0; i < activeSelfLinks.length; i++) {
				activeSelfLinks[i].active = true;
			}
	
			// Update everything except the self links
			for (var schemaKey in this.links) {
				var linkList = this.links[schemaKey];
				for (i = 0; i < linkList.length; i++) {
					var linkInstance = linkList[i];
					if (linkInstance.rel() != "self") {
						linkInstance.update();
					}
				}
			}
			this.dataObj.properties(function (key, child) {
				child.addLink(null);
			});
			this.dataObj.items(function (index, child) {
				child.addLink(null);
			});
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
				var updatedSelfLink = null;
				for (i = 0; i < linksToUpdate.length; i++) {
					linkInstance = linksToUpdate[i];
					var oldHref = linkInstance.active ? linkInstance.rawLink.rawLink.href : null;
					linkInstance.update();
					var newHref = linkInstance.active ? linkInstance.rawLink.rawLink.href : null;
					if (newHref != oldHref && linkInstance.rel() == "self") {
						updatedSelfLink = linkInstance;
						break;
					}
				}
				if (updatedSelfLink != null) {
					this.updateFromSelfLink(updatedSelfLink);
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
				if (matchList != undefined) {
					for (var i = 0; i < matchList.length; i++) {
						matchList[i].dataUpdated(key);
					}
				}
			}
		},
		updateDependenciesWithKey: function (key) {
			// TODO: maintain a list of sorted keys, instead of sorting them each time
			var schemaKeys = [];		
			for (schemaKey in this.dependencySelectors) {
				schemaKeys.push(schemaKey);
			}
			schemaKeys.sort();
			schemaKeys.reverse();
			for (var j = 0; j < schemaKeys.length; j++) {
				var dependencyList = this.dependencySelectors[schemaKeys[j]];
				for (var i = 0; i < dependencyList.length; i++) {
					dependencyList[i].dataUpdated(key);
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
		addSchema: function (schema, schemaKey, schemaKeyHistory, fixed) {
			var thisSchemaSet = this;
			if (schemaKey == undefined) {
				schemaKey = Utils.getUniqueKey();
				counter = 0;
			}
			if (fixed == undefined) {
				fixed = true;
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
				DelayedCallbacks.increment();
				if (fixed && thisSchemaSet.validation) {
					thisSchemaSet.validation.addSchema(schema, schemaKey);
				}
	
				thisSchemaSet.schemas[schemaKey].push(schema);
				thisSchemaSet.schemasFixed[schemaKey] = thisSchemaSet.schemasFixed[schemaKey] || fixed;
	
				// TODO: this actually forces us to walk the entire data tree, as far as it is defined by the schemas
				//       Do we really want to do this?  I mean, it's necessary if we ever want to catch the "self" links, but if not then it's not that helpful.
				thisSchemaSet.dataObj.properties(function (key, child) {
					var subSchemaKey = Utils.getKeyVariant(schemaKey, "prop");
					var subSchemas = schema.propertySchemas(key);
					for (var i = 0; i < subSchemas.length; i++) {
						child.addSchema(subSchemas[i], subSchemaKey, schemaKeyHistory);
					}
				});
				thisSchemaSet.dataObj.indices(function (i, child) {
					var subSchemaKey = Utils.getKeyVariant(schemaKey, "idx");
					var subSchemas = schema.indexSchemas(i);
					for (var i = 0; i < subSchemas.length; i++) {
						child.addSchema(subSchemas[i], schemaKey, schemaKeyHistory);
					}
				});
	
				var ext = schema.extendSchemas();
				for (var i = 0; i < ext.length; i++) {
					thisSchemaSet.addSchema(ext[i], schemaKey, schemaKeyHistory, fixed);
				}
	
				thisSchemaSet.addLinks(schema.links(), schemaKey, schemaKeyHistory);
				thisSchemaSet.addXorSelectors(schema, schemaKey, schemaKeyHistory);
				thisSchemaSet.addOrSelectors(schema, schemaKey, schemaKeyHistory);
				thisSchemaSet.addDependencySelector(schema, schemaKey, schemaKeyHistory);
	
				thisSchemaSet.schemaFlux--;
				thisSchemaSet.invalidateSchemaState();
				DelayedCallbacks.decrement();
			});
		},
		addLinks: function (potentialLinks, schemaKey, schemaKeyHistory) {
			var i, linkInstance;
			if (this.links[schemaKey] == undefined) {
				this.links[schemaKey] = [];
			}
			var selfLink = null;
			for (i = 0; i < potentialLinks.length; i++) {
				linkInstance = new LinkInstance(this.dataObj, potentialLinks[i]);
				this.links[schemaKey].push(linkInstance);
				this.addMonitorForLink(linkInstance, schemaKey, schemaKeyHistory);
				linkInstance.update();
				if (linkInstance.active && linkInstance.rawLink.rawLink.rel == "self") {
					selfLink = linkInstance;
				}
			}
			if (selfLink != null) {
				this.updateFromSelfLink(selfLink);
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
		addDependencySelector: function (schema, schemaKey, schemaKeyHistory) {
			var selector = new DependencyApplier(schema, Utils.getKeyVariant(schemaKey, "dep"), schemaKeyHistory, this);
			var selectors = [selector];
			if (this.dependencySelectors[schemaKey] == undefined) {
				this.dependencySelectors[schemaKey] = selectors;
			} else {
				this.dependencySelectors[schemaKey] = this.dependencySelectors[schemaKey].concat(selectors);
			}
		},
		addLink: function (rawLink) {
			if (rawLink == null) {
				this.updateFromSelfLink();
				this.invalidateSchemaState();
				return;
			}
			if (rawLink.rel == "invalidate" || rawLink.rel == "invalidates") {
				var invalidateUrl = this.dataObj.resolveUrl(rawLink.href);
				publicApi.invalidate(invalidateUrl);
				return;
			}
			var schemaKey = SCHEMA_SET_FIXED_KEY;
			var linkData = publicApi.create(rawLink);
			var potentialLink = new PotentialLink(linkData);
			this.addLinks([potentialLink], schemaKey);
		},
		addMonitorForLink: function (linkInstance, schemaKey, schemaKeyHistory) {
			var thisSchemaSet = this;
			var rel = linkInstance.rel();
			if (rel === "describedby") {
				var appliedUrl = null;
				var subSchemaKey = Utils.getKeyVariant(schemaKey);
				linkInstance.addMonitor(subSchemaKey, function (active) {
					var rawLink = linkInstance.rawLink;
					var newUrl = active ? rawLink.href : null;
					if (appliedUrl !== newUrl) {
						appliedUrl = newUrl;
						thisSchemaSet.removeSchema(subSchemaKey);
						if (active) {
							var schema = publicApi.createSchema({
								"$ref": appliedUrl
							});
							thisSchemaSet.addSchema(schema, subSchemaKey, schemaKeyHistory, schemaKey == SCHEMA_SET_FIXED_KEY);
						}
					}
				});
			}
		},
		addSchemaMatchMonitor: function (monitorKey, schema, monitor, executeImmediately, impatientCallbacks) {
			var schemaMatch = new SchemaMatch(monitorKey, this.dataObj, schema, impatientCallbacks);
			if (this.matches[monitorKey] == undefined) {
				this.matches[monitorKey] = [];
			}
			this.matches[monitorKey].push(schemaMatch);
			schemaMatch.addMonitor(monitor, executeImmediately);
			return schemaMatch;
		},
		validate: function () {
			this.validation = new SchemaSetValidation(this);
			// Add existing schemas
			for (var schemaKey in this.schemas) {
				if (this.schemasFixed[schemaKey]) {
					for (var i = 0; i < this.schemas[schemaKey].length; i++) {
						this.validation.addSchema(this.schemas[schemaKey][i], schemaKey);
					}
				}
			}
			
			var result = this.validation.publicVersion;
			cacheResult(this, {validate: result});
			return result;
		},
		removeSchema: function (schemaKey) {
			if (this.validation) {
				this.validation.removeSchema(schemaKey);
			}
			//Utils.log(Utils.logLevel.DEBUG, "Actually removing schema:" + schemaKey);
			DelayedCallbacks.increment();
	
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
				delete this.xorSelectors[key];
				delete this.orSelectors[key];
				delete this.dependencySelectors[key];
			}
	
			if (keysToRemove.length > 0) {
				this.invalidateSchemaState();
			}
			DelayedCallbacks.decrement();
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
			var fixedSchemas = {};
	
			var i, j, key, schemaList, schema, alreadyExists;
			for (key in this.schemas) {
				schemaList = this.schemas[key];
				var fixed = this.schemasFixed[key];
				for (i = 0; i < schemaList.length; i++) {
					schema = schemaList[i];
					if (fixed) {
						fixedSchemas[schema.data.uniqueId] = schema;
					}
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
			var schemaFixedResult = [];
			for (var key in fixedSchemas) {
				schemaFixedResult.push(fixedSchemas[key]);
			}
			this.cachedSchemaList = new SchemaList(schemaResult, schemaFixedResult);
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
			if (!thisSchemaSet.schemasStable) {
				thisSchemaSet.schemasStable = true;
				// This function uses DelayedCallbacks itself, so don't need to use it twice
				notifySchemaChangeListeners(thisSchemaSet.dataObj);
			}
			DelayedCallbacks.add(function () {
				thisSchemaSet.schemasStableListeners.notify(thisSchemaSet.dataObj, thisSchemaSet.getSchemas());
			});
			return true;
		},
		addSchemasForProperty: function (key, subData) {
			for (var schemaKey in this.schemas) {
				var subSchemaKey = Utils.getKeyVariant(schemaKey, "prop");
				for (var i = 0; i < this.schemas[schemaKey].length; i++) {
					var schema = this.schemas[schemaKey][i];
					var subSchemas = schema.propertySchemas(key);
					for (var j = 0; j < subSchemas.length; j++) {
						subData.addSchema(subSchemas[j], subSchemaKey);
					}
				}
			}
		},
		addSchemasForIndex: function (index, subData) {
			for (var schemaKey in this.schemas) {
				var subSchemaKey = Utils.getKeyVariant(schemaKey, "idx");
				for (var i = 0; i < this.schemas[schemaKey].length; i++) {
					var schema = this.schemas[schemaKey][i];
					var subSchemas = schema.indexSchemas(index);
					for (var j = 0; j < subSchemas.length; j++) {
						subData.addSchema(subSchemas[j], subSchemaKey);
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
			var active = this.potentialLink.canApplyTo(this.dataObj);
			if (active) {
				this.rawLink = this.potentialLink.linkForData(this.dataObj);
				if (this.potentialLink.rel() == "self") {
					this.dataObj.document.addSelfLink(this);
				}
			} else if (this.rawLink) {
				if (this.potentialLink.rel() == "self") {
					this.dataObj.document.removeSelfLink(this);
				}
				this.rawLink = null;
			}
			this.active = active;
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
				schemaSet.addSchema(selectedOption, inferredSchemaKey, schemaKeyHistory, false);
			} else if (options.length > 0) {
				schemaSet.addSchema(options[0], inferredSchemaKey, schemaKeyHistory, false);
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
					schemaSet.addSchema(options[i], inferredSchemaKeys[i], schemaKeyHistory, false);
				} else if (!found && optionsApplied[i]) {
					schemaSet.removeSchema(inferredSchemaKeys[i]);
				}
				optionsApplied[i] = found;
			}
			if (selectedOptions.length == 0 && options.length > 0) {
				optionsApplied[0] = true;
				schemaSet.addSchema(options[0], inferredSchemaKeys[0], schemaKeyHistory, false);
			}
		});
	}
	
	function DependencyApplier(schema, schemaKey, schemaKeyHistory, schemaSet) {
		this.inferredSchemaKeys = {};
		this.applied = {};
		this.schema = schema;
		this.schemaKeyHistory = schemaKeyHistory;
		this.schemaSet = schemaSet;
	
		var keys = this.schema.data.property("dependencies").keys();
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			this.inferredSchemaKeys[key] = Utils.getKeyVariant(schemaKey, "$" + i);
			this.dataUpdated(key);
		}
		return;
	}
	DependencyApplier.prototype = {
		dataUpdated: function (key) {
			if (key == null) {
				var keys = this.schema.data.property("dependencies").keys();
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					this.dataUpdated(key);
				}
				return;
			}
			if (this.schemaSet.dataObj.property(key).defined()) {
				var depList = this.schema.propertyDependencies(key);
				for (var i = 0; i < depList.length; i++) {
					var dep = depList[i];
					if (typeof dep != "string") {
						this.schemaSet.addSchema(dep, this.inferredSchemaKeys[key], this.schemaKeyHistory, false);
					}
				}
			} else {
				this.schemaSet.removeSchema(this.inferredSchemaKeys[key]);
			}
		}
	};
	
	function SchemaSetValidationPublic(validation, dataObj) {
		var thisValidationPublic = this;
		this.errors = [];
		this.valid = true;
		var updateMonitors = new MonitorSet(dataObj);
		this.onChange = function (onChangeCallback, executeImmediately) {
			var key = Utils.getKeyVariant(SCHEMA_SET_VALIDATION_KEY);
			updateMonitors.add(key, onChangeCallback);
			if (executeImmediately !== false) {
				onChangeCallback.call(dataObj, this);
			}
		};
		validation.updateMonitors.add(SCHEMA_SET_VALIDATION_KEY, function () {
			thisValidationPublic.errors = [];
			for (var key in validation.matchErrors) {
				thisValidationPublic.errors = thisValidationPublic.errors.concat(validation.matchErrors[key]);
			}
			thisValidationPublic.valid = (thisValidationPublic.errors.length === 0);
			updateMonitors.notify(thisValidationPublic);
		});
	};
	SchemaSetValidationPublic.prototype = {
	};
	
	function SchemaSetValidation(schemaSet) {
		this.schemaSet = schemaSet;
		this.matchErrors = {};
		this.updateMonitors = new MonitorSet(this);
		this.publicVersion = new SchemaSetValidationPublic(this, schemaSet.dataObj);
	}
	SchemaSetValidation.prototype = {
		addSchema: function (schema, schemaKey) {
			var thisValidation = this;
			var monitorKey = Utils.getKeyVariant(SCHEMA_SET_VALIDATION_KEY + '.' + schemaKey);
			this.matchErrors[monitorKey] = [];
			var match = this.schemaSet.addSchemaMatchMonitor(monitorKey, schema, function () {
				thisValidation.updateMatch(match, monitorKey);
			}, false);
			this.updateMatch(match, monitorKey);
		},
		removeSchema: function (schemaKey) {
			var monitorKey = SCHEMA_SET_VALIDATION_KEY + '.' + schemaKey;
			delete this.matchErrors[monitorKey];
		},
		updateMatch: function (match, monitorKey) {
			this.matchErrors[monitorKey] = [];
			if (!match.match) {
				this.matchErrors[monitorKey].push(match.matchFailReason);
			}
			this.updateMonitors.notify(match, monitorKey);
		}
	};

/**** main.js ****/

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
	
	publicApi.config = {
		antiCacheUrls: false,
		accessImmediately: false,
		debug: false
	}

/**** _footer.js ****/

	publicApi.UriTemplate = UriTemplate;
	
	// Puts it in "exports" if it exists, otherwise create this.Jsonary (this == window, probably)
	})(this.Jsonary = {});
	

/**** jsonary.render.js ****/

	(function (global) {
		var Jsonary = global.Jsonary;
		
		Jsonary.config.checkTagParity = ['div', 'span'];
	
		function copyValue(value) {
			return (typeof value == "object") ? JSON.parse(JSON.stringify(value)) : value;
		}
		var randomChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		function randomId(length) {
			length = length || 10;
			var result = "";
			while (result.length < length) {
				result += randomChars.charAt(Math.floor(Math.random()*randomChars.length));
			}
			return result;
		}
	
		function htmlEscapeSingleQuote (str) {
			return str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&#39;");
		}
	
		var fixScrollActive = false;
		function fixScroll(execFunction) {
			if (fixScrollActive) return execFunction();
			fixScrollActive = true;
			var doc = document.documentElement, body = document.body;
			var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
			var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
			execFunction();
			setTimeout(function () {
				if (left || top) {
					window.scrollTo(left, top);
				}
				fixScrollActive = false;
			}, 10);
		}
	
		var prefixPrefix = "Jsonary";
		var prefixCounter = 0;
	
		var componentNames = {
			ADD_REMOVE: "ADD_REMOVE",
			TYPE_SELECTOR: "TYPE_SELECTOR",
			RENDERER: "DATA_RENDERER",
			add: function (newName, beforeName) {
				if (this[newName] != undefined) {
					if (beforeName !== undefined) {
						if (componentList.indexOf(newName) != -1) {
							componentList.splice(componentList.indexOf(newName), 1);
						}
					} else {
						return;
					}
				}
				this[newName] = newName;
				if (beforeName === false) {
					return;
				} else if (typeof beforeName == 'number') {
					var index = Math.max(0, Math.min(componentList.length - 1, Math.round(beforeName)));
					componentList.splice(index, 0, this[newName]);
				} else if (componentList.indexOf(beforeName) != -1) {
					componentList.splice(componentList.indexOf(beforeName), 0, this[newName]);
				} else if (componentList.indexOf(componentNames[beforeName]) != -1) {
					componentList.splice(componentList.indexOf(componentNames[beforeName]), 0, this[newName]);
				} else {
					componentList.splice(componentList.length - 1, 0, this[newName]);
				}
				return newName;
			}
		};
		var componentList = [componentNames.ADD_REMOVE, componentNames.TYPE_SELECTOR, componentNames.RENDERER];
		
		function TempStore() {
			var obj = {};
			this.get = function (key) {
				return obj[key];
			};
			this.set = function (key, value) {
				return obj[key] = value;
			};
		};
		
		var contextIdCounter = 0;
		function RenderContext(elementIdPrefix) {
			this.uniqueId = contextIdCounter++;
			var thisContext = this;
			this.elementLookup = {};
	
			if (elementIdPrefix == undefined) {
				elementIdPrefix = prefixPrefix + "." + (prefixCounter++) + randomId(4) + ".";
			}
			var elementIdCounter = 0;
			this.getElementId = function () {
				return elementIdPrefix + (elementIdCounter++);
			};
	
			var renderDepth = 0;
			this.enhancementContexts = {};
			this.enhancementActions = {};
			this.enhancementInputs = {};
	
			if (typeof document != 'undefined') {
				Jsonary.registerChangeListener(function (patch, document) {
					patch.each(function (index, operation) {
						var dataObjects = document.affectedData(operation);
						for (var i = 0; i < dataObjects.length; i++) {
							thisContext.update(dataObjects[i], operation);
						}
					});
				});
				Jsonary.registerSchemaChangeListener(function (dataObjects) {
					var elementIdLookup = {};
					for (var i = 0; i < dataObjects.length; i++) {
						var data = dataObjects[i];
						var uniqueId = data.uniqueId;
						var elementIds = thisContext.elementLookup[uniqueId];
						if (elementIds) {
							elementIdLookup[uniqueId] = elementIds.slice(0);
						} else {
							elementIdLookup[uniqueId] = [];
						}
					}
					for (var j = 0; j < dataObjects.length; j++) {
						var data = dataObjects[j];
						var uniqueId = data.uniqueId;
						var elementIds = elementIdLookup[uniqueId];
						for (var i = 0; i < elementIds.length; i++) {
							var element = render.getElementById(elementIds[i]);
							if (element == undefined) {
								continue;
							}
							var prevContext = element.jsonaryContext;
							var prevUiState = copyValue(this.uiStartingState);
							var renderer = selectRenderer(data, prevUiState, prevContext.missingComponents, prevContext.bannedRenderers);
							fixScroll(function () {
								if (renderer.uniqueId == prevContext.renderer.uniqueId) {
									renderer.render(element, data, prevContext);
								} else {
									prevContext.baseContext.render(element, data, prevContext.label, prevUiState);
								}
							});
						}
					}
				});
			}
			this.rootContext = this;
			this.subContexts = {};
			this.oldSubContexts = {};
			this.missingComponents = componentList;
			this.bannedRenderers = {};
			
			// Temporary data attached to context - not stored, but preserved even across prototype-inheritance
			var temp = new TempStore();
			this.set = temp.set;
			this.get = temp.get;
		}
		RenderContext.prototype = {
			toString: function () {
				return "[Jsonary RenderContext]";
			},
			rootContext: null,
			baseContext: null,
			labelSequence: function () {
				// Top-level is always one level below pageContext
				if (!this.parent || !this.parent.parent || this.parent == pageContext) {
					return [];
				}
				return this.parent.labelSequence().concat([this.label]);
			},
			labelSequenceContext: function (seq) {
				var result = this;
				for (var i = 0; i < seq.length; i++) {
					var label = seq[i];
					result = result.subContexts[label] || result.oldSubContexts[label];
					if (!result) {
						return null;
					}
				}
				return result;
			},
			labelForData: function (data) {
				if (this.data && data.document.isDefinitive) {
					var selfLink = data.getLink('self');
					// Use "self" link for better persistence when data changes
					var dataUrl = selfLink ? selfLink.href : data.referenceUrl();
					if (dataUrl) {
						var baseUrl = this.data.referenceUrl() || this.data.resolveUrl('');
						var truncate = 0;
						while (dataUrl.substring(0, baseUrl.length - truncate) != baseUrl.substring(0, baseUrl.length - truncate)) {
							truncate++;
						}
						var remainder = dataUrl.substring(baseUrl.length - truncate);
						if (truncate) {
							return truncate + "!" + remainder;
						} else {
							return "!" + remainder;
						}
					}
				} else if (this.data && this.data.document == data.document) {
					var basePointer = this.data.pointerPath();
					var dataPointer = data.pointerPath();
					var truncate = 0;
					while (dataPointer.substring(0, basePointer.length - truncate) != basePointer.substring(0, basePointer.length - truncate)) {
						truncate++;
					}
					var remainder = dataPointer.substring(basePointer.length - truncate);
					if (truncate) {
						return truncate + "!" + remainder;
					} else {
						return "!" + remainder;
					}
				}
				if (this.renderer) {
					// This is bad because it makes the UI state less transferable
					Jsonary.log(Jsonary.logLevel.WARNING, "No label supplied for data in renderer " + JSON.stringify(this.renderer.name));
				}
				
				return "$" + data.uniqueId;
			},
			subContext: function (label, uiState) {
	 			if (Jsonary.isData(label)) {
					label = this.labelForData(label);
				}
				uiState = uiState || {};
				var subContext = this.getSubContext(false, this.data, label, uiState);
				subContext.renderer = this.renderer;
				if (!subContext.uiState) {
					subContext.loadState(subContext.uiStartingState);
				}
				return subContext;
			},
			subContextSavedStates: {},
			saveUiState: function (report) {
				var subStates = {};
				for (var key in this.subContexts) {
					subStates[key] = this.subContexts[key].saveUiState();
				}
				for (var key in this.oldSubContexts) {
					subStates[key] = this.oldSubContexts[key].saveUiState();
				}
				
				var saveStateFunction = this.renderer ? this.renderer.saveUiState : Renderer.prototype.saveUiState;
				return saveStateFunction.call(this.renderer, this.uiState, subStates, this.data);
			},
			loadUiState: function (savedState) {
				var loadStateFunction = this.renderer ? this.renderer.loadUiState : Renderer.prototype.loadUiState;
				var result = loadStateFunction.call(this.renderer, savedState);
				this.uiState = result[0];
				this.subContextSavedStates = result[1];
			},
			withSameComponents: function () {
				missingComponents = this.missingComponents.slice(0);
				if (this.renderer != undefined) {
					for (var i = 0; i < this.renderer.filterObj.component.length; i++) {
						var componentIndex = missingComponents.indexOf(this.renderer.filterObj.component[i]);
						if (componentIndex !== -1) {
							missingComponents.splice(componentIndex, 1);
						}
					}
				}
				return this.withComponent(missingComponents);
			},
			withComponent: function (components) {
				if (!Array.isArray(components)) {
					components = [components];
				}
				var actualGetSubContext = this.getSubContext;
	
				var result = Object.create(this);
				result.getSubContext = function () {
					var subContext = actualGetSubContext.apply(this, arguments);
					for (var i = components.length; i >= 0; i--) {
						var index = subContext.missingComponents.indexOf(components[i]);
						if (index !== -1) {
							subContext.missingComponents.splice(index, 1);
						}
						subContext.missingComponents.unshift(components[i]);
					}
					return subContext;
				};
				return result;
			},
			withoutComponent: function (components) {
				if (!Array.isArray(components)) {
					components = [components];
				}
				var actualGetSubContext = this.getSubContext;
	
				var result = Object.create(this);
				result.getSubContext = function () {
					var subContext = actualGetSubContext.apply(this, arguments);
					for (var i = 0; i < components.length; i++) {
						var componentIndex = subContext.missingComponents.indexOf(components[i]);
						if (componentIndex !== -1) {
							subContext.missingComponents.splice(componentIndex, 1);
						}
					}
					return subContext;
				};
				return result;
			},
			getSubContext: function (elementId, data, label, uiStartingState) {
				if (typeof label == "object" && label != null) {
					throw new Error('Label cannot be an object');
				}
				if (label || label === "") {
					var labelKey = label;
				} else {
					var labelKey = this.labelForData(data);
				}
				if (this.oldSubContexts[labelKey] != undefined) {
					this.subContexts[labelKey] = this.oldSubContexts[labelKey];
				}
				if (this.subContexts[labelKey] != undefined) {
					if (data === null || this.subContexts[labelKey].data === null) {
						// null can be used as a placeholder, to get callbacks when rendering requests/urls
						this.subContexts[labelKey].data = data;
					} else if (this.subContexts[labelKey].data != data) {
						delete this.subContexts[labelKey];
						delete this.oldSubContexts[labelKey];
						delete this.subContextSavedStates[labelKey];
					}
				}
				if (this.subContextSavedStates[labelKey]) {
					uiStartingState = this.subContextSavedStates[labelKey];
					delete this.subContextSavedStates[labelKey];
				}
				if (this.subContexts[labelKey] == undefined) {
					var missingComponents, bannedRenderers;
					if (this.data == data) {
						missingComponents = this.missingComponents.slice(0);
						bannedRenderers = Object.create(this.bannedRenderers);
						if (this.renderer != undefined) {
							for (var i = 0; i < this.renderer.filterObj.component.length; i++) {
								var componentIndex = missingComponents.indexOf(this.renderer.filterObj.component[i]);
								if (componentIndex !== -1) {
									missingComponents.splice(componentIndex, 1);
								}
							}
							bannedRenderers[this.renderer.uniqueId] = true;
						}
					} else {
						missingComponents = componentList.slice(0);
						bannedRenderers = {};
					}
					if (typeof elementId == "object") {
						elementId = elementId.id;
					}
					function Context(rootContext, baseContext, label, data, uiState, missingComponents, bannedRenderers) {
						this.uniqueId = contextIdCounter++;
						this.rootContext = rootContext;
						this.baseContext = baseContext;
						this.label = label;
						this.data = data;
						this.uiStartingState = copyValue(uiState || {});
						this.missingComponents = missingComponents;
						this.subContexts = {};
						this.oldSubContexts = {};
						this.bannedRenderers = bannedRenderers;
	
						var temp = new TempStore();
						this.set = temp.set;
						this.get = temp.get;
					}
					Context.prototype = this.rootContext;
					this.subContexts[labelKey] = new Context(this.rootContext, this, labelKey, data, uiStartingState, missingComponents, bannedRenderers);
				}
				var subContext = this.subContexts[labelKey];
				subContext.elementId = elementId;
				subContext.parent = this;
				return subContext;
			},
			clearOldSubContexts: function () {
				this.oldSubContexts = this.subContexts;
				this.subContexts = {};
			},
			rerender: function () {
				if (this.parent && !this.elementId) {
					return this.parent.rerender();
				}
				var element = render.getElementById(this.elementId);
				if (element != null) {
					fixScroll(function () {
						this.renderer.render(element, this.data, this);
						this.clearOldSubContexts();
					}.bind(this));
				}
			},
			asyncRerenderHtml: function (htmlCallback) {
				var thisContext = this;
				if (this.uiState == undefined) {
					this.loadState(this.uiStartingState);
				}
				
				var renderer = this.renderer;
				this.data.whenStable(function (data) {
					renderer.asyncRenderHtml(data, thisContext, function (error, innerHtml) {
						if (!error) {
							thisContext.clearOldSubContexts();
						}
	
						asyncRenderHtml.postTransform(error, innerHtml, thisContext, htmlCallback);
					});
				});
			},
	
			render: function (element, data, label, uiStartingState) {
				if (uiStartingState == undefined && typeof label == "object") {
					uiStartingState = label;
					label = null;
				}
				// If data is a URL, then fetch it and call back
				if (typeof data == "string") {
					data = Jsonary.getData(data);
				}
				if (data.getData != undefined) {
					var thisContext = this;
					element.innerHTML = '<div class="loading"></div>';
					var subContext = this.getSubContext(element.id, null, label, uiStartingState);
					var request = data.getData(function (actualData) {
						thisContext.render(element, actualData, label, uiStartingState);
					});
					return subContext;;
				}
	
				if (typeof uiStartingState != "object") {
					uiStartingState = {};
				}
				if (element.id == undefined || element.id == "") {
					element.id = this.getElementId();
				}
	
				var previousContext = element.jsonaryContext;
				var subContext = this.getSubContext(element.id, data, label, uiStartingState);
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
				var renderer = selectRenderer(data, uiStartingState, subContext.missingComponents, subContext.bannedRenderers);
				if (renderer != undefined) {
					subContext.renderer = renderer;
					if (subContext.uiState == undefined) {
						subContext.loadState(subContext.uiStartingState);
					}
					renderer.render(element, data, subContext);
					subContext.clearOldSubContexts();
				} else {
					element.innerHTML = "NO RENDERER FOUND";
				}
				return subContext;
			},
			renderHtml: function (data, label, uiStartingState) {
				if (uiStartingState == undefined && typeof label == "object") {
					uiStartingState = label;
					label = null;
				}
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
							var element = render.getElementById(elementId);
							if (element) {
								thisContext.render(element, actualData, label, uiStartingState);
							} else {
								Jsonary.log(Jsonary.logLevel.WARNING, "Attempted delayed render to non-existent element: " + elementId);
							}
						}
					});
					if (!rendered) {
						rendered = true;
						return '<span id="' + elementId + '"><div class="loading"></div></span>';
					}
				}
				
				if (uiStartingState === true) {
					uiStartingState = this.uiStartingState;
				}
				if (typeof uiStartingState != "object") {
					uiStartingState = {};
				}
				var subContext = this.getSubContext(elementId, data, label, uiStartingState);
	
				var renderer = selectRenderer(data, uiStartingState, subContext.missingComponents, subContext.bannedRenderers);
				subContext.renderer = renderer;
				if (subContext.uiState == undefined) {
					subContext.loadState(subContext.uiStartingState);
				}
				
				var innerHtml = renderer.renderHtml(data, subContext);
				subContext.clearOldSubContexts();
				var uniqueId = data.uniqueId;
				if (this.elementLookup[uniqueId] == undefined) {
					this.elementLookup[uniqueId] = [];
				}
				if (this.elementLookup[uniqueId].indexOf(elementId) == -1) {
					this.elementLookup[uniqueId].push(elementId);
				}
				this.addEnhancement(elementId, subContext);
				return '<span id="' + elementId + '">' + innerHtml + '</span>';
			},
			asyncRenderHtml: function (data, label, uiStartingState, htmlCallback) {
				var thisContext = this;
				if (uiStartingState == undefined && typeof label == "object") {
					uiStartingState = label;
					label = null;
				}
				var elementId = this.getElementId();
				if (typeof data == "string") {
					data = Jsonary.getData(data);
				}
				if (data.getData != undefined) {
					label = label || 'async' + Math.random();
					var subContext = this.getSubContext(elementId, null, label, uiStartingState);
					data.getData(function (actualData) {
						thisContext.asyncRenderHtml(actualData, label, uiStartingState, htmlCallback);
					});
					return subContext;
				}
				
				if (uiStartingState === true) {
					uiStartingState = this.uiStartingState;
				}
				if (typeof uiStartingState != "object") {
					uiStartingState = {};
				}
				var subContext = this.getSubContext(elementId, data, label, uiStartingState);
	
				var renderer = selectRenderer(data, uiStartingState, subContext.missingComponents, subContext.bannedRenderers);
				subContext.renderer = renderer;
				if (subContext.uiState == undefined) {
					subContext.loadState(subContext.uiStartingState);
				}
				
				data.whenStable(function () {
					renderer.asyncRenderHtml(data, subContext, function (error, innerHtml) {
						subContext.clearOldSubContexts();
						htmlCallback(null, innerHtml, subContext);
					});
				});
				return subContext;
			},
			update: function (data, operation) {
				var uniqueId = data.uniqueId;
				var elementIds = this.elementLookup[uniqueId];
				if (elementIds == undefined || elementIds.length == 0) {
					return;
				}
				var elementIds = elementIds.slice(0);
				for (var i = 0; i < elementIds.length; i++) {
					var element = render.getElementById(elementIds[i]);
					if (element == undefined) {
						continue;
					}
					// If the element doesn't have a context, but update is being called, then it's probably (inadvisedly) trying to change something during its initial render.
					// If so, check the enhancement contexts.
					var prevContext = element.jsonaryContext || this.enhancementContexts[elementIds[i]];
					var prevUiState = copyValue(this.uiStartingState);
					var renderer = selectRenderer(data, prevUiState, prevContext.missingComponents, prevContext.bannedRenderers);
					if (renderer.uniqueId == prevContext.renderer.uniqueId) {
						renderer.update(element, data, prevContext, operation);
					} else {
						fixScroll(function () {
							prevContext.baseContext.render(element, data, prevContext.label, prevUiState);
						});
					}
				}
			},
			actionHtml: function(innerHtml, actionName) {
				var startingIndex = 2;
				var historyChange = false;
				var linkUrl = null;
				if (typeof actionName == "object") {
					historyChange = actionName.historyChange || false;
					linkUrl = actionName.linkUrl || null;
					actionName = actionName.actionName;
				} else if (typeof actionName == "boolean") {
					historyChange = arguments[1];
					linkUrl = arguments[2] || null;
					actionName = arguments[3];
					startingIndex += 2;
				}
				var params = [];
				for (var i = startingIndex; i < arguments.length; i++) {
					params.push(arguments[i]);
				}
				var elementId = this.getElementId();
				this.addEnhancementAction(elementId, actionName, this, params, historyChange);
				var argsObject = {
					context: this,
					linkUrl: linkUrl,
					actionName: actionName,
					params: params,
					historyChange: historyChange
				};
				argsObject.linkUrl = linkUrl || Jsonary.render.actionUrl(argsObject);
				return Jsonary.render.actionHtml(elementId, innerHtml, argsObject);
			},
			inputNameForAction: function (actionName) {
				var historyChange = false;
				var startIndex = 1;
				if (typeof actionName == "boolean") {
					historyChange = actionName;
					actionName = arguments[1];
					startIndex++;
				}
				var params = [];
				for (var i = startIndex; i < arguments.length; i++) {
					params.push(arguments[i]);
				}
				var argsObject = {
					context: this,
					actionName: actionName,
					params: params
				};
				var name = Jsonary.render.actionInputName(argsObject);
				this.enhancementInputs[name] = {
					inputName: name,
					actionName: actionName,
					context: this,
					params: params,
					historyChange: historyChange
				};
				return name;
			},
			addEnhancement: function(elementId, context) {
				this.enhancementContexts[elementId] = context;
			},
			addEnhancementAction: function (elementId, actionName, context, params, historyChange) {
				if (params == null) {
					params = [];
				}
				this.enhancementActions[elementId] = {
					actionName: actionName,
					context: context,
					params: params,
					historyChange: historyChange
				};
			},
			enhanceElement: function (element) {
				var rootElement = element;
				// Perform post-order depth-first walk of tree, calling enhanceElementSingle() on each element
				// Post-order reduces orphaned enhancements by enhancing all children before the parent
				while (element) {
					if (element.firstChild) {
						element = element.firstChild;
						continue;
					}
					while (!element.nextSibling && element != rootElement) {
						if (element.nodeType == 1) {
							this.enhanceElementSingle(element);
						}
						element = element.parentNode;
					}
					if (element.nodeType == 1) {
						this.enhanceElementSingle(element);
					}
					if (element == rootElement) {
						break;
					}
					if (element.parentNode != element.nextSibling.parentNode) {
						// This is IE 7+8's *brilliant* reaction to missing close tags (e.g. <div><span>...</div>)
						// element = element.parentNode;
						throw new Error("DOM mismatch - did you forget a close tag? " + element.innerHTML);
					}
					element = element.nextSibling;
				}
			},
			action: function (actionName) {
				var args = [this];
				for (var i = 0; i < arguments.length; i++) {
					args.push(arguments[i]);
				}
				return this.renderer.action.apply(this.renderer, args);
			},
			actionArgs: function (actionName, args) {
				args = [this, actionName].concat(args || []);
				return this.renderer.action.apply(this.renderer, args);
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
						var redrawElementId = action.context.elementId;
						var actionContext = action.context;
						var args = [action.actionName].concat(action.params);
						if (actionContext.action.apply(actionContext, args)) {
							// Action returned positive - we should force a re-render
							actionContext.rerender();
						}
						notifyActionHandlers(actionContext.data, actionContext, action.actionName, action.historyChange);
						return false;
					};
				}
				var inputAction = this.enhancementInputs[element.name];
				if (inputAction != undefined) {
					delete this.enhancementInputs[element.name];
					element.onchange = function () {
						var value = this.value;
						if (this.getAttribute("type") == "checkbox") {
							value = this.checked;
						}
						if (this.tagName.toLowerCase() == "select" && this.getAttribute("multiple") != null) {
							value = [];
							for (var i = 0; i < this.options.length; i++) {
								var option = this.options[i];
								if (option.selected) {
									value.push(option.value);
								}
							}						
						}
						var redrawElementId = inputAction.context.elementId;
						var inputContext = inputAction.context;
						var args = [inputAction.actionName, value].concat(inputAction.params);
						if (inputContext.action.apply(inputContext, args)) {
							inputContext.rerender();
						}
						notifyActionHandlers(inputContext.data, inputContext, inputAction.actionName, inputAction.historyChange);
					};
				}
				element = null;
			}
		};
		// TODO: this is for compatability - remove it
		RenderContext.prototype.saveState = RenderContext.prototype.saveUiState;
		RenderContext.prototype.loadState = RenderContext.prototype.loadUiState;
		
		var pageContext = new RenderContext();
		
		function cleanup() {
			// Clean-up sweep of pageContext's element lookup
			var keysToRemove = [];
			for (var key in pageContext.elementLookup) {
				var elementIds = pageContext.elementLookup[key];
				var found = false;
				for (var i = 0; i < elementIds.length; i++) {
					var element = render.getElementById(elementIds[i]);
					if (element) {
						found = true;
						break;
					}
				}
				if (!found) {
					keysToRemove.push(key);
				}
			}
			for (var i = 0; i < keysToRemove.length; i++) {
				delete pageContext.elementLookup[keysToRemove[i]];
			}
			for (var key in pageContext.enhancementContexts) {
				if (pageContext.enhancementContexts[key]) {
					var context = pageContext.enhancementContexts[key];
					Jsonary.log(Jsonary.logLevel.WARNING, 'Orphaned context for element: ' + JSON.stringify(key)
						+ '\renderer:' + context.renderer.name
						+ '\ncomponents:' + context.renderer.filterObj.component.join(", ")
						+ '\ndata: ' + context.data.json());
					pageContext.enhancementContexts[key] = null;
				}
			}
			for (var key in pageContext.enhancementActions) {
				if (pageContext.enhancementActions[key]) {
					var context = pageContext.enhancementActions[key].context;
					Jsonary.log(Jsonary.logLevel.WARNING, 'Orphaned action for element: ' + JSON.stringify(key)
						+ '\renderer:' + context.renderer.name
						+ '\ncomponents:' + context.renderer.filterObj.component.join(", ")
						+ '\ndata: ' + context.data.json());
					pageContext.enhancementActions[key] = null;
				}
			}
			for (var key in pageContext.enhancementInputs) {
				if (pageContext.enhancementInputs[key]) {
					var context = pageContext.enhancementInputs[key].context;
					Jsonary.log(Jsonary.logLevel.WARNING, 'Orphaned action for input: ' + JSON.stringify(key)
						+ '\renderer:' + context.renderer.name
						+ '\ncomponents:' + context.renderer.filterObj.component.join(", ")
						+ '\ndata: ' + context.data.json());
					pageContext.enhancementInputs[key] = null;
				}
			}
		}
		if (typeof document != 'undefined') {
			setInterval(cleanup, 30000); // Every 30 seconds
		}
		if (typeof document != 'undefined') {
			Jsonary.cleanup = cleanup;
		}
	
		function render(element, data, uiStartingState, options) {
			options = options || {};
			if (typeof element == 'string') {
				element = render.getElementById(element);
			}
			var innerElement = document.createElement('span');
			innerElement.className = "jsonary";
			element.innerHTML = "";
			element.appendChild(innerElement);
			var context = pageContext;
			if (options.withComponent) {
				context = context.withComponent(options.withComponent);
			}
			if (options.withoutComponent) {
				context = context.withoutComponent(options.withoutComponent);
			}
			context = context.subContext(Math.random());
			pageContext.oldSubContexts = {};
			pageContext.subContexts = {};
			return context.render(innerElement, data, 'render', uiStartingState);
		}
		function renderHtml(data, uiStartingState, options) {
			options = options || {};
			var context = pageContext;
			if (options.withComponent) {
				context = context.withComponent(options.withComponent);
			}
			if (options.withoutComponent) {
				context = context.withoutComponent(options.withoutComponent);
			}
			var innerHtml = context.renderHtml(data, null, uiStartingState);
			pageContext.oldSubContexts = {};
			pageContext.subContexts = {};
			return '<span class="jsonary">' + innerHtml + '</span>';
		}
		function enhanceElement(element) {
			if (typeof element === 'string') {
				var elementId = element;
				element = render.getElementById(elementId);
				if (!element) {
					throw new Error('Element not found: ' + elementId)
				}
			}
			pageContext.enhanceElement(element);
		}
		function renderValue(target, startingValue, schema, updateFunction) {
			if (typeof updateFunction === 'string') {
				var element = document.getElementById(updateFunction) || document.getElementsByName(updateFunction)[0];
				updateFunction = !element || function (newValue) {
					element.value = JSON.stringify(newValue);
				};
			}
			var data = Jsonary.create(startingValue).addSchema(Jsonary.createSchema(schema));
			if (typeof updateFunction === 'function') {
				data.document.registerChangeListener(function () {
					updateFunction(data.value());
				});
			} else if (!updateFunction) {
				data = data.readOnlyCopy();
			}
			return Jsonary.render(target, data);
		};
		function asyncRenderHtml(data, uiStartingState, options, htmlCallback) {
			if (typeof options === 'function') {
				htmlCallback = options;
				options = null;
			}
			options = options || {};
			if (typeof htmlCallback === 'object') {
				options = htmlCallback;
				htmlCallback = arguments[3];
			}
			var context = pageContext;
			if (options.withComponent) {
				context = context.withComponent(options.withComponent);
			}
			if (options.withoutComponent) {
				context = context.withoutComponent(options.withoutComponent);
			}
			return context.asyncRenderHtml(data, null, uiStartingState, function (error, innerHtml, renderContext) {
				asyncRenderHtml.postTransform(error, innerHtml, renderContext, htmlCallback);
			});
		}
		asyncRenderHtml.postTransform = function (error, innerHtml, renderContext, callback) {
			if (!error) {
				innerHtml = '<span class="jsonary">' + innerHtml + '</span>';
			}
			return callback(error, innerHtml, renderContext, callback);
		};
	
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
		render.actionInputName = function (args) {
			var context = args.context;
			return context.getElementId();
		};
		render.actionUrl = function (args) {
			return "javascript:void(0)";
		};
		render.actionHtml = function (elementId, innerHtml, args) {
			return '<a href="' + Jsonary.escapeHtml(args.linkUrl) + '" id="' + elementId + '" class="jsonary-action">' + innerHtml + '</a>';
		};
		render.rendered = function (data) {
			var uniqueId = data.uniqueId;
			if (!pageContext.elementLookup[uniqueId]) {
				return false;
			}
			var elementIds = pageContext.elementLookup[uniqueId];
			for (var i = 0; i < elementIds.length; i++) {
				var elementId = elementIds[i];
				var element = render.getElementById(elementId);
				if (element) {
					return true;
				}
			}
			return false;
		};
		
		/**********/
		
		render.saveData = function (data, saveDataId) {
			if (typeof localStorage == 'undefined') {
				return "LOCALSTORAGE_MISSING";
			}
			var deleteThreshhold = (new Date).getTime() - 1000*60*60*2; // Delete after two hours
			var keys = Object.keys(localStorage);
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				try {
					var storedData = JSON.parse(localStorage[key]);
					if (storedData.accessed < deleteThreshhold) {
						delete localStorage[key];
					}
				} catch (e) {
				}
			}
			localStorage[data.saveStateId] = JSON.stringify({
				accessed: (new Date).getTime(),
				data: data.deflate()
			});
			return saveDataId;
		};
		render.loadData = function (saveDataId) {
			if (typeof localStorage == "undefined") {
				return undefined;
			}
			var stored = localStorage[saveDataId];
			if (!stored) {
				return undefined;
			}
			stored = JSON.parse(stored);
			return Jsonary.inflate(stored.data);
		}
	
		var rendererIdCounter = 0;
		
		function Renderer(sourceObj) {
			this.renderFunction = sourceObj.render || sourceObj.enhance;
			this.renderHtmlFunction = sourceObj.renderHtml;
			this.updateFunction = sourceObj.update;
			if (typeof sourceObj.filter == 'function') {
				this.filterFunction = sourceObj.filter;
				this.filterObj = {};
			} else {
				this.filterObj = sourceObj.filter || {};
				this.filterFunction = this.filterObj.filter;
			}
			if (this.filterObj.schema) {
				var possibleSchemas = Array.isArray(this.filterObj.schema) ? this.filterObj.schema : [this.filterObj.schema];
				this.filterFunction = (function (oldFilterFunction) {
					return function (data, schemas) {
						for (var i = 0; i < possibleSchemas.length; i++) {
							if (schemas.containsUrl(possibleSchemas[i])) {
								return oldFilterFunction ? oldFilterFunction.apply(this, arguments) : true;
							}
						}
						return false;
					};
				})(this.filterFunction);
			}
			if (typeof sourceObj.action === 'object') {
				this.actionFunction = function (context, actionName) {
					if (typeof sourceObj.action[actionName] === 'function') {
						var args = [];
						while (args.length < arguments.length) {
							args[args.length] = arguments[args.length];
						}
						args[1] = context;
						args[0] = context.data;
						return sourceObj.action[actionName].apply(this, args);
					} else if (typeof sourceObj.action['_super'] === 'function') {
						return sourceObj.action['_super'].apply(this, arguments);
					}
				}
			} else {
				this.actionFunction = sourceObj.action;
			}
			this.linkHandler = function () {
				if (sourceObj.linkHandler) {
					return sourceObj.linkHandler.apply(this, arguments);
				}
			};
			for (var key in sourceObj) {
				if (this[key] == undefined) {
					this[key] = sourceObj[key];
				}
			}
			this.uniqueId = rendererIdCounter++;
			this.name = sourceObj.name || ("#" + this.uniqueId);
			var sourceComponent = sourceObj.component || this.filterObj.component;
			if (sourceComponent == undefined) {
				sourceComponent = componentList[componentList.length - 1];
			}
			if (typeof sourceComponent == "string") {
				sourceComponent = [sourceComponent];
			}
			// TODO: remove this.component
			this.component = this.filterObj.component = sourceComponent;
			if (sourceObj.saveState || sourceObj.saveUiState) {
				this.saveUiState = sourceObj.saveState || sourceObj.saveUiState;
			}
			if (sourceObj.loadState || sourceObj.loadUiState) {
				this.loadUiState = sourceObj.loadState || sourceObj.loadUiState;
			}
		}
		Renderer.prototype = {
			toString: function () {
				return "[Jsonary Renderer]";
			},
			updateAll: function () {
				var elementIds = [];
				for (var uniqueId in pageContext.elementLookup) {
					elementIds = elementIds.concat(pageContext.elementLookup[uniqueId]);
				}
				for (var i = 0; i < elementIds.length; i++) {
					var element = render.getElementById(elementIds[i]);
					if (element == undefined) {
						continue;
					}
					var context = element.jsonaryContext;
					if (context.renderer.uniqueId = this.uniqueId) {
						context.rerender();
					}
				}
			},
			render: function (element, data, context) {
				if (element == null) {
					Jsonary.log(Jsonary.logLevel.WARNING, "Attempted to render to non-existent element.\n\tData path: " + data.pointerPath() + "\n\tDocument: " + data.document.url);
					return this;
				}
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
					if (Jsonary.config.debug) {
						for (var i = 0; i < Jsonary.config.checkTagParity.length; i++) {
							var tagName = Jsonary.config.checkTagParity[i];
							var openTagCount = innerHtml.match(new RegExp("<\s*" + tagName, "gi"));
							var closeTagCount = innerHtml.match(new RegExp("<\/\s*" + tagName, "gi"));
							if (openTagCount && (!closeTagCount || openTagCount.length != closeTagCount.length)) {
								Jsonary.log(Jsonary.logLevel.ERROR, "<" + tagName + "> mismatch in: " + this.name);
								innerHtml = '<div class="error">&lt;' + tagName + '&gt; mismatch in ' + Jsonary.escapeHtml(this.name) + '</div>';
							}
						}
					}
				}
				return innerHtml;
			},
			asyncRenderHtml: function (data, context, htmlCallback) {
				var innerHtml = "";
				var subCounter = 1;
				var subs = {};
				if (this.renderHtmlFunction != undefined) {
					// Create a substitute context for this render
					// uiState and other variables still point to the same place, but calls to renderHtml() are redirected to an async substitute
					var substituteRenderHtml = function (data, label, uiState) {
						var placeholderString = '<<ASYNC' + Math.random() + '>>';
						var actualString = null;
						subCounter++;
						this.asyncRenderHtml(data, label, uiState, function (error, innerHtml) {
							subs[placeholderString] = innerHtml;
							actualString = innerHtml;
							decrementSubRenderCount();
						});
						if (actualString !== null) {
							delete subs[placeholderString];
							return actualString;
						}
						return placeholderString;
					};
					function createAsyncContext(context) {
						var asyncContext = Object.create(context);
						asyncContext.renderHtml = substituteRenderHtml;
						asyncContext.subContext = function () {
							return createAsyncContext(context.subContext.apply(this, arguments));
						};
						return asyncContext;
					}
					// Render innerHtml with placeholders
					innerHtml = this.renderHtmlFunction(data, createAsyncContext(context));
				}
				function decrementSubRenderCount() {
					subCounter--;
					if (subCounter > 0) {
						return;
					}
					
					for (var placeholder in subs) {
						innerHtml = innerHtml.replace(placeholder, subs[placeholder]);
					}
					htmlCallback(null, innerHtml, context);
				}
				decrementSubRenderCount();
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
					fixScroll(function () {
						this.render(element, data, context);
					}.bind(this));
				}
				return this;
			},
			action: function (context, actionName) {
				// temporary link handler while executing action - travels up the context tree, giving renderers the chance to hande the link
				var linkHandlerForContexts = function (link) {
					var args = [];
					while (args.length < arguments.length) {
						args[args.length] = arguments[args.length];
					}
					var c = context;
					while (c) {
						if (c.renderer) {
							var result = c.renderer.linkHandler.apply(c.renderer, [c.data, c].concat(args));
							if (result === false) {
								return result;
							}
						}
						c = c.parent;
					}
				};
				if (typeof this.actionFunction == 'function') {
					Jsonary.addLinkHandler(linkHandlerForContexts);
					var result = this.actionFunction.apply(this, arguments);
					Jsonary.removeLinkHandler(linkHandlerForContexts);
					return result;
				} else {
					Jsonary.log(Jsonary.logLevel.WARNING, 'Renderer ' + this.name + ' has no actions (attempted ' + actionName + ')');
				}
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
			},
			saveUiState: function (uiState, subStates, data) {
				var result = {};
				for (key in uiState) {
					result[key] = uiState[key];
				}
				for (var label in subStates) {
					for (var subKey in subStates[label]) {
						result[label + "-" + subKey] = subStates[label][subKey];
					}
				}
				for (key in result) {
					if (Jsonary.isData(result[key])) {
						result[key] = this.saveStateData(result[key]);
					} else {
					}
				}
				return result;
			},
			saveStateData: function (data) {
				if (!data) {
					return undefined;
				}
				if (data.document.isDefinitive) {
					return "url:" + data.referenceUrl();
				}
				data.saveStateId = data.saveStateId || randomId();
				return render.saveData(data, data.saveStateId) || data.saveStateId;
			},
			loadUiState: function (savedState) {
				var uiState = {};
				var subStates = {};
				for (var key in savedState) {
					if (key.indexOf("-") != -1) {
						var parts = key.split('-');
						var subKey = parts.shift();
						var remainderKey = parts.join('-');
						if (!subStates[subKey]) {
							subStates[subKey] = {};
						}
						subStates[subKey][remainderKey] = savedState[key];
					} else {
						uiState[key] = this.loadStateData(savedState[key]) || savedState[key];
						if (Jsonary.isRequest(uiState[key])) {
							(function (key) {
								uiState[key].getData(function (data) {
									uiState[key] = data;
								});
							})(key);
						}
					}
				}
				return [
					uiState,
					subStates
				]
			},
			loadStateData: function (savedState) {
				if (!savedState || typeof savedState != "string") {
					return undefined;
				}
				if (savedState.substring(0, 4) == "url:") {
					var url = savedState.substring(4);
					var data = null;
					var request = Jsonary.getData(url, function (urlData) {
						data = urlData;
					});
					return data || request;
				}
				
				var data = render.loadData(savedState);
				if (data) {
					data.saveStateId = savedState;
				}
				return data;
			}
		}
		Renderer.prototype.super_ = Renderer.prototype;
	
		var rendererLookup = {};
		// Index first by read-only status, then type, then component
		var rendererListByTypeReadOnly = {
			'undefined': {},
			'null': {},
			'boolean': {},
			'integer': {},
			'number': {},
			'string' :{},
			'object': {},
			'array': {}
		};
		var rendererListByTypeEditable = {
			'undefined': {},
			'null': {},
			'boolean': {},
			'integer': {},
			'number': {},
			'string' :{},
			'object': {},
			'array': {}
		};
		function register(obj) {
			var renderer = new Renderer(obj);
			rendererLookup[renderer.uniqueId] = renderer;
			
			var readOnly = renderer.filterObj.readOnly;
			var types = renderer.filterObj.type || ['undefined', 'null', 'boolean', 'integer', 'number', 'string', 'object', 'array'];
			var components = renderer.filterObj.component;
			if (!Array.isArray(types)) {
				types = [types];
			}
			if (types.indexOf('number') !== -1 && types.indexOf('integer') === -1) {
				types.push('integer');
			}
			for (var i = 0; i < types.length; i++) {
				var type = types[i];
				if (!rendererListByTypeReadOnly[type]) {
					throw new Error('Invalid type(s): ' + type);
				}
				if (readOnly || typeof readOnly === 'undefined') {
					var rendererListByComponent = rendererListByTypeReadOnly[type];
					for (var j = 0; j < components.length; j++) {
						var component = components[j];
						rendererListByComponent[component] = rendererListByComponent[component] || [];
						rendererListByComponent[component].push(renderer);
					}
				}
				if (!readOnly) {
					var rendererListByComponent = rendererListByTypeEditable[type];
					for (var j = 0; j < components.length; j++) {
						var component = components[j];
						rendererListByComponent[component] = rendererListByComponent[component] || [];
						rendererListByComponent[component].push(renderer);
					}
				}
			}
			return renderer;
		}
		function deregister(rendererId) {
			if (typeof rendererId == "object") {
				rendererId = rendererId.uniqueId;
			}
			delete rendererLookup[rendererId];
			for (var i = 0; i < 2; i++) {
				var rendererListByType = i ? rendererListByTypeEditable : rendererListByTypeReadOnly;
				for (var type in rendererListByType) {
					for (var component in rendererListByType[type]) {
						var rendererList = rendererListByType[type][component];
						for (var i = 0; i < rendererList.length; i++) {
							if (rendererList[i].uniqueId == rendererId) {
								rendererList.splice(i, 1);
								i--;
							}
						}
					}
				}
			}
		}
		render.register = register;
		render.deregister = deregister;
	
		if (typeof document !== 'undefined') {
			// Lets us look up elements across multiple documents
			// This means that we can use a single Jsonary instance across multiple windows, as long as they add/remove their documents correctly (see the "popup" plugin)
			var documentList = [document];
			render.addDocument = function (doc) {
				documentList.push(doc);
				return this;
			};
			render.removeDocument = function (doc) {
				var index = documentList.indexOf(doc);
				if (index !== -1) {
					documentList.splice(index, 1);
				}
				return this;
			}
			render.getElementById = function (id) {
				for (var i = 0; i < documentList.length; i++) {
					var element = documentList[i].getElementById(id);
					if (element) {
						return element;
					}
				}
				return null;
			};
		}
		
		var actionHandlers = [];
		render.addActionHandler = function (callback) {
			actionHandlers.push(callback);
		};
		function notifyActionHandlers(data, context, actionName, historyChange) {
			historyChange = !!historyChange || (historyChange == undefined);
			for (var i = 0; i < actionHandlers.length; i++) {
				var callback = actionHandlers[i];
				var result = callback(data, context, actionName, historyChange);
				if (result === false) {
					break;
				}
			}
		};
		
		function lookupRenderer(rendererId) {
			return rendererLookup[rendererId];
		}
	
		function selectRenderer(data, uiStartingState, missingComponents, bannedRenderers) {
			var schemas = data.schemas();
			var basicType = data.basicType();
			var readOnly = data.readOnly();
			var rendererListByType = readOnly ? rendererListByTypeReadOnly : rendererListByTypeEditable;
			for (var j = 0; j < missingComponents.length; j++) {
				var component = missingComponents[j];
				var rendererListByComponent = rendererListByType[basicType];
				if (rendererListByComponent[component]) {
					var rendererList = rendererListByComponent[component];
					for (var i = rendererList.length - 1; i >= 0; i--) {
						var renderer = rendererList[i];
						if (bannedRenderers[renderer.uniqueId]) {
							continue;
						} else if (renderer.canRender(data, schemas, uiStartingState)) {
							return renderer;
						}
					}
				}
			}
		}
	
		// TODO: this doesn't seem that useful - remove?
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
			jQuery.fn.extend({renderJson: jQueryRender});
			jQuery.extend({renderJson: jQueryRender});
		}
	
		Jsonary.extend({
			render: render,
			renderHtml: renderHtml,
			enhance: enhanceElement,
			renderValue: renderValue,
			asyncRenderHtml: asyncRenderHtml,
		});
		Jsonary.extendData({
			renderTo: function (element, uiState) {
				if (typeof element == "string") {
					element = render.getElementById(element);
				}
				render(element, this, uiState);
			}
		});
		// Whenever anything is invalidated, call access() on every document we know about, to force a re-request.
		Jsonary.invalidate = function (oldFunction) {
			return function () {
				var result = oldFunction.apply(this, arguments);
				var elementIds = [];
				for (var uniqueId in pageContext.elementLookup) {
					var ids = pageContext.elementLookup[uniqueId];
					elementIds = elementIds.concat(ids);
				}
				for (var i = 0; i < elementIds.length; i++) {
					var element = render.getElementById(elementIds[i]);
					if (element && element.jsonaryContext) {
						element.jsonaryContext.data.document.access();
					}
				}
				return result;
			};
		}(Jsonary.invalidate);
	})(this);
	var Jsonary = this.Jsonary;

/**** _cache-json-schema-org.js ****/

	// Modified versions of the meta-schemas
	
	var baseSchema = {
		"id": "http://json-schema.org/draft-04/schema#",
		"$schema": "http://json-schema.org/draft-04/schema#",
		"title": "JSON Schema",
		"description": "Core schema meta-schema",
		"definitions": {
			"schemaArray": {
				"type": "array",
				"minItems": 1,
				"items": { "$ref": "#" }
			},
			"positiveInteger": {
				"type": "integer",
				"minimum": 0
			},
			"positiveIntegerDefault0": {
				"allOf": [ { "$ref": "#/definitions/positiveInteger" }, { "default": 0 } ]
			},
			"simpleTypes": {
				"title": "Simple type",
				"enum": [ "array", "boolean", "integer", "null", "number", "object", "string" ]
			},
			"stringArray": {
				"type": "array",
				"items": { "type": "string" },
				"minItems": 1,
				"uniqueItems": true
			}
		},
		"type": "object",
		"properties": {
			"id": {
				"type": "string",
				"format": "uri"
			},
			"$schema": {
				"type": "string",
				"format": "uri"
			},
			"title": {
				"type": "string"
			},
			"description": {
				"type": "string"
			},
			"default": {},
			"multipleOf": {
				"type": "number",
				"minimum": 0,
				"exclusiveMinimum": true
			},
			"maximum": {
				"type": "number"
			},
			"exclusiveMaximum": {
				"type": "boolean",
				"default": false
			},
			"minimum": {
				"type": "number"
			},
			"exclusiveMinimum": {
				"type": "boolean",
				"default": false
			},
			"maxLength": { "$ref": "#/definitions/positiveInteger" },
			"minLength": { "$ref": "#/definitions/positiveIntegerDefault0" },
			"pattern": {
				"type": "string",
				"format": "regex"
			},
			"additionalItems": {
				"oneOf": [
					{ "type": "boolean" },
					{ "$ref": "#" }
				],
				"default": {}
			},
			"items": {
				"oneOf": [
					{ "$ref": "#" },
					{ "$ref": "#/definitions/schemaArray" }
				],
				"default": {}
			},
			"maxItems": { "$ref": "#/definitions/positiveInteger" },
			"minItems": { "$ref": "#/definitions/positiveIntegerDefault0" },
			"uniqueItems": {
				"type": "boolean",
				"default": false
			},
			"maxProperties": { "$ref": "#/definitions/positiveInteger" },
			"minProperties": { "$ref": "#/definitions/positiveIntegerDefault0" },
			"required": { "$ref": "#/definitions/stringArray" },
			"additionalProperties": {
				"oneOf": [
					{ "type": "boolean"},
					{ "$ref": "#" }
				],
				"default": {}
			},
			"definitions": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"default": {}
			},
			"properties": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"default": {}
			},
			"patternProperties": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"default": {}
			},
			"dependencies": {
				"type": "object",
				"additionalProperties": {
					"oneOf": [
						{ "$ref": "#" },
						{ "$ref": "#/definitions/stringArray" }
					]
				}
			},
			"enum": {
				"type": "array",
				"minItems": 1,
				"uniqueItems": true
			},
			"type": {
				"oneOf": [
					{ "$ref": "#/definitions/simpleTypes" },
					{
						"type": "array",
						"items": { "$ref": "#/definitions/simpleTypes" },
						"minItems": 1,
						"uniqueItems": true
					}
				]
			},
			"allOf": { "$ref": "#/definitions/schemaArray" },
			"anyOf": { "$ref": "#/definitions/schemaArray" },
			"oneOf": { "$ref": "#/definitions/schemaArray" },
			"not": { "$ref": "#" }
		},
		"dependencies": {
			"exclusiveMaximum": [ "maximum" ],
			"exclusiveMinimum": [ "minimum" ]
		},
		"default": {}
	};
	
	var hyperSchema = {
		"$schema": "http://json-schema.org/draft-04/hyper-schema#",
		"id": "http://json-schema.org/draft-04/hyper-schema#",
		"title": "JSON Hyper-Schema",
		"allOf": [
			{
				"$ref": "http://json-schema.org/draft-04/schema#"
			}
		],
		"properties": {
			"additionalItems": {
				"oneOf": [
					{
						"type": "boolean"
					},
					{
						"$ref": "#"
					}
				]
			},
			"additionalProperties": {
				"oneOf": [
					{
						"type": "boolean"
					},
					{
						"$ref": "#"
					}
				]
			},
			"dependencies": {
				"additionalProperties": {
					"oneOf": [
						{
							"$ref": "#"
						},
						{
							"type": "array"
						}
					]
				}
			},
			"items": {
				"oneOf": [
					{
						"$ref": "#"
					},
					{
						"$ref": "#/definitions/schemaArray"
					}
				]
			},
			"definitions": {
				"additionalProperties": {
					"$ref": "#"
				}
			},
			"patternProperties": {
				"additionalProperties": {
					"$ref": "#"
				}
			},
			"properties": {
				"additionalProperties": {
					"$ref": "#"
				}
			},
			"allOf": {
				"$ref": "#/definitions/schemaArray"
			},
			"oneOf": {
				"$ref": "#/definitions/schemaArray"
			},
			"oneOf": {
				"$ref": "#/definitions/schemaArray"
			},
			"not": {
				"$ref": "#"
			},
	
			"links": {
				"type": "array",
				"items": {
					"$ref": "#/definitions/linkDescription"
				}
			},
			"fragmentResolution": {
				"type": "string"
			},
			"media": {
				"type": "object",
				"properties": {
					"type": {
						"description": "A media type, as described in RFC 2046",
						"type": "string"
					},
					"binaryEncoding": {
						"description": "A content encoding scheme, as described in RFC 2045",
						"type": "string"
					}
				}
			},
			"pathStart": {
				"description": "Instances' URIs must start with this value for this schema to apply to them",
				"type": "string",
				"format": "uri"
			}
		},
		"definitions": {
			"schemaArray": {
				"title": "Array of schemas",
				"type": "array",
				"items": {
					"$ref": "#"
				}
			},
			"linkDescription": {
				"title": "Link Description Object",
				"type": "object",
				"required": [ "href", "rel" ],
				"properties": {
					"href": {
						"description": "a URI template, as defined by RFC 6570, with the addition of the $, ( and ) characters for pre-processing",
						"type": "string"
					},
					"rel": {
						"description": "relation to the target resource of the link",
						"type": "string"
					},
					"title": {
						"description": "a title for the link",
						"type": "string"
					},
					"targetSchema": {
						"description": "JSON Schema describing the link target",
						"$ref": "#"
					},
					"mediaType": {
						"description": "media type (as defined by RFC 2046) describing the link target",
						"type": "string"
					},
					"method": {
						"description": "method for requesting the target of the link (e.g. for HTTP this might be \"GET\" or \"DELETE\")",
						"type": "string"
					},
					"encType": {
						"description": "The media type in which to submit data along with the request",
						"type": "string",
						"default": "application/json"
					},
					"schema": {
						"description": "Schema describing the data to submit along with the request",
						"$ref": "#"
					}
				}
			}
		},
		"links": [
			{
				"rel": "self",
				"href": "{+id}"
			},
			{
				"rel": "full",
				"href": "{+($ref)}"
			}
		]
	};
	
	Jsonary.addToCache('http://json-schema.org/schema', {allOf: [{"$ref": "draft-04/schema"}]});
	Jsonary.addToCache('http://json-schema.org/draft-04/schema', baseSchema);
	
	Jsonary.addToCache('http://json-schema.org/hyper-schema', {allOf: [{"$ref": "draft-04/hyper-schema"}]});
	Jsonary.addToCache('http://json-schema.org/draft-04/hyper-schema', hyperSchema);

/**** list-links.js ****/

	(function (Jsonary) {
	
		Jsonary.render.Components.add("LIST_LINKS");
		
		Jsonary.render.register({
			name: "Jsonary list links with prompt",
			component: Jsonary.render.Components.LIST_LINKS,
			update: function (element, data, context, operation) {
				// We don't care about data changes - when the links change, a re-render is forced anyway.
				return false;
			},
			renderHtml: function (data, context) {
				if (!data.readOnly()) {
					return context.renderHtml(data);
				}
				var result = "";
				if (context.uiState.editInPlace) {
					var html = '<span class="button action">save</span>';
					result += context.actionHtml(html, "submit");
					var html = '<span class="button action">cancel</span>';
					result += context.actionHtml(html, "cancel");
					result += context.withSameComponents().renderHtml(context.uiState.submissionData, '~linkData');
					return result;
				}
				
				var links = data.links();
				if (links.length) {
					result += '<span class="link-list">';
					for (var i = 0; i < links.length; i++) {
						var link = links[i];
						if (link.rel == "self") {
							continue;
						}
						var html = '<span class="button link">' + Jsonary.escapeHtml(link.title || link.rel) + '</span>';
						result += context.actionHtml(html, 'follow-link', i);
					}
					result += '</span>';
				}
	
				if (context.uiState.submitLink != undefined) {
					var link = data.links()[context.uiState.submitLink];
					result += '<div class="prompt-outer"><div class="prompt-inner">';
					result += context.actionHtml('<div class="prompt-overlay"></div>', 'cancel');
					result += '<div class="prompt-box"><h1>' + Jsonary.escapeHtml(link.title || link.rel) + '</h1><h2>' + Jsonary.escapeHtml(link.method) + " " + Jsonary.escapeHtml(link.href) + '</h2>';
					result += '<div>' + context.renderHtml(context.uiState.submissionData, '~linkData') + '</div>';
					result += '</div>';
					result += '<div class="prompt-buttons">';
					result += context.actionHtml('<span class="button">Submit</span>', 'submit');
					result += context.actionHtml('<span class="button">cancel</span>', 'cancel');
					result += '</div>';
					result += '</div></div>';
				}
				
				result += context.renderHtml(data, "data");
				return result;
			},
			action: function (context, actionName, arg1) {
				if (actionName == "follow-link") {
					var data = context.data;
					var link = data.links()[arg1];
					if (link.method == "GET" && link.submissionSchemas.length == 0) {
						// There's no data to prompt for, and GET links are safe, so we don't put up a dialog
						link.follow();
						return false;
					}
					context.uiState.submitLink = arg1;
					context.uiState.submissionData = link.createSubmissionData(undefined, true);
					if (link.method == "PUT") {
						var dataUrl = (data.getLink('self') && data.getLink('self').href) || data.referenceUrl() || '';
						if (link.href.replace(/#$/, '') === dataUrl.replace(/#$/, '')) {
							context.uiState.editInPlace = true;
						}
					}
					return true;
				} else if (actionName == "submit") {
					var link = context.data.links()[context.uiState.submitLink];
					link.follow(context.uiState.submissionData);
					delete context.uiState.submitLink;
					delete context.uiState.editInPlace;
					delete context.uiState.submissionData;
					return true;
				} else {
					delete context.uiState.submitLink;
					delete context.uiState.editInPlace;
					delete context.uiState.submissionData;
					return true;
				}
			},
			saveState: function (uiState, subStates) {
				var result = {};
				for (var key in subStates.data) {
					result[key] = subStates.data[key];
				}
				if (result.link != undefined || result.inPlace != undefined || result.linkData != undefined || result[""] != undefined) {
					var newResult = {"":"-"};
					for (var key in result) {
						newResult["-" + key] = result[key];
					}
					result = newResult;
				}
				if (uiState.submitLink !== undefined) {
					var parts = [uiState.submitLink];
					parts.push(uiState.editInPlace ? 1 : 0);
					parts.push(this.saveStateData(uiState.submissionData));
					result['link'] = parts.join("-");
				}
				return result;
			},
			loadState: function (savedState) {
				var uiState = {};
				if (savedState['link'] != undefined) {
					var parts = savedState['link'].split("-");
					uiState.submitLink = parseInt(parts.shift()) || 0;
					if (parseInt(parts.shift())) {
						uiState.editInPlace = true
					}
					uiState.submissionData = this.loadStateData(parts.join("-"));
					delete savedState['link'];
					if (!uiState.submissionData) {
						uiState = {};
					}
				}
				if (savedState[""] != '-') {
					delete savedState[""];
					var newSavedState = {};
					for (var key in savedState) {
						var newKey = (key.charAt(0) == '-') ? key.substring(1) : key;
						newSavedState[newKey] = savedState[key];
					}
					savedState = newSavedState;
				}
				return [
					uiState,
					{data: savedState}
				];
			}
		});
	
	})(Jsonary);
	

/**** plain.jsonary.js ****/

	(function (global) {
		var escapeHtml = Jsonary.escapeHtml;
		if (global.escapeHtml == undefined) {
			global.escapeHtml = escapeHtml;
		}
	
		Jsonary.render.register({
			name: "Jsonary plain add/remove",
			component: Jsonary.render.Components.ADD_REMOVE,
			renderHtml: function (data, context) {
				if (!data.defined()) {
					context.uiState.undefined = true;
					var potentialSchemas = data.schemas(true);
					if (potentialSchemas.readOnly()) {
						return '';
					}
					var title = potentialSchemas.title();
					if (!title && data.parent() && data.parent().basicType() == 'object') {
						title = data.parentKey();
					}
					title = title || 'add';
					return context.actionHtml('<span class="json-undefined-create">+ ' + Jsonary.escapeHtml(title) + '</span>', "create");
				}
				delete context.uiState.undefined;
				var showDelete = false;
				if (data.parent() != null) {
					var parent = data.parent();
					if (parent.basicType() == "object") {
						var required = parent.schemas().requiredProperties();
						var minProperties = parent.schemas().minProperties();
						showDelete = required.indexOf(data.parentKey()) == -1 && parent.keys().length > minProperties;
					} else if (parent.basicType() == "array") {
						var tupleTypingLength = parent.schemas().tupleTypingLength();
						var minItems = parent.schemas().minItems();
						var index = parseInt(data.parentKey());
						if ((index >= tupleTypingLength || index == parent.length() - 1)
							&& parent.length() > minItems) {
							showDelete = true;
						}
					}
				}
				var result = "";
				if (showDelete) {
					var parentType = parent.basicType();
					result += "<div class='json-" + parentType + "-delete-container'>";
					result += context.actionHtml("<span class='json-" + parentType + "-delete json-" + parentType + "-delete-inner'>X</span>", "remove") + " ";
					result += context.renderHtml(data, 'data');
					result += "</div>";
				} else {
					result += context.renderHtml(data, 'data');
				}
				return result;
			},
			action: function (context, actionName) {
				if (actionName == "create") {
					var data = context.data;
					var parent = data.parent();
					var finalComponent = data.parentKey();
					if (parent != undefined) {
						var parentSchemas = parent.schemas();
						if (parent.basicType() == "array") {
							parentSchemas.createValueForIndex(finalComponent, function (newValue) {
								parent.index(finalComponent).setValue(newValue);
							});
						} else {
							if (parent.basicType() != "object") {
								parent.setValue({});
							}
							parentSchemas.createValueForProperty(finalComponent, function (newValue) {
								parent.property(finalComponent).setValue(newValue);
							});
						}
					} else {
						data.schemas().createValue(function (newValue) {
							data.setValue(newValue);
						});
					}
				} else if (actionName == "remove") {
					context.data.remove();
				} else {
					alert("Unkown action: " + actionName);
				}
			},
			update: function (element, data, context, operation) {
				return data.defined() == !!context.uiState.undefined;
			},
			filter: {
				readOnly: false
			},
			saveState: function (uiState, subStates) {
				return subStates.data || {};
			},
			loadState: function (savedState) {
				return [
					{},
					{data: savedState}
				];
			}
		});
		
		Jsonary.render.register({
			name: "Jsonary plain type-selector",
			component: Jsonary.render.Components.TYPE_SELECTOR,
			renderHtml: function (data, context) {
				var result = "";
				var enums = data.schemas().enumValues();
				var basicTypes = data.schemas().basicTypes();
				if (basicTypes.length > 1 && enums == null) {
					result += '<select name="' + context.inputNameForAction('select-basic-type') + '">';
					for (var i = 0; i < basicTypes.length; i++) {
						if (basicTypes[i] == "integer" && basicTypes.indexOf("number") != -1) {
							continue;
						}
						var typeHtml = Jsonary.escapeHtml(basicTypes[i]);
						if (basicTypes[i] == data.basicType() || basicTypes[i] == "number" && data.basicType() == "integer") {
							result += '<option value="' + typeHtml + '" selected>' + typeHtml +'</option>';
						} else {
							result += '<option value="' + typeHtml + '">' + typeHtml +'</option>';
						}
					}
					result += '</select> ';
				}
				result += context.renderHtml(data, 'data');
				return result;
			},
			action: function (context, actionName, basicType) {
				if (actionName == "select-basic-type") {
					context.uiState.dialogOpen = false;
					var schemas = context.data.schemas().concat([Jsonary.createSchema({type: basicType})]);
					var oldValue = context.data.get();
					schemas.createValue(oldValue, function (newValue) {
						context.data.setValue(newValue);
					});
					return true;
				} else {
					alert("Unkown action: " + actionName);
				}
			},
			update: function (element, data, context, operation) {
				return false;
			},
			filter: {
				readOnly: false
			},
			saveState: function (uiState, subStates) {
				var result = {};
				if (uiState.dialogOpen) {
					result.dialogOpen = true;
				}
				if (subStates.data && (subStates.data._ != undefined || subStates.data.dialogOpen != undefined)) {
					result._ = subStates['data'];
				} else {
					for (var key in subStates.data) {
						result[key] = subStates.data[key];
					}
				}
				return result;
			},
			loadState: function (savedState) {
				var uiState = savedState;
				var subState = {};
				if (savedState._ != undefined) {
					var subState = savedState._;
					delete savedState._;
				} else {
					var uiState = {};
					if (savedState.dialogOpen) {
						uiState.dialogOpen = true;
					}
					delete savedState.dialogOpen;
					subState = savedState;
				}
				return [
					uiState,
					{data: subState}
				];
			}
		});
	
		// Display schema switcher
		Jsonary.render.Components.add("SCHEMA_SWITCHER", Jsonary.render.Components.TYPE_SELECTOR);
		Jsonary.render.register({
			name: "Jsonary plain schema-switcher",
			component: Jsonary.render.Components.SCHEMA_SWITCHER,
			renderHtml: function (data, context) {
				var result = "";
				var fixedSchemas = data.schemas().fixed();
	
				var singleOption = false;
				var xorSchemas;
				var orSchemas = fixedSchemas.orSchemas();
				if (orSchemas.length == 0) {
					xorSchemas = fixedSchemas.xorSchemas();
					if (xorSchemas.length == 1) {
						singleOption = true;
					}
				}
				
				context.uiState.xorSelected = [];
				context.uiState.orSelected = [];
				if (singleOption) {
					for (var i = 0; i < xorSchemas.length; i++) {
						var options = xorSchemas[i];
						var inputName = context.inputNameForAction('selectXorSchema', i);
						result += '<select name="' + inputName + '">';
						for (var j = 0; j < options.length; j++) {
							var schema = options[j];
							schema.getFull(function (s) {schema = s;});
							var selected = "";
							if (data.schemas().indexOf(schema) != -1) {
								context.uiState.xorSelected[i] = j;
								selected = " selected";
							}
							result += '<option value="' + j + '"' + selected + '>' + schema.forceTitle() + '</option>'
						}
						result += '</select>';
					}
				}
				
				if (context.uiState.dialogOpen) {
					result += '<div class="json-select-type-dialog-outer"><span class="json-select-type-dialog">';
					result += context.actionHtml('close', "closeDialog");
					xorSchemas = xorSchemas || fixedSchemas.xorSchemas();
					for (var i = 0; i < xorSchemas.length; i++) {
						var options = xorSchemas[i];
						var inputName = context.inputNameForAction('selectXorSchema', i);
						result += '<br><select name="' + inputName + '">';
						for (var j = 0; j < options.length; j++) {
							var schema = options[j];
							schema.getFull(function (s) {schema = s;});
							var selected = "";
							if (data.schemas().indexOf(schema) != -1) {
								context.uiState.xorSelected[i] = j;
								selected = " selected";
							}
							result += '<option value="' + j + '"' + selected + '>' + schema.title() + '</option>'
						}
						result += '</select>';
					}
					for (var i = 0; i < orSchemas.length; i++) {
						var options = orSchemas[i];
						var inputName = context.inputNameForAction('selectOrSchema', i);
						result += '<br><select name="' + inputName + '" multiple size="' + options.length + '">';
						context.uiState.orSelected[i] = [];
						for (var j = 0; j < options.length; j++) {
							var schema = options[j];
							schema.getFull(function (s) {schema = s;});
							var selected = "";
							if (data.schemas().indexOf(schema) != -1) {
								context.uiState.orSelected[i][j] = true;
								selected = " selected";
							} else {
								context.uiState.orSelected[i][j] = false;
							}
							result += '<option value="' + j + '"' + selected + '>' + schema.title() + '</option>'
						}
						result += '</select>';
					}
					result += '</span></div>';
				}
				if (!singleOption && fixedSchemas.length < data.schemas().length) {
					result += context.actionHtml("<span class=\"json-select-type button\">Schemas</span>", "openDialog") + " ";
				}
				result += context.renderHtml(data, 'data');
				return result;
			},
			createValue: function (context) {
				var data = context.data;
				var newSchemas = context.data.schemas().fixed();
				var xorSchemas = context.data.schemas().fixed().xorSchemas();
				for (var i = 0; i < xorSchemas.length; i++) {
					newSchemas = newSchemas.concat([xorSchemas[i][context.uiState.xorSelected[i]].getFull()]);
				}
				var orSchemas = context.data.schemas().fixed().orSchemas();
				for (var i = 0; i < orSchemas.length; i++) {
					var options = orSchemas[i];
					for (var j = 0; j < options.length; j++) {
						if (context.uiState.orSelected[i][j]) {
							newSchemas = newSchemas.concat([options[j].getFull()]);
						}
					}
				}
				newSchemas = newSchemas.getFull();
				var oldValue = data.get();
				data.setValue(newSchemas.createValue(oldValue));
				newSchemas.createValue(oldValue, function (value) {
					data.setValue(value);
				})
			},
			action: function (context, actionName, value, arg1) {
				if (actionName == "closeDialog") {
					context.uiState.dialogOpen = false;
					return true;
				} else if (actionName == "openDialog") {
					context.uiState.dialogOpen = true;
					return true;
				} else if (actionName == "selectXorSchema") {
					if (context.uiState.xorSelected[arg1] + "" != value + "") {
						context.uiState.xorSelected[arg1] = value;
						this.createValue(context);
						return true;
					}
				} else if (actionName == "selectOrSchema") {
					// Order should be the same, and they're all numbers, so...
					var different = (context.uiState.orSelected[arg1].length !== value.length);
					for (var i = 0; !different && i < value.length; i++) {
						different = (context.uiState.orSelected[arg1][i] + "" == value[i] + "");
					}
					if (different) {
						context.uiState.orSelected[arg1] = [];
						for (var i = 0; i < value.length; i++) {
							context.uiState.orSelected[arg1][value[i]] = true;
						}
						this.createValue(context);
						return true;
					}
				} else {
					alert("Unkown action: " + actionName);
				}
			},
			update: function (element, data, context, operation) {
				return false;
			},
			filter: {
				readOnly: false
			},
			saveState: function (uiState, subStates) {
				var result = {};
				if (uiState.dialogOpen) {
					result.dialogOpen = true;
				}
				if (subStates.data._ != undefined || subStates.data.dialogOpen != undefined) {
					result._ = subStates['data'];
				} else {
					for (var key in subStates.data) {
						result[key] = subStates.data[key];
					}
				}
				return result;
			},
			loadState: function (savedState) {
				var uiState = savedState;
				var subState = {};
				if (savedState._ != undefined) {
					var subState = savedState._;
					delete savedState._;
				} else {
					var uiState = {};
					if (savedState.dialogOpen) {
						uiState.dialogOpen = true;
					}
					delete savedState.dialogOpen;
					subState = savedState;
				}
				return [
					uiState,
					{data: subState}
				];
			}
		});
	
		// Display raw JSON
		Jsonary.render.register({
			name: "Jsonary plain raw JSON display",
			renderHtml: function (data, context) {
				if (!data.defined()) {
					return "";
				}
				return '<span class="json-raw">' + escapeHtml(JSON.stringify(data.value())) + '</span>';
			}
		});
		
		// Display/edit null
		Jsonary.render.register({
			name: "Jsonary plain null",
			renderHtml: function (data, context) {
				return '<span class="json-null">null</span>';
			},
			filter: {
				type: 'null'
			}
		});
		
		// Display/edit objects
		Jsonary.render.register({	
			name: "Jsonary plain objects",
			renderHtml: function (data, context) {
				var uiState = context.uiState;
				var result = "";
				result += '<fieldset class="json-object-outer">';
				var title = data.schemas().title();
				if (title) {
					result += '<legend class="json-object-title">' + Jsonary.escapeHtml(title) + '</legend>';
				}
				result += '<table class="json-object"><tbody>';
				var drawProperty = function (key, subData) {
					if (subData.defined()) {
						var title = subData.schemas().fixed().title();
					} else {
						var schemas = subData.parent().schemas().propertySchemas(subData.parentKey());
						if (schemas.readOnly()) {
							return;
						}
						var title = schemas.title();
					}
					result += '<tr class="json-object-pair">';
					if (title == "") {
						result +=	'<td class="json-object-key"><div class="json-object-key-title">' + escapeHtml(key) + '</div></td>';
					} else {
						result +=	'<td class="json-object-key"><div class="json-object-key-title">' + escapeHtml(key) + '</div><div class="json-object-key-text">' + escapeHtml(title) + '</div></td>';
					}
					result += '<td class="json-object-value">' + context.renderHtml(subData) + '</td>';
					result += '</tr>';
				}
				if (!data.readOnly()) {
					var schemas = data.schemas();
					var knownProperties = schemas.knownProperties();
					
					var shouldHideUndefined = knownProperties.length - schemas.requiredProperties().length > 5;
					
					var maxProperties = schemas.maxProperties();
					var canAdd = (maxProperties == null || maxProperties > schemas.keys().length);
					data.properties(knownProperties, function (key, subData) {
						if ((!shouldHideUndefined && canAdd) || subData.defined()) {
							drawProperty(key, subData);
						}
					}, drawProperty);
	
					if (canAdd && (schemas.allowedAdditionalProperties() || shouldHideUndefined)) {
						if (context.uiState.addInput) {
							result += '<tr class="json-object-pair"><td class="json-object-key"><div class="json-object-key-text">';
							result += context.actionHtml('<span class="button">add</span>', "add-confirm");
							result += '<br>';
							result += '</div></td><td>';
							if (shouldHideUndefined) {
								var missingKeys = [];
								data.properties(knownProperties, function (key, subData) {
									if (!subData.defined()) {
										missingKeys.push(key);
									}
								});
								result += '<select name="' + context.inputNameForAction('select-preset') + '">';
								if (schemas.allowedAdditionalProperties()) {
									result += '<option value="custom">Enter your own:</option>';
								}
								result += '<optgroup label="Known properties">';
								missingKeys.sort();
								for (var i = 0; i < missingKeys.length; i++) {
									var key = missingKeys[i];
									if (key == context.uiState.addInputSelect) {
										result += '<option value="key-' + Jsonary.escapeHtml(key) + '" selected>' + Jsonary.escapeHtml(key) + '</option>';
									} else {
										result += '<option value="key-' + Jsonary.escapeHtml(key) + '">' + Jsonary.escapeHtml(key) + '</option>';
									}
								}
								result += '</optgroup></select>';
							}
							if (schemas.allowedAdditionalProperties() && (!shouldHideUndefined || context.uiState.addInputSelect == null)) {
								result += '<input type="text" class="json-object-add-input" name="' + context.inputNameForAction("add-input") + '" value="' + Jsonary.escapeHtml(context.uiState.addInputValue) + '"></input>';
								result += context.actionHtml('<span class="button">cancel</span>', "add-cancel");
								if (data.property(context.uiState.addInputValue).defined()) {
									result += '<span class="warning"><code>' + Jsonary.escapeHtml(context.uiState.addInputValue) + '</code> already exists</span>';
								}
							} else {
								result += context.actionHtml('<span class="button">cancel</span>', "add-cancel");
							}
							result += '</td></tr>';
						} else {
							result += '<tr class="json-object-pair"><td class="json-object-key"><div class="json-object-key-text">';
							result += context.actionHtml('<span class="button">add</span>', "add-input");
							result += '</div></td><td></td></tr>';
						}
					}
				} else {
					var knownProperties = data.schemas().knownProperties();
					data.properties(knownProperties, function (key, subData) {
						if (subData.defined()) {
							drawProperty(key, subData);
						}
					}, true);
				}
				result += '</table>';
				result += '</fieldset>';
				return result;
			},
			action: function (context, actionName, arg1) {
				var data = context.data;
				if (actionName == "select-preset") {
					if (arg1 == 'custom') {
						delete context.uiState.addInputSelect;
					} else {
						var key = arg1;
						context.uiState.addInputSelect = key.substring(4);
					}
					return true;
				} else if (actionName == "add-input") {
					context.uiState.addInput = true;
					context.uiState.addInputValue = (arg1 == undefined) ? "key" : arg1;
					return true;
				} else if (actionName == "add-cancel") {
					delete context.uiState.addInput;
					delete context.uiState.addInputValue;
					delete context.uiState.addInputSelect;
					return true;
				} else if (actionName == "add-confirm") {
					var key = (context.uiState.addInputSelect != null) ? context.uiState.addInputSelect : context.uiState.addInputValue;
					if (key != null && !data.property(key).defined()) {
						delete context.uiState.addInput;
						delete context.uiState.addInputValue;
						delete context.uiState.addInputSelect;
						data.schemas().createValueForProperty(key, function (newValue) {
							data.property(key).setValue(newValue);
						});
					}
				}
			},
			filter: {
				type: 'object'
			}
		});
	
		// Display/edit arrays
		Jsonary.render.register({
			name: "Jsonary re-orderable array",
			renderHtml: function (data, context) {
				var tupleTypingLength = data.schemas().tupleTypingLength();
				var maxItems = data.schemas().maxItems();
				var result = "";
				var canReorder = !data.readOnly() && (data.length() > tupleTypingLength + 1);
				data.items(function (index, subData) {
					result += '<div class="json-array-item">';
					if (canReorder && index >= tupleTypingLength) {
						if (typeof context.uiState.moveSelect === 'undefined') {
							result += context.actionHtml('<span class="json-array-move json-array-move-start">move</span>', 'moveStart', index);
						} else if (context.uiState.moveSelect == index) {
							result += context.actionHtml('<span class="json-array-move json-array-move-cancel">cancel</span>', 'moveCancel');
						} else if (context.uiState.moveSelect > index) {
							result += context.actionHtml('<span class="json-array-move json-array-move-up">to here</span>', 'moveSelect', context.uiState.moveSelect, index);
						} else {
							result += context.actionHtml('<span class="json-array-move json-array-move-down">to here</span>', 'moveSelect', context.uiState.moveSelect, index);
						}
					}
					result += '<span class="json-array-value">' + context.renderHtml(subData) + '</span>';
					result += '</div>';
				});
				if (!data.readOnly()) {
					if (maxItems == null || data.length() < maxItems) {
						result += '<div class="json-array-item">';
						result += context.renderHtml(data.item(data.length()));
						result += '</div>';
					}
				}
				return result;
			},
			action: {
				moveStart: function (data, context, index) {
					context.uiState.moveSelect = index;
					return true;
				},
				moveCancel: function (data, context, index) {
					delete context.uiState.moveSelect;
					return true;
				},
				moveSelect: function (data, context, fromIndex, toIndex) {
					delete context.uiState.moveSelect;
					data.item(fromIndex).moveTo(data.item(toIndex));
				}
			},
			update: function (element, data, context, operation) {
				if (context.uiState.moveSelect != undefined) {
					delete context.uiState.moveSelect;
					return true;
				}
				return this.defaultUpdate(element, data, context, operation);
			},
			filter: {
				type: 'array'
			}
		});
		
		// Display string
		Jsonary.render.register({
			name: "Jsonary plain display string",
			renderHtml: function (data, context) {
				return '<span class="json-string">' + escapeHtml(data.value()) + '</span>';
			},
			filter: {
				type: 'string',
				readOnly: true
			}
		});
		
		// Convert from HTML to plain-text
		function getText(element) {
			var result = "";
			for (var i = 0; i < element.childNodes.length; i++) {
				var child = element.childNodes[i];
				if (child.nodeType == 1) {
					var tagName = child.tagName.toLowerCase();
					if (tagName == "br") {
						result += "\n";
						continue;
					}
					if (child.tagName == "li") {
						result += "\n*\t";
					}
					if (tagName == "p"
						|| /^h[0-6]$/.test(tagName)
						|| tagName == "header"
						|| tagName == "aside"
						|| tagName == "blockquote"
						|| tagName == "footer"
						|| tagName == "div"
						|| tagName == "table"
						|| tagName == "hr") {
						if (result != "") {
							result += "\n";
						}
					}
					if (tagName == "td" || tagName == "th") {
						result += "\t";
					}
					
					result += getText(child);
					
					if (tagName == "tr") {
						result += "\n";
					}
				} else if (child.nodeType == 3) {
					result += child.nodeValue;
				}
			}
			result = result.replace(/\r\n/g, "\n");
			result = result.replace(/\n$/, "");
			result = result.replace(/\u00A0/g, ' '); // Non-breaking spaces are trouble.
			return result;
		}
	
		// Edit string
		Jsonary.render.register({
			name: "Jsonary plain edit string",
			renderHtml: function (data, context) {
				var maxLength = data.schemas().maxLength();
				var inputName = context.inputNameForAction('new-value');
				var valueHtml = escapeHtml(data.value());
				var rows = 0;
				var lines = data.value().split('\n');
				for (var i = 0; i < lines.length; i++) {
					// Assume a 70-character line
					rows += Math.floor(lines[i].length/70) + 1;
				}
				return '<textarea class="json-string" rows="' + rows + '" name="' + inputName + '">'
					+ valueHtml
					+ '</textarea>';
			},
			action: function (context, actionName, arg1) {
				if (actionName == 'new-value') {
					context.data.setValue(arg1);
				}
			},
			render: function (element, data, context) {
				if (element.contentEditable !== null) {
					element.innerHTML = '<div class="json-string json-string-content-editable">' + escapeHtml(data.value()).replace(/\n/g, "<br>") + '</div>';
					var valueSpan = element.childNodes[0];
					valueSpan.contentEditable = "true";
					valueSpan.onblur = function () {
						var newString = getText(valueSpan);
						data.setValue(newString);
					};
					return;
				}
			},
			update: function (element, data, context, operation) {
				if (element.contentEditable !== null) {
					var valueSpan = element.childNodes[0];
					valueSpan.innerHTML = escapeHtml(data.value()).replace(/\n/g, "<br>");
					return false;
				};
				if (operation.action() == "replace") {
					var textarea = null;
					for (var i = 0; i < element.childNodes.length; i++) {
						if (element.childNodes[i].tagName.toLowerCase() == "textarea") {
							textarea = element.childNodes[i];
							break;
						}
					}				
					textarea.value = data.value();
					textarea.onkeyup();
					return false;
				} else {
					return true;
				}
			},
			filter: {
				type: 'string',
				readOnly: false
			}
		});
	
		// Display/edit boolean	
		Jsonary.render.register({
			name: "Jsonary plain booleans",
			renderHtml: function (data, context) {
				if (data.readOnly()) {
					if (data.value()) {
						return '<span class="json-boolean-true">yes</span>';
					} else {
						return '<span class="json-boolean-false">no</span>';
					}
				}
				var result = "";
				var inputName = context.inputNameForAction('switch');
				return '<input type="checkbox" class="json-boolean" name="' + inputName + '" value="1" ' + (data.value() ? 'checked' : '' ) + '></input>';
			},
			action: function (context, actionName, arg1) {
				if (actionName == "switch") {
					context.data.setValue(!!arg1);
				}
			},
			filter: {
				type: 'boolean'
			}
		});
		
		// Edit number
		Jsonary.render.register({
			name: "Jsonary plain edit number",
			renderHtml: function (data, context) {
				var style = "";
				if (data.value().toString().length > 3) {
					var width = data.value().toString().length;
					style = 'style="width: ' + width + 'em;"';
				}
				var result = '<input class="json-number-input" type="text" value="' + data.value() + '" name="' + context.inputNameForAction('input') + '" ' + style + '></input>';
				
				var interval = data.schemas().numberInterval();
				if (interval != undefined) {
					var minimum = data.schemas().minimum();
					if (minimum == null || data.value() > minimum + interval || data.value() == (minimum + interval) && !data.schemas().exclusiveMinimum()) {
						result = context.actionHtml('<span class="json-number-decrement button">-</span>', 'decrement') + result;
					} else {
						result = '<span class="json-number-decrement button disabled" onmousedown="event.preventDefault();">-</span>' + result;
					}
					
					var maximum = data.schemas().maximum();
					if (maximum == null || data.value() < maximum - interval || data.value() == (maximum - interval) && !data.schemas().exclusiveMaximum()) {
						result += context.actionHtml('<span class="json-number-increment button">+</span>', 'increment');
					} else {
						result += '<span class="json-number-increment button disabled" onmousedown="event.preventDefault;">+</span>';
					}
				}
				return '<span class="json-number">' + result + '</span>';
			},
			action: function (context, actionName, arg1) {
				var data = context.data;
				var interval = data.schemas().numberInterval();
				if (actionName == "increment") {
					var value = data.value() + interval;
					var valid = true;
					var maximum = data.schemas().maximum();
					if (maximum != undefined) {
						if (value > maximum || (value == maximum && data.schemas().exclusiveMaximum())) {
							valid = false;
						}
					}
					if (valid) {
						data.setValue(value);
					}
				} else if (actionName == "decrement") {
					var value = data.value() - interval;
					var valid = true;
					var minimum = data.schemas().minimum();
					if (minimum != undefined) {
						if (value < minimum || (value == minimum && data.schemas().exclusiveMinimum())) {
							valid = false;
						}
					}
					if (valid) {
						data.setValue(value);
					}
				} else if (actionName == "input") {
					var newValueString = arg1
					var value = parseFloat(newValueString);
					if (!isNaN(value)) {
						if (interval != undefined) {
							value = Math.round(value/interval)*interval;
						}
						var valid = true;
						var minimum = data.schemas().minimum();
						if (minimum != undefined) {
							if (value < minimum || (value == minimum && data.schemas().exclusiveMinimum())) {
								valid = false;
							}
						}
						var maximum = data.schemas().maximum();
						if (maximum != undefined) {
							if (value > maximum || (value == maximum && data.schemas().exclusiveMaximum())) {
								valid = false;
							}
						}
						if (!valid) {
							value = data.schemas().createValueNumber();
						}
						data.setValue(value);
					}
				}
			},
			filter: {
				type: ['number', 'integer'],
				readOnly: false
			}
		});
	
		// Edit enums
		Jsonary.render.register({
			name: "Jsonary plain enums",
			render: function (element, data, context) {
				var enumValues = data.schemas().enumValues();
				if (enumValues.length == 0) {
					element.innerHTML = '<span class="json-enum-invalid">invalid</span>';
					return;
				} else if (enumValues.length == 1) {
					if (typeof enumValues[0] == "string") {
						element.innerHTML = '<span class="json-string">' + escapeHtml(enumValues[0]) + '</span>';
					} else if (typeof enumValues[0] == "number") {
						element.innerHTML = '<span class="json-number">' + enumValues[0] + '</span>';
					} else if (typeof enumValues[0] == "boolean") {
						var text = (enumValues[0] ? "true" : "false");
						element.innerHTML = '<span class="json-boolean-' + text + '">' + text + '</span>';
					} else {
						element.innerHTML = '<span class="json-raw">' + escapeHtml(JSON.stringify(enumValues[0])) + '</span>';
					}
					return;
				}
				var select = document.createElement("select");
				for (var i = 0; i < enumValues.length; i++) {
					var option = document.createElement("option");
					option.setAttribute("value", i);
					if (data.equals(Jsonary.create(enumValues[i]))) {
						option.selected = true;
					}
					option.appendChild(document.createTextNode(enumValues[i]));
					select.appendChild(option);
				}
				select.onchange = function () {
					var index = this.value;
					data.setValue(enumValues[index]);
				}
				element.appendChild(select);
				element = select = option = null;
			},
			filter: {
				readOnly: false,
				filter: function (data, schemas) {
					return schemas.enumValues() != null;
				}
			}
		});
	
	})(this);
	

/**** string-formats.js ****/

	(function () {
		// Display string
		Jsonary.render.register({
			renderHtml: function (data, context) {
				var date = new Date(data.value());
				if (isNaN(date.getTime())) {
					return '<span class="json-string json-string-date">' + Jsonary.escapeHtml(data.value()) + '</span>';
				} else {
					return '<span class="json-string json-string-date">' + date.toLocaleString() + '</span>';
				}
			},
			filter: {
				type: 'string',
				readOnly: true,
				filter: function (data, schemas) {
					return schemas.formats().indexOf("date-time") != -1;
				}
			}
		});
		
		// Display string
		Jsonary.render.register({
			renderHtml: function (data, context) {
				if (data.readOnly()) {
					if (context.uiState.showPassword) {
						return Jsonary.escapeHtml(data.value());
					} else {
						return context.actionHtml('(show password)', 'show-password');
					}
				} else {
					var inputName = context.inputNameForAction('update');
					return '<input type="password" name="' + inputName + '" value="' + Jsonary.escapeHtml(data.value()) + '"></input>';
				}
			},
			action: function (context, actionName, arg1) {
				if (actionName == "show-password") {
					context.uiState.showPassword = true;
					return true;
				} else if (actionName == "update") {
					context.data.setValue(arg1);
				}
			},
			filter: {
				type: 'string',
				filter: function (data, schemas) {
					return schemas.formats().indexOf("password") != -1;
				}
			}
		});
	})();
	

/**** jsonary.location.js ****/

	(function (global) {
		var api = {
			query: Jsonary.create(null),
			queryVariant: 'pretty',
			useHistory: true
		};
	
		if (typeof window == 'undefined') {
			// None of the methods, but include the config
			Jsonary.extend({
				location: api
			});
			return;
		}
		
		var changeListeners = [];
		api.onChange = function (callbackFunction, immediate) {
			start();
			
			var disableCount = 0;
			var callback = function () {
				if (disableCount <= 0) {
					callbackFunction.apply(this, arguments);
				}
			};
			changeListeners.push(callback);
			if (immediate || immediate == undefined) {
				callback.call(api, api, api.query);
			}
			return {
				ignore: function (action) {
					this.disable();
					action();
					this.enable();
				},
				enable: function () {
					disableCount--;
				},
				disable: function () {
					disableCount++;
				}
			};
		};
		var addHistoryPoint = false;
		api.addHistoryPoint = function () {
			addHistoryPoint = true;
		};
		api.replace = function (newHref, notify) {
			start();
			var oldHref = window.location.href;
			newHref = Jsonary.Uri.resolve(oldHref, newHref);
			if (notify == undefined) {
				notify = true;
			}
	
			if (api.useHistory && window.history && window.history.pushState && window.history.replaceState) {
				if (addHistoryPoint) {
					window.history.pushState({}, "", newHref);
				} else {
					window.history.replaceState({}, "", newHref);
				}
			} else {
				// Using fragment - figure out shorter version if possible
				var withoutHash = newHref.split('#')[0];
				var withoutHashCurrent = window.location.href.split('#')[0];
				if (withoutHash == withoutHashCurrent) {
					newHref = '';
				} else if (withoutHash.split('?')[0] == withoutHashCurrent.split('?')[0]) {
					newHref = '?' + newHref.split('?').slice(1).join('?');
				} else if (newHref.split('/').slice(0, 3).join('/') == window.location.href.split('/').slice(0, 3).join('/')) {
					newHref = '/' + newHref.split('/').slice(3).join('/');
				}
				if (addHistoryPoint) {
					window.location.href = '#' + newHref.replace(/%23/g, '#');
				} else {
					window.location.replace('#' + newHref.replace(/%23/g, '#'));
				}
			}
			if (newHref != oldHref) {
				addHistoryPoint = false;
			}
			api.base = newHref.split(/[?#]/)[0];
			lastHref = window.location.href;
			if (notify) {
				for (var i = 0; i < changeListeners.length; i++) {
					changeListeners[i].call(api, api, api.query);
				}
			}
		}
	
		var ignoreUpdate = false;
		var lastHref = null;
		function update() {
			if (window.location.href == lastHref) {
				return;
			}
			lastHref = window.location.href;
			var fragment = lastHref.split('#').slice(1).join('#');
			var resolved = Jsonary.Uri.resolve(lastHref.split('#')[0], fragment);
			api.resolved = resolved;
			
			var uri = new Jsonary.Uri(resolved);
			uri.scheme = uri.domain = uri.port = uri.username = uri.password = uri.doubleSlash = null;
			api.trailing = uri.toString();
	
			ignoreUpdate = true;
			api.base = resolved.split('?')[0];
			var queryString = resolved.split('?').slice(1).join('?');
			if (queryString) {
				api.query.setValue(Jsonary.decodeData(queryString, 'application/x-www-form-urlencoded', api.queryVariant));
			} else {
				api.query.setValue({});
			}
			ignoreUpdate = false;
	
			if (started && window.history && api.useHistory && window.location.href !== api.resolved) {
				updateLocation(false);
			}
	
			for (var i = 0; i < changeListeners.length; i++) {
				changeListeners[i].call(api, api, api.query);
			}
		}
		api.parse = function (uri) {
			var result = {};
			var fragment = uri.split('#').slice(1).join('#');
			var resolved = Jsonary.Uri.resolve(uri.split('#')[0], fragment);
			result.resolved = resolved;
	
			result.base = resolved.split('?')[0];
			var queryString = resolved.split('?').slice(1).join('?');
			if (queryString) {
				result.query = Jsonary.create(Jsonary.decodeData(queryString, 'application/x-www-form-urlencoded', api.queryVariant));
			} else {
				result.query = Jsonary.create({});
			}
			return result;
		}
		
		function updateLocation(notify) {
			start();
			var queryString = Jsonary.encodeData(api.query.value(), "application/x-www-form-urlencoded", api.queryVariant);
			var newHref = api.base + "?" + queryString;
	
			api.replace(newHref, notify);
			lastHref = window.location.href;
		}
		api.query.document.registerChangeListener(function () {
			if (ignoreUpdate) {
				return;
			}
			updateLocation(true);
		});
	
		Jsonary.extend({
			location: api
		});	
	
		var started = false;
		var start = function () {
			started = true;
		};
	
		if ("onhashchange" in window) {
			window.onhashchange = update;
		}
		if ("onpopstate" in window) {
			window.onpopstate = update;
		}
		setInterval(update, 100);
		update();
	})(this);
	

/**** jsonary.route.js ****/

	(function (Jsonary) {
		function Route(templateStr, handlerFunction) {
			this.template = Jsonary.UriTemplate(templateStr);
			this.templateString = templateStr;
			this.run = handlerFunction;
		}
		Route.prototype = {
			test: function (url) {
				var params = this.template.fromUri(url);
				if (params && this.template.fillFromObject(params) === url) {
					return params;
				}
			},
			url: function (params) {
				return this.template.fillFromObject(params);
			}
		};
		
		function getCurrent() {
			return Jsonary.location.base.replace(/^[^:]*:\/\/[^/]*/, '').replace(/[?#].*$/, '');
		}
	
		var routes = [];
		var extraData = {};
		function runRoutes() {
			var url = getCurrent(), query = Jsonary.location.query;
			var params;
			for (var i = 0; i < routes.length; i++) {
				var route = routes[i];
				if (params = route.test(url)) {
					var result = route.run(params, query, extraData);
					if (result !== false) {
						return; 
					}
				}
			}
		}
		var pending = false;
		function runRoutesLater() {
			extraData = {};
			if (pending) return;
			pending = true;
			setTimeout(function () {
				pending = false;
				runRoutes();
			}, 25);
		}
	
		var locationMonitor = Jsonary.location.onChange(runRoutesLater, false);
	
		var api = Jsonary.route = function (template, handler) {
			var route = new Route(template, handler);
			routes.push(route);
			runRoutesLater();
			return route;
		};
		api.shortUrl = function (url) {
			var shortUrl = url.replace(/#$/, "");
			var urlBase = Jsonary.baseUri;
			if (url.substring(0, urlBase.length) == urlBase) {
				shortUrl = url.substring(urlBase.length) || "./";
			}
			return shortUrl;
		};
		api.set = function (path, query, extra) {
			query = query ||Jsonary.location.query.get();
			var newHref = (path || '').replace(/\?$/, '');
			if (Object.keys(query).length) {
				newHref += (newHref.indexOf('?') !== -1) ? '&' : '?';
				newHref += Jsonary.encodeData(query, 'application/x-www-form-urlencoded', Jsonary.location.queryVariant);
			}
			Jsonary.location.replace(newHref);
			extraData = extra || {};
		};
	
	})(Jsonary);

/**** jsonary.popup.js ****/

	if (typeof window !== 'undefined') {
		function escapeHtml(text) {
			text += "";
			return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
		}
		
		(function (window) {
			function copyStyle(oldDoc, newDoc) {
				var links = oldDoc.getElementsByTagName('link');
				for (var i = 0; i < links.length; i++) {
					var oldElement = links[i];
					newDoc.write('<link href="' + escapeHtml(oldElement.href) + '" rel="' + escapeHtml(oldElement.rel || "") + '">');
				}
				var styles = oldDoc.getElementsByTagName('style');
				for (var i = 0; i < styles.length; i++) {
					var oldElement = styles[i];
					newDoc.write('<style>' + oldElement.innerHTML + '</style>');
				}
			}
	
			var scriptConditions = [];
			function shouldIncludeScript(url) {
				for (var i = 0; i < scriptConditions.length; i++) {
					if (scriptConditions[i].call(null, url)) {
						return true;
					}
				}
				return false;
			}
			
			function copyScripts(oldDoc, newDoc) {
				var scripts = oldDoc.getElementsByTagName('script');
				for (var i = 0; i < scripts.length; i++) {
					var oldElement = scripts[i];
					if (oldElement.src && shouldIncludeScript(oldElement.src)) {
						newDoc.write('<script src="' + escapeHtml(oldElement.src) + '"></script>');
					}
				}
			}
			
			var setupFunctions = [];
			var preSetupFunctions = [];
			
			Jsonary.popup = function (params, title, openCallback, closeCallback, closeWithParent) {
				if (closeWithParent === undefined) {
					closeWithParent = true;
				}
				if (typeof params === 'object') {
					var newParams = [];
					for (var key in params) {
						if (typeof params[key] == 'boolean') {
							newParams.push(key + '=' + (params[key] ? 'yes' : 'no'));
						} else {
							newParams.push(key + '=' + params[key]);
						}
					}
					params = newParams.join(',');
				}
				var subWindow = window.open(null, null, params);
				subWindow.document.open();
				subWindow.document.write('<html><head><title>' + escapeHtml(title || "Popup") + '</title>');
				copyStyle(window.document, subWindow.document);
				copyScripts(window.document, subWindow.document);
				subWindow.document.write('</head><body class="jsonary popup"></body></html>');
				subWindow.document.close();
				Jsonary.render.addDocument(subWindow.document);
				
				var parentBeforeUnloadListener = function (evt) {
					if (closeWithParent) {
						subWindow.close();
					}
					Jsonary.render.removeDocument(window.document);
				};
				var beforeUnloadListener = function (evt) {
					evt = evt || window.event;
					Jsonary.render.removeDocument(subWindow.document);
					// Remove parent's unload listener, as that will leak the sub-window (including the entire document tree)
					if (window.removeEventListener) {
						window.removeEventListener('beforeunload', parentBeforeUnloadListener, false);
					} else if (window.detachEvent) {
						window.detachEvent('onbeforeunload', parentBeforeUnloadListener);
					}
					if (closeCallback) {
						var result = closeCallback(evt);
						if (evt) {
							evt.returnValue = result;
						}
						return result;
					}
				}
				var onLoadListener = function (evt) {
					evt = evt || window.event;
					for (var i = 0; i < setupFunctions.length; i++) {
						setupFunctions[i].call(subWindow.window, subWindow.window, subWindow.document);
					}
					if (openCallback) {
						return openCallback.call(subWindow.window, subWindow.window, subWindow.document);
					}
				};
				if (subWindow.addEventListener) {
					subWindow.addEventListener('load', onLoadListener, false); 
					subWindow.addEventListener('beforeunload', beforeUnloadListener, false); 
					window.addEventListener('beforeunload', parentBeforeUnloadListener, false);
				} else if (subWindow.attachEvent)  {
					subWindow.attachEvent('onload', onLoadListener);
					subWindow.attachEvent('onbeforeunload', beforeUnloadListener);
					window.attachEvent('onbeforeunload', parentBeforeUnloadListener);
				}
				
				for (var i = 0; i < preSetupFunctions.length; i++) {
					preSetupFunctions[i].call(subWindow.window, subWindow.window);
				}
	
				return subWindow;
			};
			
			Jsonary.popup.addScripts = function (scripts) {
				if (typeof scripts == 'boolean') {
					scriptConditions.push(function () {
						return scripts;
					});
				}
				if (typeof scripts == 'function') {
					scriptConditions.push(scripts);
				}
				for (var i = 0; i < scripts.length; i++) {
					(function (search) {
						if (search instanceof RegExp) {
							scriptConditions.push(function (url) {
								return search.test(url);
							});
						} else {
							scriptConditions.push(function (url) {
								return url.indexOf('search') !== -1;
							});
						}
					})(scripts[i]);
				}
				return this;
			};
			
			Jsonary.popup.addPreSetup = function (callback) {
				preSetupFunctions.push(callback);
				return this;
			};
	
			Jsonary.popup.addSetup = function (callback) {
				setupFunctions.push(callback);
				return this;
			};
		})(window);
	}

/**** jsonary.undo.js ****/

	(function () {
		if (typeof window == 'undefined') {
			return;
		}
		
		var modKeyDown = false;
		var shiftKeyDown = false;
		var otherKeys = {};
	
		// Register key down/up listeners to catch undo/redo key combos
		document.onkeydown = function (e) {
			var keyCode = (window.event != null) ? window.event.keyCode : e.keyCode;
			if (keyCode == 17 || keyCode == 91) {
				modKeyDown = true;
			} else if (keyCode == 16) {
				shiftKeyDown = true;
			} else {
				otherKeys[keyCode] = true;
			}
			var otherKeyCount = 0;
			for (var otherKeyCode in otherKeys) {
				if (otherKeyCode != 90 && otherKeyCode != 89) {
					otherKeyCount++;
				}
			}
			if (otherKeyCount == 0) {
				if (keyCode == 90) {	// Z
					if (modKeyDown) {
						if (shiftKeyDown) {
							Jsonary.redo();
						} else {
							Jsonary.undo();
						}
					}
				} else if (keyCode == 89) {	// Y
					if (modKeyDown && !shiftKeyDown) {
						Jsonary.redo();
					}
				}
			}
		};
		document.onkeyup = function (e) {
			var keyCode = (window.event != null) ? window.event.keyCode : e.keyCode;
			if (keyCode == 17 || keyCode == 91) {
				modKeyDown = false;
			} else if (keyCode == 16) {
				shiftKeyDown = false;
			} else {
				delete otherKeys[keyCode];
			}
		};
		
		var undoList = [];
		var redoList = [];
		var ignoreChanges = 0;
		
		Jsonary.registerChangeListener(function (patch, document) {
			if (ignoreChanges > 0) {
				ignoreChanges--;
				return;
			}
			if (document.readOnly) {
				return;
			}
			var rendered = false;
			for (var i = 0; !rendered && i < patch.operations.length; i++) {
				var operation = patch.operations[i];
				var affectedData = document.affectedData(operation);
				for (var j = 0; j < affectedData.length; j++) {
					var data = affectedData[j];
					if (Jsonary.render.rendered(data)) {
						rendered = true;
						break;
					}
				}
			}
			if (!rendered) {
				return;
			}
			undoList.push({patch: patch, document: document});
			while (undoList.length > Jsonary.undo.historyLength) {
				undoList.shift();
			}
			if (redoList.length > 0) {
				redoList = [];
			}
		});
		
		Jsonary.extend({
			undo: function () {
				var lastChange = undoList.pop();
				if (lastChange != undefined) {
					ignoreChanges++;
					redoList.push(lastChange);
					lastChange.document.patch(lastChange.patch.inverse());
				}
			},
			redo: function () {
				var nextChange = redoList.pop();
				if (nextChange != undefined) {
					ignoreChanges++;
					undoList.push(nextChange);
					nextChange.document.patch(nextChange.patch);
				}
			}
		});
		Jsonary.undo.historyLength = 10;
	})();
	

/**** jsonary.jstl.js ****/

	(function (publicApi) {
		var templateMap = {};
		var loadedUrls = {};
		function loadTemplates(url) {
			if (url == undefined) {
				if (typeof document == "undefined") {
					return;
				}
				var scripts = document.getElementsByTagName("script");
				var lastScript = scripts[scripts.length - 1];
				url = lastScript.getAttribute("src");
			}
			if (loadedUrls[url]) {
				return;
			}
			loadedUrls[url] = true;
	
			var code = "";
			if (typeof XMLHttpRequest != 'undefined') {
				// In browser
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url, false);
				xhr.send();
				code = xhr.responseText;
			} else if (typeof require != 'undefined') {
				// Server-side
				var fs = require('fs');
				code = fs.readFileSync(url).toString();
			}
	
			var parts = (" " + code).split(/\/\*\s*[Tt]emplate:/);
			parts.shift();
			for (var i = 0; i < parts.length; i++) {
				var part = parts[i];
				part = part.substring(0, part.indexOf("*/"));
				var endOfLine = part.indexOf("\n");
				var key = part.substring(0, endOfLine).trim();
				var template = part.substring(endOfLine + 1);
				templateMap[key] = template;
			}
		}
		function getTemplate(key) {
			loadTemplates();
			var rawCode = templateMap[key];
			if (rawCode) {
				return create(rawCode);
			}
			return null;
		}
		function create(rawCode) {
			return {
				toString: function () {return this.code;},
				code: rawCode,
				compile: function (directEvalFunction, constFunctions, additionalParams) {
					return compile(this.code, directEvalFunction, constFunctions, additionalParams);
				}
			};
		}
	
		function compile(template, directEvalFunction, headerText, additionalParams) {
			if (directEvalFunction == undefined) {
				directEvalFunction = publicApi.defaultFunction;
			}
			if (headerText == undefined) {
				headerText = publicApi.defaultHeaderCode;
			}
			if (additionalParams == undefined) {
				additionalParams = {};
			}
			var constants = [];
			var variables = [];
			
			var substitutionFunctionName = "subFunc" + Math.floor(Math.random()*1000000000);
			var jscode = '(function () {\n';
			
			var directFunctions = [];
			var directFunctionVarNames = [];
			for (var key in additionalParams) {
				if (additionalParams[key]) {
					directFunctionVarNames.push(key);
					directFunctions.push(additionalParams[key]);
				}
			}
			var parts = (" " + template).split(/<\?js|<\?|<%/g);
			var initialString = parts.shift().substring(1);
			if (headerText) {
				jscode += "\n" + headerText + "\n";
			}
			jscode += '	var _arguments = arguments;\n';
			if (additionalParams['echo'] !== undefined) {
				jscode += '	echo(' + JSON.stringify(initialString) + ');\n';
			} else {
				var resultVariableName = "result" + Math.floor(Math.random()*1000000000);
				jscode += '	var ' + resultVariableName + ' = ' + JSON.stringify(initialString) + ';\n';
				jscode += '	var echo = function (str) {' + resultVariableName + ' += str;};\n';
			}
			while (parts.length > 0) {
				var part = parts.shift();
				var endIndex = part.match(/\?>|%>/).index;
				var embeddedCode = part.substring(0, endIndex);
				var constant = part.substring(endIndex + 2);
				
				if (/\s/.test(embeddedCode.charAt(0))) {
					jscode += "\n" + embeddedCode + "\n";
				} else {
					var directFunction = directEvalFunction(embeddedCode) || defaultFunction(embeddedCode);
					if (typeof directFunction == "string") {
						jscode += "\n\t	echo(" + directFunction + ");\n";
					} else {
						directFunctions.push(directFunction);
						var argName = "fn" + Math.floor(Math.random()*10000000000);
						directFunctionVarNames.push(argName);
						jscode += "\n	echo(" + argName + ".apply(this, _arguments));\n";
					}
				}
				
				jscode += '	echo(' + JSON.stringify(constant) + ');\n';
			}
			if (additionalParams['echo'] !== undefined) {
				jscode += '\n	return "";\n})';
			} else {
				jscode += '\n	return ' + resultVariableName + ';\n})';
			}
			
			//console.log("\n\n" + jscode + "\n\n");
			
			var f = Function.apply(null, directFunctionVarNames.concat(["return " + jscode]));
			return f.apply(null, directFunctions);
		}
		
		function defaultFunction(varName) {
			return function (data) {
				var string = "" + data[varName];
				return string.replace("&", "&amp;").replace("<", "&lt;").replace(">", "gt;").replace('"', "&quot;").replace("'", "&#39;");
			};
		};
		
		publicApi.loadTemplates = loadTemplates;
		publicApi.getTemplate = getTemplate;
		publicApi.create = create;
		publicApi.defaultFunction = defaultFunction;
		publicApi.defaultHeaderCode = "var value = arguments[0];";
	})((typeof module !== 'undefined' && module.exports) ? exports : (this.jstl = {}, this.jstl));
	
	// Jsonary plugin
	(function (Jsonary) {
		
		var headerCode = [
			'var data = arguments[0], context = arguments[1];',
			'function want(path) {',
			'	var subData = data.subPath(path);',
			'	return subData.defined() || !subData.readOnly();',
			'};',
			'function action(html, actionName) {',
			'echo(context.actionHtml.apply(context, arguments));',
			'};',
			'function render(subData, label) {',
			'	echo(context.renderHtml(subData, label));',
			'};'
		].join("\n");
		var substitutionFunction = function (path) {
			if (path == "$") {
				return function (data, context) {
					return context.renderHtml(data);
				};
			} else if (path.charAt(0) == "/") {
				return function (data, context) {
					return context.renderHtml(data.subPath(path));
				};
			} else if (path.charAt(0) == "=") {
				return 'window.escapeHtml(' + path.substring(1) + ')';
			} else {
				return function (data, context) {
					var string = "" + data.propertyValue(path);
					return string.replace("&", "&amp;").replace("<", "&lt;").replace(">", "gt;").replace('"', "&quot;").replace("'", "&#39;");
				}
			}
		};
		
		Jsonary.extend({
			template: function (key) {
				var template = jstl.getTemplate(key);
				if (template == null) {
					throw new Exception("Could not locate template: " + key);
				}
				return template.compile(substitutionFunction, headerCode);
			},
			loadTemplates: function () {
				jstl.loadTemplates();
			}
		});
	})(Jsonary);
	

/**** jsonary.render.table.js ****/

	(function (Jsonary) {
	
		function TableRenderer (config) {
			if (!(this instanceof TableRenderer)) {
				return new TableRenderer(config);
			}
			var thisRenderer = this;
			
			config = config || {};
			this.config = config;
			
			for (var key in TableRenderer.defaults) {
				if (!config[key]) {
					if (typeof TableRenderer.defaults[key] == "function") {
						config[key] = TableRenderer.defaults[key];
					} else {
						config[key] = JSON.parse(JSON.stringify(TableRenderer.defaults[key]));
					}
				}
			}
			
			for (var i = 0; i < config.columns.length; i++) {
				var columnPath = config.columns[i];
				config.cellRenderHtml[key] = config.cellRenderHtml[key] || config.defaultCellRenderHtml;
				config.titleHtml[key] = config.titleHtml[key] || config.defaultTitleHtml;
			}
			
			config.rowRenderHtml = this.wrapRowFunction(config, config.rowRenderHtml);
			for (var key in config.cellRenderHtml) {
				config.cellRenderHtml[key] = this.wrapCellFunction(config, config.cellRenderHtml[key], key);
			}
			for (var key in config.titleHtml) {
				config.titleHtml[key] = this.wrapTitleFunction(config, config.titleHtml[key], key);
			}
	
			if (config.filter) {
				this.filter = function (data, schemas) {
					return config.filter(data, schemas);
				};
			}
			
			this.addColumn = function (key, title, renderHtml) {
				config.columns.push(key);
				if (typeof title == 'function') {
					config.titleHtml[key] = thisRenderer.wrapTitleFunction(config, title, key);
				} else {
					if (title != undefined) {
						config.titles[key] = title;
					}
					config.titleHtml[key] = thisRenderer.wrapTitleFunction(config, config.defaultTitleHtml, key);
				}
				renderHtml = renderHtml || config.defaultCellRenderHtml;
				config.cellRenderHtml[key] = thisRenderer.wrapCellFunction(config, renderHtml, key);
				return this;
			}
			
			this.component = config.component;
		};
		TableRenderer.prototype = {
			wrapRowFunction: function (functionThis, original) {
				var thisRenderer = this;
				return function (rowData, context) {
					var rowContext = thisRenderer.rowContext(rowData, context);
					return original.call(functionThis, rowData, rowContext);
				};
			},
			wrapTitleFunction: function (functionThis, original, columnKey) {
				var thisRenderer = this;
				return function (cellData, context) {
					var titleContext = context;
					return original.call(functionThis, cellData, titleContext, columnKey);
				}
			},
			wrapCellFunction: function (functionThis, original, columnKey) {
				var thisRenderer = this;
				return function (cellData, context) {
					var cellContext = thisRenderer.cellContext(cellData, context, columnKey);
					return original.call(functionThis, cellData, cellContext, columnKey);
				}
			},
			action: function (context, actionName) {
				var thisRenderer = this;
				if (context.label.substring(0, 3) == "col" && !context.get('cellData')) {
					// Recover cellData when running server-side
					var columnPath = context.label.substring(3);
					var rowContext = context.parent;
					var tableContext = rowContext.parent;
					context.data.items(function (index, rowData) {
						if (thisRenderer.rowContext(rowData, tableContext).uniqueId == rowContext.uniqueId) {
							var cellData = (columnPath == "" || columnPath.charAt(0) == "/") ? rowData.subPath(columnPath) : rowData;
							thisRenderer.cellContext(cellData, rowContext, columnPath); // Sets cellData on the appropriate context
						}
					});
				} else if (context.label.substring(0, 3) == "row" && !context.get('rowData')) {
					// Recover rowData when running server-side
					var tableContext = context.parent;
					context.data.items(function (index, rowData) {
						thisRenderer.rowContext(rowData, tableContext); // Sets rowData on the appropriate context
					});
				}
				if (context.get('cellData')) {
					var columnPath = context.get('columnPath');
	
					var cellAction = this.config.cellAction[columnPath];
					var newArgs = [context.get('cellData')];
					while (newArgs.length <= arguments.length) {
						newArgs.push(arguments[newArgs.length - 1]);
					}
					return cellAction.apply(this.config, newArgs);
				} else if (context.get('rowData')) {
					var rowAction = this.config.rowAction;
					var newArgs = [context.get('rowData')];
					while (newArgs.length <= arguments.length) {
						newArgs.push(arguments[newArgs.length - 1]);
					}
					return rowAction.apply(this.config, newArgs);
				}
				var newArgs = [context.data];
				while (newArgs.length <= arguments.length) {
					newArgs.push(arguments[newArgs.length - 1]);
				}
				return this.config.action.apply(this.config, newArgs);
			},
			rowContext: function (data, context) {
				var rowLabel = "row" + context.labelForData(data);
				var subContext = context.subContext(rowLabel);
				subContext.set('rowData', data);
				return subContext;
			},
			cellContext: function (data, context, columnPath) {
				var subContext = context.subContext('col' + columnPath);
				subContext.set('columnPath', columnPath);
				subContext.set('cellData', data);
				return subContext;
			},
			renderHtml: function (data, context) {
				return this.config.tableRenderHtml(data, context);
			},
			rowRenderHtml: function (data, context) {
				var config = this.config;
				return config.rowRenderHtml(data, context);
			},
			enhance: function (element, data, context) {
				if (this.config.enhance) {
					return this.config.enhance(element, data, context);
				} else if (this.config.render) {
					return this.config.render(element, data, context);
				}
			},
			update: function (element, data, context, operation) {
				if (this.config.update) {
					this.config.defaultUpdate = this.config.defaultUpdate || this.defaultUpdate;
					return this.config.update.apply(this, arguments);
				}
				return this.defaultUpdate.apply(this, arguments);
			},
			linkHandler: function () {
				if (this.config.linkHandler) {
					return this.config.linkHandler.apply(this.config, arguments);
				}
			},
			register: function(filterFunction) {
				if (filterFunction) {
					this.filter = filterFunction;
				}
				return Jsonary.render.register(this);
			}
		};
		TableRenderer.defaults = {
			columns: [],
			titles: {},
			titleHtml: {},
			defaultTitleHtml:  function (data, context, columnPath) {
				return '<th>' + Jsonary.escapeHtml(this.titles[columnPath] != undefined ? this.titles[columnPath] : columnPath) + '</th>';
			},
			cellRenderHtml: {},
			defaultCellRenderHtml: function (cellData, context, columnPath) {
				return '<td data-column="' + Jsonary.escapeHtml(columnPath) + '">' + context.renderHtml(cellData, columnPath) + '</td>';
			},
			cellAction: {},
			rowRenderHtml: function (rowData, context) {
				var result = "<tr>";
				for (var i = 0; i < this.columns.length; i++) {
					var columnPath = this.columns[i];
					var cellData = (columnPath == "" || columnPath.charAt(0) == "/") ? rowData.subPath(columnPath) : rowData;
					var cellRenderHtml = this.cellRenderHtml[columnPath];
					result += this.cellRenderHtml[columnPath](cellData, context, columnPath);
				}
				result += '</tr>';
				return result;
			},
			rowAction: function (data, context, actionName) {
				throw new Error("Unknown row action: " + actionName);
			},
			tableRenderHtml: function (data, context) {
				var result = '';
				result += '<table class="json-array-table">';
				result += this.tableHeadRenderHtml(data, context);
				result += this.tableBodyRenderHtml(data, context);
				result += '</table>';
				return result;
			},
			tableHeadRenderHtml: function (data, context) {
				var result = '<thead><tr>';
				for (var i = 0; i < this.columns.length; i++) {
					var columnPath = this.columns[i];
					result += this.titleHtml[columnPath](data, context);
				}
				return result + '</tr></thead>';
			},
			rowOrder: function (data, context) {
				var result = [];
				var length = data.length;
				while (result.length < length) {
					result[result.length] = result.length;
				}
				return result;
			},
			tableBodyRenderHtml: function (data, context) {
				var config = this.config;
				var result = '<tbody>';
				
				var rowOrder = this.rowOrder(data, context);
				for (var i = 0; i < rowOrder.length; i++) {
					var rowData = data.item(rowOrder[i]);
					result += this.rowRenderHtml(rowData, context);
				}
				
				if (!data.readOnly()) {
					if (data.schemas().maxItems() == null || data.schemas().maxItems() > data.length()) {
						result += '<tr><td colspan="' + this.columns.length + '" class="json-array-table-add">';
						result += context.actionHtml('+ add', 'add');
						result += '</td></tr>';
					}
				}
				return result + '</tbody>';
			},
			action: function (data, context, actionName) {
				if (actionName == "add") {
					var index = data.length();
					var schemas = data.schemas().indexSchemas(index);
					schemas.createValue(function (value) {
						data.push(value);
					});
					return false;
				}
			}
		};
		
		/** Fancy tables with sorting and links **/
		function FancyTableRenderer(config) {
			if (!(this instanceof FancyTableRenderer)) {
				return new FancyTableRenderer(config);
			}
			config = config || {};
			this.name = config.name || "FancyTableRenderer";
	
			for (var key in FancyTableRenderer.defaults) {
				if (!config[key]) {
					if (typeof FancyTableRenderer.defaults[key] == "function") {
						config[key] = FancyTableRenderer.defaults[key];
					} else {
						config[key] = JSON.parse(JSON.stringify(FancyTableRenderer.defaults[key]));
					}
				}
			}
			
			for (var key in config.sort) {
				if (typeof config.sort[key] !== 'function') {
					config.sort[key] = config.defaultSort;
				}
			}
			
			if (typeof config.rowsPerPage !== 'function') {
				if (config.serverSide && config.serverSide.rowsPerPage) {
					config.rowsPerPage = function () {
						var value = this.serverSide.rowsPerPage.apply(this, arguments);
						if (!value) {
							return [];
						}
						return Array.isArray(value) ? value : [value];
					};
				} else {
					var rowsPerPageStaticValue = config.rowsPerPage || [];
					if (!Array.isArray(rowsPerPageStaticValue)) {
						rowsPerPageStaticValue = [rowsPerPageStaticValue];
					}
					config.rowsPerPage = function () {
						return rowsPerPageStaticValue.slice(0);
					};
				}
			}
	
			TableRenderer.call(this, config);
			
			var prevAddColumn = this.addColumn;
			this.addColumn = function (key, title, renderHtml, sorting) {
				if (sorting) {
					config.sort[key] = (typeof sorting == 'function') ? sorting : config.defaultSort;
				}
				return prevAddColumn.call(this, key, title, renderHtml);
			};
			
			// Delete column for editable items
			this.addConditionalColumn(function (data) {
				return !data.readOnly() && data.length() > data.schemas().minItems();
			}, "remove", "", function (data, context) {
				var result = '<td class="json-array-table-remove">';
				
				// Check whether a delete is appropriate
				var arrayData = data.parent();
				var tupleTypingLength = arrayData.schemas().tupleTypingLength();
				var minItems = arrayData.schemas().minItems();
				var index = parseInt(data.parentKey());
				if ((index >= tupleTypingLength || index == arrayData.length() - 1)
					&& arrayData.length() > minItems) {
					result += context.actionHtml('<span class="json-array-delete">X</span>', 'remove');
				}
				return result + '</td>';
			});
			config.cellAction.remove = function (data, context, actionName) {
				if (actionName == "remove") {
					data.remove();
					return false;
				}
			};
	
			// Move column for editable items
			this.addConditionalColumn(function (data) {
				return !data.readOnly() && data.length() > (data.schemas().tupleTypingLength() + 1);
			}, "move", function (data, tableContext) {
				if (tableContext.uiState.moveRow != undefined) {
					return '<th style="padding: 0; text-align: center">'
						+ tableContext.actionHtml('<div class="json-array-move-cancel" style="float: left">cancel</div>', 'move-cancel')
						+ '</th>';
				}
				return '<th></th>';
			}, function (data, context) {
				var result = '<td class="json-array-table-move">';
				var tableContext = context.parent.parent;
				
				// Check whether a move is appropriate
				var arrayData = data.parent();
				var tupleTypingLength = arrayData.schemas().tupleTypingLength();
				var index = parseInt(data.parentKey());
				if (index >= tupleTypingLength) {
					if (tableContext.uiState.moveRow == undefined) {
						result += tableContext.actionHtml('<div class="json-array-move json-array-move-start">move</div>', 'move-start', index);
					} else if (tableContext.uiState.moveRow == index) {
						result += tableContext.actionHtml('<div class="json-array-move json-array-move-cancel">cancel</div>', 'move-cancel');
					} else if (tableContext.uiState.moveRow > index) {
						result += tableContext.actionHtml('<div class="json-array-move json-array-move-select json-array-move-up">to here</div>', 'move', tableContext.uiState.moveRow, index);
					} else {
						result += tableContext.actionHtml('<div class="json-array-move json-array-move-select json-array-move-down">to here</div>', 'move', tableContext.uiState.moveRow, index);
					}
				}
				return result + '</td>';
			});
		}
		FancyTableRenderer.prototype = Object.create(TableRenderer.prototype);
		FancyTableRenderer.prototype.addConditionalColumn = function (condition, key, title, renderHtml) {
			var titleAsFunction = (typeof title == 'function') ? title : function (data, context) {
				return '<th>' + Jsonary.escapeHtml(title) + '</th>';
			};
			if (!renderHtml) {
				renderHtml = function (data, context) {
					return this.defaultCellRenderHtml(data, context);
				};
			}
			var titleFunction = function (data, context) {
				if (!condition.call(this, data, context)) {
					return '<th style="display: none"></th>';
				} else {
					return titleAsFunction.call(this, data, context);
				}
			};
			var renderFunction = function (data, cellContext) {
				var tableContext = cellContext.parent.parent;
				if (!condition.call(this, tableContext.data, tableContext)) {
					return '<td style="display: none"></td>';
				} else {
					return renderHtml.call(this, data, cellContext, key);
				}
			};
			this.addColumn(key, titleFunction, renderFunction);
		};
		FancyTableRenderer.prototype.addLinkColumn = function (path, linkRel, title, linkHtml, activeHtml, confirmHtml) {
			var subPath = ((typeof path == "string") && path.charAt(0) == "/") ? path : "";
			if (typeof linkRel == "string") {
				var columnName = "link" + path + "$" + linkRel;
				
				this.addColumn(columnName, title, function (data, context) {
					if (!context.data.readOnly()) {
						return '<td></td>';
					}
					var result = '<td>';
					if (!context.parent.uiState.linkRel) {
						var link = data.subPath(subPath).links(linkRel)[0];
						if (link && data.readOnly()) {
							var html = (typeof linkHtml == 'function') ? linkHtml.call(this, data, context, link) : linkHtml;
							result += context.parent.actionHtml(html, 'link', linkRel, 0, subPath || undefined);
						}
					} else if (activeHtml) {
						var activeLink = data.subPath(subPath).links(context.parent.uiState.linkRel)[context.parent.uiState.linkIndex || 0];
						if (activeLink && activeLink.rel == linkRel) {
							if (typeof confirmHtml == 'string') {
								var html = (typeof confirmHtml == 'function') ? confirmHtml.call(this, data, context, activeLink) : confirmHtml;
								result += context.parent.actionHtml(confirmHtml, 'link-confirm', context.parent.uiState.linkRel, context.parent.uiState.linkIndex, subPath || undefined);
								if (activeHtml) {
									var html = (typeof activeHtml == 'function') ? activeHtml.call(this, data, context, activeLink) : activeHtml;
									result += context.parent.actionHtml(html, 'link-cancel');
								}
							} else if (confirmHtml) {
								var html = (typeof activeHtml == 'function') ? activeHtml.call(this, data, context, activeLink) : activeHtml;
								result += context.parent.actionHtml(html, 'link-confirm', context.parent.uiState.linkRel, context.parent.uiState.linkIndex, subPath || undefined);
							} else if (activeHtml) {
								var html = (typeof activeHtml == 'function') ? activeHtml.call(this, data, context, activeLink) : activeHtml;
								result += context.parent.actionHtml(html, 'link-cancel');
							}
						}
					}
					return result + '</td>';
				});
			} else {
				var linkDefinition = linkRel;
				linkRel = linkDefinition.rel();
				var columnName = "link" + path + "$" + linkRel + "$";
				this.addColumn(columnName, title, function (data, context) {
					var result = '<td>';
					if (!context.parent.uiState.linkRel) {
						var links = data.subPath(subPath).links(linkRel);
						for (var i = 0; i < links.length; i++) {
							var link = links[i];
							if (link.definition = linkDefinition) {
								var html = (typeof linkHtml == 'function') ? linkHtml.call(this, data, context, link) : linkHtml;
								result += context.parent.actionHtml(html, 'link', linkRel, 0, subPath || undefined);
							}
						}
					} else if (activeHtml) {
						var activeLink = data.subPath(subPath).links(context.parent.uiState.linkRel)[context.parent.uiState.linkIndex || 0];
						if (activeLink.definition == linkDefinition) {
							if (typeof confirmHtml == 'string') {
								var html = (typeof confirmHtml == 'function') ? confirmHtml.call(this, data, context, activeLink) : confirmHtml;
								result += context.parent.actionHtml(confirmHtml, 'link-confirm', context.parent.uiState.linkRel, context.parent.uiState.linkIndex, subPath || undefined);
								if (activeHtml) {
									var html = (typeof activeHtml == 'function') ? activeHtml.call(this, data, context, activeLink) : activeHtml;
									result += context.parent.actionHtml(html, 'link-cancel');
								}
							} else if (confirmHtml) {
								var html = (typeof confirmHtml == 'function') ? confirmHtml.call(this, data, context, activeLink) : confirmHtml;
								result += context.parent.actionHtml(html, 'link-confirm', context.parent.uiState.linkRel, context.parent.uiState.linkIndex, subPath || undefined);
							} else if (activeHtml) {
								var html = (typeof activeHtml == 'function') ? activeHtml.call(this, data, context, activeLink) : activeHtml;
								result += context.parent.actionHtml(html, 'link-cancel');
							}
						}
					}
					return result + '</td>';
				});
			}
			return this;
		};
	
		FancyTableRenderer.defaults = {
			sort: {},
			// TODO: "natural" sort
			defaultSort: function (a, b) {
				if (a == null) {
					return (b == null) ? 0 : -1;
				} else if (b == null || a > b) {
					return 1;
				} else if (a < b) {
					return -1;
				}
				return 0;
			},
			serverSide: {},
			rowOrder: function (data, context) {
				var thisConfig = this;
				
				if (thisConfig.serverSide && thisConfig.serverSide.currentSort) {
					var sortResult = thisConfig.serverSide.currentSort.call(this, data, context);
					if (Array.isArray(sortResult)) {
						context.uiState.sort = sortResult;
					} else if (typeof sortResult === 'string') {
						context.uiState.sort = [sortResult];
					}
					var result = [];
					var length = data.length();
					while (result.length < length) {
						result.push(result.length);
					}
					return result;
				}
				
				var sortFunctions = [];
				context.uiState.sort = context.uiState.sort || [];
				
				function addSortFunction(sortIndex, sortKey) {
					var direction = sortKey.split('/')[0];
					var path = sortKey.substring(direction.length);
					var multiplier = (direction == "desc") ? -1 : 1;
					sortFunctions.push(function (a, b) {
						var valueA = a.get(path);
						var valueB = b.get(path);
						var comparison = (typeof thisConfig.sort[path] == 'function') ? thisConfig.sort[path](valueA, valueB) : thisConfig.defaultSort(valueA, valueB);
						return multiplier*comparison;
					});
				}
				for (var i = 0; i < context.uiState.sort.length; i++) {
					addSortFunction(i, context.uiState.sort[i]);
				}
				var indices = [];
				var length = data.length();
				while (indices.length < length) {
					indices[indices.length] = indices.length;
				}
				var maxSortIndex = -1;
				indices.sort(function (a, b) {
					for (var i = 0; i < sortFunctions.length; i++) {
						var comparison = sortFunctions[i](data.item(a), data.item(b));
						if (comparison != 0) {
							maxSortIndex = Math.max(maxSortIndex, i);
							return comparison;
						}
					}
					maxSortIndex = sortFunctions.length;
					return a - b;
				});
				// Trim sort conditions list, for smaller UI state
				context.uiState.sort = context.uiState.sort.slice(0, maxSortIndex + 1);
				return indices;
			},
			rowsPerPage: null,
			pages: function (rowOrder, data, context) {
				if (this.serverSide && this.serverSide.currentPage && this.serverSide.totalPages) {
					var current = this.serverSide.currentPage.call(this, data, context) || 1;
					var total = this.serverSide.totalPages.call(this, data, context);
					if (typeof total !== 'undefined') {
						context.uiState.page = current;
						var result = [];
						for (var i = 1; !(i > total); i++) {
							if (i === current) {
								result.push(rowOrder);
							} else {
								result.push([]);
							}
						}
						return result;
					}
				}
	
				var rowsPerPage = context.uiState.rowsPerPage || this.rowsPerPage(data, context)[0];
				if (!rowsPerPage) {
					return [rowOrder];
				}
				var pages = [];
				while (rowOrder.length) {
					pages.push(rowOrder.splice(0, rowsPerPage));
				}
				return pages;
			},
			tableHeadRenderHtml: function (data, context) {
				var result = '<thead>';
				var rowOrder = this.rowOrder(data, context);
				var pages = this.pages(rowOrder, data, context);
	
				var rowsPerPageOptions = this.rowsPerPage(data, context);
				if (pages.length > 1 || rowsPerPageOptions.length > 1) {
					var page = context.uiState.page || 1;
					result += '<tr><th colspan="' + this.columns.length + '" class="json-array-table-pages">';
					// Left arrows
					if (page > 1) {
						result += context.actionHtml('<span class="button">&lt;&lt;</span>', 'page', 1);
						result += context.actionHtml('<span class="button">&lt;</span>', 'page', page - 1);
					} else {
						result += '<span class="button disabled">&lt;&lt;</span>';
						result += '<span class="button disabled">&lt;</span>';
					}
					
					// Page selector
					result += 'page <select name="' + context.inputNameForAction('page') + '">';
					for (var i = 1; i <= pages.length; i++) {
						if (i == page) {
							result += '<option value="' + i + '" selected>' + i + '</option>';
						} else {
							result += '<option value="' + i + '">' + i + '</option>';
						}
					}
					result += '</select>/' + pages.length;
	
					// Rows-per-page selector
					if (rowsPerPageOptions.length > 1) {
						context.uiState.rowsPerPage = context.uiState.rowsPerPage || rowsPerPageOptions[0];
						result += ', <select name="' + context.inputNameForAction('rowsPerPage') + '">';
						rowsPerPageOptions.sort(function (a, b) {return a - b});
						for (var i = 0; i < rowsPerPageOptions.length; i++) {
							if (rowsPerPageOptions[i] === rowsPerPageOptions[i - 1]) {
								continue;
							}
							var iHtml = Jsonary.escapeHtml(rowsPerPageOptions[i]);
							var selected = (rowsPerPageOptions[i] == context.uiState.rowsPerPage) ? ' selected' : '';
							result += '<option value="' + iHtml + '"' + selected + '>' + iHtml + '</option>';
						}
						result += '</select> per page';
					}
	
					// Right arrows
					if (page < pages.length) {
						result += context.actionHtml('<span class="button">&gt;</span>', 'page', page + 1);
						result += context.actionHtml('<span class="button">&gt;&gt;</span>', 'page', pages.length);
					} else {
						result += '<span class="button disabled">&gt;</span>';
						result += '<span class="button disabled">&gt;&gt;</span>';
					}
					result += '</tr>';
				}
				result += '<tr>';
				for (var i = 0; i < this.columns.length; i++) {
					var columnKey = this.columns[i];
					result += this.titleHtml[columnKey](data, context);
				}
				result += '</tr>';
				return result + '</thead>';
			},
			tableBodyRenderHtml: function (data, context) {
				var result = '<tbody>';
				var rowOrder = this.rowOrder(data, context);
	
				var pages = this.pages(rowOrder, data, context);
				if (!pages.length) {
					pages = [[]];
				}
				var page = context.uiState.page || 1;
				var pageRows = pages[page - 1];
				if (!pageRows) {
					pageRows = pages[0] || [];
					context.uiState.page = 0;
				}
				for (var i = 0; i < pageRows.length; i++) {
					var rowData = data.item(pageRows[i]);
					result += this.rowRenderHtml(rowData, context);
				}
				if (page == pages.length && !data.readOnly()) {
					if (data.schemas().maxItems() == null || data.schemas().maxItems() > data.length()) {
						result += '<tr><td colspan="' + this.columns.length + '" class="json-array-table-add">';
						result += context.actionHtml('+ add', 'add');
						result += '</td></tr>';
					}
				}
				return result + '</tbody>';
			},
			action: function (data, context, actionName, arg1, arg2) {
				if (actionName == "sort") {
					delete context.uiState.page;
					var columnKey = arg1;
					context.uiState.sort = context.uiState.sort || [];
					if (context.uiState.sort[0] == "asc" + columnKey) {
						context.uiState.sort[0] = "desc" + arg1;
					} else {
						if (context.uiState.sort.indexOf("desc" + columnKey) != -1) {
							context.uiState.sort.splice(context.uiState.sort.indexOf("desc" + columnKey), 1);
						} else if (context.uiState.sort.indexOf("asc" + columnKey) != -1) {
							context.uiState.sort.splice(context.uiState.sort.indexOf("asc" + columnKey), 1);
						}
						context.uiState.sort.unshift("asc" + arg1);
					}
					if (this.serverSide && this.serverSide.action) {
						return this.serverSide.action.apply(this, arguments);
					}
					return true;
				} else if (actionName == "page") {
					context.uiState.page = parseInt(arg1, 10);
					if (this.serverSide && this.serverSide.action) {
						return this.serverSide.action.apply(this, arguments);
					}
					return true;
				} else if (actionName == "rowsPerPage") {
					var oldRowsPerPage = context.uiState.rowsPerPage;
					var newRowsPerPage = parseInt(arg1, 10);
					if (oldRowsPerPage) {
						context.uiState.page = Math.round(((context.uiState.page || 1) - 1)*oldRowsPerPage/newRowsPerPage) + 1;
					}
					context.uiState.rowsPerPage = newRowsPerPage;
					if (this.serverSide && this.serverSide.action) {
						return this.serverSide.action.apply(this, arguments);
					}
					return true;
				} else if (actionName == "move-select") {
					var index = arg1;
					context.uiState.moveRow = index;
					return true;
				} else if (actionName == "move-cancel") {
					delete context.uiState.moveRow;
					return true;
				} else if (actionName == "move") {
					var fromIndex = arg1;
					var toIndex = arg2;
					delete context.uiState.moveRow;
					data.item(fromIndex).moveTo(data.item(toIndex));
					return false;
				}
				return TableRenderer.defaults.action.apply(this, arguments);
			},
			defaultTitleHtml: function (data, context, columnKey) {
				if (data.readOnly()) {
					var result = '<th>';
					context.uiState.sort = context.uiState.sort || [];
					var titleHtml = Jsonary.escapeHtml(this.titles[columnKey] != undefined ? this.titles[columnKey] : columnKey);
					if (context.uiState.sort[0] == "asc" + columnKey) {
						result += '<div class="json-array-table-sort-asc">';
						result += context.actionHtml(titleHtml, 'sort', columnKey);
						result += '<span class="json-array-table-sort-text">up</span>';
						result += '</div>';
					} else if (context.uiState.sort[0] == "desc" + columnKey) {
						result += '<div class="json-array-table-sort-desc">';
						result += context.actionHtml(titleHtml, 'sort', columnKey);
						result += '<span class="json-array-table-sort-text">down</span>';
						result += '</div>';
					} else if (columnKey.charAt(0) == "/" && this.sort[columnKey]) {
						result += '<div class="json-array-table-sort">';
						result += context.actionHtml(titleHtml, 'sort', columnKey);
						result += '</div>';
					} else {
						return TableRenderer.defaults.defaultTitleHtml.call(this, data, context, columnKey);
					}
					return result + '</th>'
				}
				return TableRenderer.defaults.defaultTitleHtml.call(this, data, context, columnKey);
			},
			rowExpandRenderHtml: function (data, context, expand) {
				result = '<td class="json-array-table-full" colspan="' + this.columns.length + '">';
				if (expand === true) {
					result += context.renderHtml(data, 'expand');
				} else {
					result += context.renderHtml(expand, 'expand');
				}
				return result + '</td>';
			},
			rowRenderHtml: function (data, context) {
				var result = '';
				if (context.uiState.expand) {
					result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
					result += this.rowExpandRenderHtml(data, context, context.uiState.expand);
				} else if (context.uiState.linkRel) {
					var link = data.subPath(context.uiState.linkPath || '').links(context.uiState.linkRel)[context.uiState.linkIndex || 0];
					if (context.uiState.linkData) {
						if (link.rel == "edit" && link.submissionSchemas.length == 0) {
							result += TableRenderer.defaults.rowRenderHtml.call(this, context.uiState.linkData, context);
						} else {
							result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
							result += '<td class="json-array-table-full" colspan="' + this.columns.length + '">';
							result += '<div class="json-array-table-full-title">' + Jsonary.escapeHtml(link.title || link.rel) + '</div>';
							result += '<div class="json-array-table-full-buttons">';
							result += context.actionHtml('<span class="button action">confirm</span>', 'link-confirm', context.uiState.linkRel, context.uiState.linkIndex, context.uiState.linkPath);
							result += context.actionHtml(' <span class="button action">cancel</span>', 'link-cancel');
							result += '</div>';
							result += context.renderHtml(context.uiState.linkData, 'linkData');
							result += '</td>';
						}
					} else {
						result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
						result += '<td class="json-array-table-full" colspan="' + this.columns.length + '">';
						result += '<div class="json-array-table-full-title">' + Jsonary.escapeHtml(link.title || link.rel) + '</div>';
							result += '<div class="json-array-table-full-buttons">';
						result += context.actionHtml('<span class="button action">confirm</span>', 'link-confirm', context.uiState.linkRel, context.uiState.linkIndex, context.uiState.linkPath);
						result += context.actionHtml(' <span class="button action">cancel</span>', 'link-cancel');
							result += '</div>';
						result += '</td>';
					}
				} else {
					result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
				}
				return result;
			},
			rowAction: function (data, context, actionName, arg1, arg2, arg3) {
				thisConfig = this;
				delete context.parent.uiState.moveRow;
				if (actionName == "expand") {
					if (context.uiState.expand && !arg1) {
	 					delete context.uiState.expand;
	 				} else {
						context.uiState.expand = arg1 || true;
					}
					return true;
				} else if (actionName == "link") {
					var linkRel = arg1, linkIndex = arg2, subPath = arg3 || '';
					var link = data.subPath(subPath).links(linkRel)[linkIndex || 0];
					if (link.submissionSchemas.length) {
						context.uiState.linkRel = linkRel;
						context.uiState.linkIndex = linkIndex;
						var linkData = link.createSubmissionData(undefined, true);
						context.uiState.linkData = linkData;
						if (subPath) {
							context.uiState.linkPath = subPath;
						} else {
							delete context.uiState.linkPath;
						}
						delete context.uiState.expand;
					} else if (link.rel == "edit") {
						context.uiState.linkRel = linkRel;
						context.uiState.linkIndex = linkIndex;
						if (subPath) {
							context.uiState.linkPath = subPath;
						} else {
							delete context.uiState.linkPath;
						}
						context.uiState.linkData = data.subPath(subPath).editableCopy();
						delete context.uiState.expand;
					} else if (link.method != "GET") {
						context.uiState.linkRel = linkRel;
						context.uiState.linkIndex = linkIndex;
						if (subPath) {
							context.uiState.linkPath = subPath;
						} else {
							delete context.uiState.linkPath;
						}
						delete context.uiState.linkData;
						delete context.uiState.expand;
					} else {
						/*
						link.follow();
						return;
						*/
						var targetExpand = (link.rel == "self") ? true : link.href;
						if (context.uiState.expand == targetExpand) {
							delete context.uiState.expand;
						} else {
							context.uiState.expand = targetExpand;
						}
					}
					return true;
				} else if (actionName == "link-confirm") {
					var linkRel = arg1, linkIndex = arg2, subPath = arg3 || '';
					var link = data.subPath(subPath).links(linkRel)[linkIndex || 0];
					if (link) {
						link.follow(context.uiState.linkData);
					}
					delete context.uiState.linkRel;
					delete context.uiState.linkIndex;
					delete context.uiState.linkPath;
					delete context.uiState.linkData;
					delete context.uiState.expand;
					return true;
				} else if (actionName == "link-cancel") {
					delete context.uiState.linkRel;
					delete context.uiState.linkIndex;
					delete context.uiState.linkPath;
					delete context.uiState.linkData;
					delete context.uiState.expand;
					return true;
				}
				return TableRenderer.defaults.rowAction.apply(this, arguments);
			},
			update: function (element, data, context, operation) {
				if (context.uiState.moveRow != undefined) {
					delete context.uiState.moveRow;
					return true;
				}
				return this.defaultUpdate(element, data, context, operation);
			},
			linkHandler: function () {}
		};
		
		Jsonary.plugins = Jsonary.plugins || {};
		Jsonary.plugins.TableRenderer = TableRenderer;
		Jsonary.plugins.FancyTableRenderer = FancyTableRenderer;
	})(Jsonary);

/**** jsonary.render.generate.js ****/

	(function (Jsonary) {
	
		Jsonary.plugins.Generator = function (obj) {
			if (!obj.rendererForData) {
				throw "Generator must have method rendererForData";
			}
			
			obj.name = obj.name || "Generated (unknown)";
			
			function substituteContext(context) {
				var replacement = Object.create(context);
				
				replacement.subContext = function () {
					var result = context.subContext.apply(this, arguments);
					result.set('generated', context.get('generated'));
					return substituteContext(result);
				};
				
				return replacement;
			}
		
			obj.renderHtml = function (data, context) {
				var generatedRenderer = context.get('generated') || obj.rendererForData(data);
				context.set('generated', generatedRenderer);
				return generatedRenderer.renderHtml(data, substituteContext(context));
			};
			obj.enhance = function (element, data, context) {
				var generatedRenderer = context.get('generated');
				if (!generatedRenderer) {
					throw new Error("Generated renderer: cannot enhance without rendering first");
				}
				if (generatedRenderer.enhance) {
					return generatedRenderer.enhance(element, data, substituteContext(context));
				} else if (generatedRenderer.render) {
					return generatedRenderer.render(element, data, substituteContext(context));
				}
			};
			obj.action = function (context) {
				var generatedRenderer = context.get('generated');
				if (!generatedRenderer) {
					throw new Error("Generated renderer: cannot run action without rendering first");
				}
				var args = Array.prototype.slice.call(arguments, 0);
				args[0] = substituteContext(context);
				return generatedRenderer.action.apply(generatedRenderer, arguments);
			};
			obj.update = function (element, data, context) {
				var generatedRenderer = context.get('generated');
				if (!generatedRenderer) {
					throw new Error("Generated renderer: cannot update without rendering first");
				}
				generatedRenderer.defaultUpdate = this.defaultUpdate;
				
				var args = Array.prototype.slice.call(arguments, 0);
				args[2] = substituteContext(context);
				if (generatedRenderer.update) {
					return generatedRenderer.update.apply(generatedRenderer, args);
				} else {
					return this.defaultUpdate.apply(this, args);
				}
			};
	
			return obj;
		};	
	
	})(Jsonary);

/**** full-preview.js ****/

	Jsonary.render.register({
		component: [Jsonary.render.Components.LIST_LINKS],
		renderHtml: function (data, context) {
			var previewLink = data.getLink('preview') || data.getLink('full-preview');
			var innerHtml = context.renderHtml(previewLink.follow(null, false));
			return context.actionHtml(innerHtml, 'full');
		},
		action: function (context, actionName) {
			var data = context.data;
			if (actionName == 'full') {
				var fullLink = data.getLink('full');
				fullLink.follow();
			}
		},
		filter: function (data, schemas) {
			return data.readOnly() && data.getLink('full') && (data.getLink('preview') || data.getLink('full-preview'));
		}
	});
	
	Jsonary.render.register({
		component: [Jsonary.render.Components.LIST_LINKS],
		renderHtml: function (data, context) {
			var previewLink = data.getLink('preview') || data.getLink('full-preview');
			return context.renderHtml(data) + " - " + context.renderHtml(previewLink.follow(null, false));
		},
		filter: function (data, schemas) {
			return !data.readOnly() && data.getLink('full') && (data.getLink('preview') || data.getLink('full-preview'));
		}
	});

/**** full-instances.js ****/

	(function (Jsonary) {
		Jsonary.render.register({
			component: [Jsonary.render.Components.RENDERER, Jsonary.render.Components.LIST_LINKS],
			renderHtml: function (data, context) {
				var result = '<select name="' + context.inputNameForAction('select-url') + '">';
				var options = {};
				var optionOrder = [];
				var optionValues = {};
				var renderData = {};
				
				var links = data.links('instances');
				var fullLink = data.getLink('full');
				var previewPath = "";
				
				var fullPreviewLink = data.getLink('full-preview');
				if (fullPreviewLink && Jsonary.Uri.resolve(fullPreviewLink.href, '#') == Jsonary.Uri.resolve(fullLink.href, '#')) {
					var fullFragment = fullLink.href.split('#').slice(1).join('#');
					var previewFragment = fullPreviewLink.href.split('#').slice(1).join('#');
					var previewPath = decodeURIComponent(previewFragment.substring(fullFragment.length));
				}
				
				var rerender = false;
				for (var i = 0; i < links.length; i++) {
					var link = links[i];
					link.follow(null, false).getData(function (data) {
						data.items(function (index, subData) {
							var url = subData.getLink('self') ? subData.getLink('self').href : subData.referenceUrl();
							if (!options[url]) {
								options[url] = subData;
		
								var value = fullLink.valueForUrl(url);
								if (value !== undefined) {
									optionOrder.push(url);
									optionValues[url] = value;
									renderData[url] = subData.subPath(previewPath);
								}
							}
						});
						if (rerender) {
							context.rerender();
							rerender = false;
						}
					});
				}
				rerender = true;
				var optionsHtml = "";
				var foundSelected = false;
				for (var i = 0; i < optionOrder.length; i++) {
					var url = optionOrder[i];
					var selected = '';
					if (data.equals(Jsonary.create(optionValues[url]))) {
						foundSelected = true;
						selected = ' selected';
					}
					optionsHtml += '<option value="' + Jsonary.escapeHtml(url) + '"' + selected + '>' + context.renderHtml(renderData[url]) + '</option>';
				}
				if (!foundSelected) {
					optionsHtml = '<option selected>' + context.renderHtml(fullPreviewLink.follow(null, false), 'current') + '</option>' + optionsHtml;
				}
				result += optionsHtml;
				return result + '</select>';
			},
			action: function (context, actionName, arg1) {
				var data = context.data;
				if (actionName == 'select-url') {
					var url = arg1;
					var fullLink = data.getLink('full');
					var value = fullLink.valueForUrl(url);
					data.setValue(value);
				}
			},
			filter: function (data, schemas) {
				return !data.readOnly() && data.getLink('instances') && data.getLink('full');
			}
		});
	})(Jsonary);

/**** adaptive-table.js ****/

	// Generic renderer for arrays
	// Requires "render.table" and "render.generator" plugins
	Jsonary.render.register(Jsonary.plugins.Generator({
		name: "Adaptive table",
		// Part of the generator plugin - this function returns a renderer based on the data/schema requirements
		rendererForData: function (data) {
			var FancyTableRenderer = Jsonary.plugins.FancyTableRenderer;
	
			var detectedPagingLinks = !!(data.getLink('next') || data.getLink('prev'));
			var isShort = data.readOnly() && data.length() < 15;
	
			var renderer = new FancyTableRenderer({
				sort: {},
				rowsPerPage: (isShort || detectedPagingLinks) ? null : [15, 5, 30, 100]
			});
			var columnsObj = {};
					
			function addColumnsFromSchemas(schemas, pathPrefix, depthRemaining) {
				schemas = schemas.getFull();
	
				pathPrefix = pathPrefix || "";
				var basicTypes = schemas.basicTypes();
	
				// If the data might not be an object, add a column for it
				if (basicTypes.length != 1 || basicTypes[0] != "object" || depthRemaining <= 0) {
					var column = pathPrefix;
					if (!columnsObj[column]) {
						columnsObj[column] = true;
						renderer.addColumn(column, schemas.title() || column, function (data, context) {
							if (data.basicType() == "object" && depthRemaining > 0) {
								return '<td></td>';
							} else {
								return this.defaultCellRenderHtml(data, context, column);
							}
						});
						var isScalar = basicTypes.length == 1 && basicTypes[0] !== 'object' && basicTypes[0] !== 'array';
						if (!detectedPagingLinks && isScalar) {
							// add sorting
							renderer.config.sort[column] = true;
						}
					}
				}
	
				// If the data might be an object, add columns for its links/properties
				if (basicTypes.indexOf('object') != -1 && depthRemaining > 0) {
					if (data.readOnly()) {
						var links = schemas.links();
						for (var i = 0; i < links.length; i++) {
							var link = links[i];
							addColumnsFromLink(link, i);
						}
					}
					var knownProperties = schemas.knownProperties();
					var knownPropertyIndices = [];
					// Sort object properties by displayOrder
					var knownPropertyOrder = {};
					for (var i = 0; i < knownProperties.length; i++) {
						knownPropertyIndices.push(i);
						var key = knownProperties[i];
						knownPropertyOrder[key] = schemas.propertySchemas(key).displayOrder();
					}
					knownPropertyIndices.sort(function (indexA, indexB) {
						var keyA = knownProperties[indexA];
						var keyB = knownProperties[indexB];
						if (knownPropertyOrder[keyA] == null) {
							if (knownPropertyOrder[keyB] == null) {
								return indexA - indexB;
							}
							return 1;
						} else if (knownPropertyOrder[keyB] == null) {
							return -1;
						}
						return knownPropertyOrder[keyA] - knownPropertyOrder[keyB];
					});
					// Iterate over the potential properties
					for (var i = 0; i < knownPropertyIndices.length; i++) {
						var key = knownProperties[knownPropertyIndices[i]];
						addColumnsFromSchemas(schemas.propertySchemas(key), pathPrefix + Jsonary.joinPointer([key]), depthRemaining - 1);
					}
				}
			}
	
			function addColumnsFromLink(linkDefinition, index) {
				var columnName = "link$" + index + "$" + linkDefinition.rel();
	
				var columnTitle = Jsonary.escapeHtml(linkDefinition.data.property("title").value()|| linkDefinition.rel());
				var linkText = columnTitle;
				var activeText = null, isConfirm = true;
				if (linkDefinition.rel() == 'edit') {
					activeText = 'save';
				}
	
				renderer.addLinkColumn(linkDefinition, linkDefinition.rel(), columnTitle, linkText, activeText, isConfirm);
			}
	
			var itemSchemas = data.schemas().indexSchemas(0).getFull();
			var recursionLimit = (itemSchemas.knownProperties().length >= 8) ? 0 : 1;
			if (data.schemas().displayAsTable()) {
				recursionLimit = 2;
			}
			addColumnsFromSchemas(itemSchemas, '', recursionLimit);
			return renderer;
		},
		filter: function (data, schemas) {
			if (data.basicType() == "array") {
				if (schemas.displayAsTable()) {
					return true;
				}
				// Array full of objects
				if (!schemas.tupleTyping()) {
					var indexSchemas = schemas.indexSchemas(0).getFull();
					var itemTypes = indexSchemas.basicTypes();
					if (itemTypes.length == 1 && itemTypes[0] == "object") {
						if (indexSchemas.additionalPropertySchemas().length > 0) {
							return false;
						}
						if (indexSchemas.knownProperties().length < 20) {
							return true;
						}
					}
				}
			}
			return false;
		}
	}));
	
	// Display-order extension (non-standard keyword)
	Jsonary.extendSchema({
		displayOrder: function () {
			return this.data.propertyValue("displayOrder");
		}
	});
	Jsonary.extendSchemaList({
		displayOrder: function () {
			var displayOrder = null;
			this.each(function (index, schema) {
				var value = schema.displayOrder();
				if (value != null && (displayOrder == null || value < displayOrder)) {
					displayOrder = value;
				}
			});
			return displayOrder;
		}
	});
	
	// displayAsTable extension (non-standard keyword, suggested by Ognian)
	Jsonary.extendSchema({
		displayAsTable: function () {
			return !!this.data.propertyValue("displayAsTable");
		}
	});
	Jsonary.extendSchemaList({
		displayAsTable: function () {
			var displayAsTable = false;
			this.each(function (index, schema) {
				displayAsTable = displayAsTable || schema.displayAsTable();
			});
			return displayAsTable;
		}
	});

/**** tag-list.js ****/

	Jsonary.render.register({
		renderHtml: function (data, context) {
			var enums = data.schemas().enumDataList();
			var result = '<div class="json-tag-list">';
			result += '<div class="json-tag-list-current">';
			data.items(function (index, item) {
				result += '<span class="json-tag-list-entry">';
				if (!data.readOnly()) {
					result += '<span class="json-array-delete-container">';
					result += context.actionHtml('<span class="json-array-delete">X</span>', 'remove', index);
					result += context.renderHtml(item.readOnlyCopy(), 'current' + index) + '</span>';
					result += '</span>';
				} else {
					result += context.renderHtml(item.readOnlyCopy(), 'current' + index) + '</span>';
				}
			});
			result += '</div>';
			if (!data.readOnly()) {
				result += '<div class="json-tag-list-add">';
				result += context.actionHtml('<span class="button">add</span>', 'add');
				if (!context.uiState.addData) {
					var undefinedItem = data.item(data.length());
					var itemSchema = undefinedItem.schemas(true);
					context.uiState.addData = itemSchema.createData(undefinedItem, true);
				}
				result += context.withoutComponent('LIST_LINKS').renderHtml(context.uiState.addData, 'add');
				result += '</div>';
			}
			return result + '</div>';
		},
		action: {
			add: function (data, context) {
				var addData = context.uiState.addData;
				if (data.schemas().uniqueItems()) {
					for (var i = 0; i < data.length(); i++) {
						if (data.item(i).equals(addData)) {
							return false;
						}
					}
				}
				data.item(data.length()).setValue(addData.value());
			},
			remove: function (data, context, index) {
				data.item(index).remove();
			}
		},
		filter: {
			type: 'array',
			filter: function (data, schemas) {
				return schemas.unordered();
			}
		}
	});

/**** image-picker.js ****/

	// Fancy image-picker with HTML5
	if (typeof FileReader === 'function') {
		Jsonary.render.register({
			component: Jsonary.render.Components.ADD_REMOVE,
			renderHtml: function (data, context) {
				if (data.defined()) {
					var mediaType = null;
					data.schemas().each(function (index, schema) {
						if (/^image/.test(schema.data.get('/media/type'))) {
							mediaType = schema.data.get('/media/type');
						}
					});
					var dataUrl = 'data:;base64,' + data.value();
					var result = '<div class="json-object-delete-container">';
					if (!data.readOnly()) {
						result += context.actionHtml('<span class="json-object-delete">X</span>', 'remove');
					}
					result += '<div class="base64-image-preview"><img src="' + Jsonary.escapeHtml(dataUrl) + '"></div>';
					result += '</div>';
					return result;
				} else if (context.uiState.warning) {
					return '<div class="base64-image-warning warning">' + Jsonary.escapeHtml(context.uiState.warning) + '"</div>';
				} else {
					return '<div class="base64-image-placeholder"></div>';
				}
			},
			action: {
				remove: function (data, context) {
					data.remove();
				}
			},
			render: function (element, data, context) {
				if (data.readOnly()) {
					return;
				}
				function handleFileSelect(files) {
					// files is a FileList of File objects. List some properties.
					var output = [];
					if (files.length) {
						var firstFile = files[0];
						if (!firstFile.type.match('image.*')) {
							return;
						}
						var reader = new FileReader();
	
						reader.onload = function(loadEvent) {
							delete context.uiState.warning;
							var dataUrl = loadEvent.target.result;
							var remainder = dataUrl.substring(5);
							var mediaType = remainder.split(';', 1)[0];
							remainder = remainder.substring(mediaType.length + 1);
							var binaryEncoding = remainder.split(',', 1)[0];
							remainder = remainder.substring(binaryEncoding.length + 1);
							if (binaryEncoding !== 'base64') {
								context.uiState.warning = "Data URL is not base64";
								Jsonary.log(Jsonary.logLevel.ERROR, 'Data URL is not base64');
								return context.rerender();
							} else if (!/^image\//.test(mediaType)) {
								context.uiState.warning = "File must be an image";
								Jsonary.log(Jsonary.logLevel.ERROR, 'Data is not an image');
								return context.rerender();
							}
							data.setValue(remainder);
						};
	
						reader.readAsDataURL(firstFile);
					}
				}
				
				var mediaType = null;
				data.schemas().each(function (index, schema) {
					if (/^image/.test(schema.data.get('/media/type'))) {
						mediaType = schema.data.get('/media/type');
					}
				});
	
				var input = document.createElement('input');
				input.setAttribute('type', 'file');
				input.setAttribute('accept', mediaType || 'image/*');
				input.onchange = function (evt) {
					var files = evt.target.files; // FileList object
					handleFileSelect(files);
				};
				
				var firstElement = null;
				for (var i = 0; i < element.childNodes.length; i++) {
					if (element.childNodes[i].nodeType === 1) {
						firstElement = element.childNodes[i];
					}
				}
				firstElement.addEventListener("dragover", function (e) {
					e.preventDefault();
				}, true);
				firstElement.addEventListener("dragenter", function (e) {
					firstElement.className += " drag-hover";
				});
				firstElement.addEventListener("dragleave", function (e) {
					firstElement.className = firstElement.className.replace(/(^| )drag-hover($| )/g, ' ');
				});
				firstElement.addEventListener("drop", function (e) {
					e.preventDefault(); 
					window.evt = e;
					console.log(e);
					var files = e.dataTransfer.files;
					handleFileSelect(files);
				}, true);
				
				element.appendChild(input);
			},
			filter: {
				type: ['string', undefined],
				filter: function (data) {
					var schemas = data.schemas(true); // force search for potential future schemas
					return schemas.any(function (index, schema) {
						return (schema.data.get('/media/binaryEncoding') || "").toLowerCase() == 'base64'
							&& /^image\//.test(schema.data.get('/media/type'));
					});
				}
			}
		});
	}

/**** common.css ****/

	if (typeof window != 'undefined' && typeof document != 'undefined') {
		(function () {
			var style = document.createElement('style');
			style.innerHTML = ".jsonary .loading{margin:0;padding:15px;margin-left:15px;margin-right:15px;background-image:url(\"data:image/gif;base64,R0lGODlhFwAXAMZBAHV1dbOzs7W1tba2tre3t7q6uru7u7y8vL6+vr+/v8HBwcLCwsPDw8TExMXFxcbGxsfHx8jIyMnJycrKysvLy8zMzM3Nzc7Ozs/Pz9DQ0NHR0dLS0tPT09TU1NXV1dbW1tfX19jY2NnZ2dra2tvb29zc3N3d3d7e3t/f3+Dg4OHh4eLi4uPj4+Tk5OXl5ebm5ufn5+jo6Onp6erq6uvr6+zs7O3t7e7u7u/v7/Hx8fLy8vPz8/T09PX19fb29vf39/j4+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCAB/ACwAAAAAFwAXAAAHy4AAgoMAf4SDhoeCOj6NP4UAKy2TLZABl5eCLjOcN5AfJKEnlpgBmpwznoagoqSYp52foSSjhqWmACgnuy6QFhrAHa6ZipCKiYd/ysvMzc7Kxc/QxTI11qrSAAbb24IoKuC90obc3bngKuLZ5Qbe6OrP2uWCJCP2tevz0dnH4/7L0QIWM4GiYCVDFzAo1ABJgUOHgj5IBAWJgkUKFho+VCCow0QSkCZczGhoI0cAHiWCNCTSIkkAJgVtmLkBREgIOCs0TMDz5DGBhwIBACH5BAkIAH8ALAAAAAAXABcAAAfLgACCgwB/hIOGh4I6Po0/hQA9QJNAkAGXl4IvM5w3kC2cMziWmAGaoZ6GoJyjhqWmAJudn6GtAK+CLSm7MZAfJcAqpJiKgomHx4R/y8zNzs/LxdDRxS8x1zSF0wAF3d2CJuEmwtOG3t8A4uPa0Nzn4OLk2+cFgiH3ISPsz+7exfvOpJUbyEyawWIjgJVYAWmCQ4eQEEiUKKiDxQ4iIEXYuDHiRASCMlzMaIhjR0MfQQIQaZEkAJMRPE4MmaEmCI0McsZE+fFfMkTFAgEAIfkECQgAfwAsAAAAABcAFwAAB9CAAIKDAH+Eg4aHgjY5jTqFADs/kz+QEhOYE4IrLp0ykC0zojeQDA6nEJudLp+GoaOlpw6pAJyeoKIzpIamqIIoJsEskCPBJsOGCQrLC4qCiYfQhH/U1dbX2NTO2drOKizgMIXcAAXm5oIi6iIn49nl5wWCIevt3Ibx8gD06vbk+YI8CPQQwh02eOecGby27Z7DatsiOuswUAQkWacgAQSAoSMGDpAaiBSpMZ4gCx5BGhpJEp9JACg7qgTAskHJhDAp6NQQcpkCmy5xKpKGyFkgACH5BAkIAH8ALAAAAAAXABcAAAfMgACCgwB/hIOGh4IyNY03hQA6PpM/kCgqmCqCl5gukC4zoY+GHSGmJJuZnoagopClp6mdn6EzowCwIagAJCO+J5YnwqsAExfHG4qCiYfMhH/Q0dLT1NDK1dbKJijcLYXYAAXi4oIf5h+o2Ibj5Ljn6eDsBYId79/V4eyCG/wbIPfU8o1TBnDaNXUIo11bqAyDQwwaICmYOBHSgIsXBVHYSMGCRIoKLGIcIGgCR4+GQIY0NJJksZMfKYrEWBKCzQoSE+hcCaAlQWeIlAUCACH5BAkIAH8ALAAAAAAXABcAAAfIgACCgwB/hIOGh4IvMY00hQA6PpM/kD1AmECCJpwmKpAvM6I3kC2iMzibnZ+GoaOlp6kAnZ6gp6SGpqKyIb0hI6UpwjGQHyXHn4qQiomHf8/Q0dLTz8rU1cojxyUrhdcABeHhgh3lHSLe1ODiBYIZ5ujXhuztAO/l8d/07hn9IOnT1olTBlCaNXkIoVlbqGyCQ4eQEEiUCCmARYuCImjUGHEigooXA2TcGKHjRJAXR240SdFQSJEAIjCYWdKQx48uQxJsRojnoEAAIfkECQgAfwAsAAAAABcAFwAAB9eAAIKDAH+Eg4aHgistjTGFADc5kzuQPD+YP4IjnCMnkCwuojKQLTOnN4IhnZ+GoaOlpzOpAKucrQCvLqSGpqiCHsEeIpApJscskCPHJsmKkIqJh3/U1dbX2NTP2drPHR/gI4XcABYX5xeCGesZHOPZABAS8xSCFuzu3Iby9Pb479jizZNQrxyFgxsAXgPAwIHDB88UWtumr2K1bRifPdi4EVKBjx8hCRg5UlCDkyc9giwgkqQAkygbqATZkiRMlDNDGnL5EkADBUBlGlrJcqfLiNIIJR0UCAAh+QQJCAB/ACwAAAAAFwAXAAAHzYAAgoMAf4SDhoeCJiiNLYUAMjWTN5A6Ppg/gh+cHySQKCqiLpAuM6eVAB2dn4aho6WnM6mrnK0AryqkhqaoghvAGyCQJCPGJ6AnyqSKkIqJh3/S09TV1tLN19jNGN0YGoXaACst5Y8AFOkUFuHXAB/GI8gAE+rs2obwx4L16ffi+uTxg0CwQjtrACxoWNih2cFq2fBJnJatYjMFGDFCGsCRIyQCIEEKyqjRUEePhkKKBEBSwcaTH1WOJPmyY8yQIxPodGkSZkqZFqM1CwQAIfkECQgAfwAsAAAAABcAFwAAB8iAAIKDAH+Eg4aHgiMljSuFAC8xkzSQOj6YP4IdnB0ikCahJiqQLzOnN4IZnZ+GoqOlpzOpAKucrQCvpIamqKoZwCCQIcQhI5AtKcoxioKJh8+Ef9PU1dbX083Y2c0T3t6F2wA9QOVAghHp6eHYAC2yOOjqEezX7vDy6vXW96fxABEYCKS3zdCHRiVIaROnqKDDatoiNkNAkSKkABgxQirAkaOgihYNZdRoqKNHACARXBy50eRHkCsztuz4smJMkgBMFmgGqWGzQAAh+QQJCAB/ACwAAAAAFwAXAAAH1IAAgoMAf4SDhoeCHR+NI4UAKy2TMZA3OZg7ghmcGRyQI6EjJ5AsLqcyghadn4YhoqSGpqiqrJCvobEAsy6pABYUwRuQHsUeIpApJsssioKJh9CEf9TV1tfY1M7Z2s4P39+F3AA8P+Y/gg3q6uLZAC0z8Tfp6w3t2O/xM/MA9fbchuDJS6eg4L9xI5aZaLZtnCKAEK1tm+isgEWLkARo1AjJwoWPFwRdxGhoI0dDECSopCByZEaTkFKubHnx5caYKiWwBDCygM2TABg4GPrAGaSHzgIBACH5BAkIAH8ALAAAAAAXABcAAAfTgACCgwB/hIOGh4IYGY0bhQAnKZMukDM1mDiCFZwVFpAgoSAkkCkqp5UAE52fhh2ipIamqIKrnK0Ar6GxALMqqRMQwrgbxRshkCUjyyeKgomH0IR/1NXW19jUztnazgvf34XcADs+5j+CCurq4tkALjPxN+nrCu3Y7/Ez8wD19tyG4MlLl6Dgv3EoTihMpQjgNoAQq22b6GyARYuQCGjUCEkFi48sBF3EaGgjR0Mflo0wIXJkRpOQUi5jCWDkgJcbY6qkaRPnSQAVGmXo4AxSQ2eBAAAh+QQJCAB/ACwAAAAAFwAXAAAHyoAAgoMAf4SDhoeCE4yMhQAjJZIrjy8xlzSCEZubjx2fHSKPJqQmKpqcEY8ZoKKGpaaonKuto6WnABEMu6qGGb8ZII8hxCEjioKJh8qEf87P0NHSzsjT1MgI2dmF1gA6PuA/gtrb1oYvM+k34+Tc0wDo6uza7tLw6TPrAOQI9dEALVIIjIHMH7Rq5hI+q8YQWYCHDx8VmDjxUQ8gGIEIghjREMWKhlrgw7GRo8SPj0SmIwmAY4CTFFOOLAkRJkgAHySVwKWIGSJkgQAAIfkECQgAfwAsAAAAABcAFwAAB9eAAIKDAH+Eg4aHgg+MjIUAHR+SI48rLZcxgg2bm48ZnxkcjyOkIyeanA2PFqCihiGlpwCpqoasn64AsKSyDQq/tQAWFMQbjx7IHiKKgomHzoR/0tPU1dbSzNfYzAXd3YXaADc55DuC3t/ahiwu7TLn6ODXAOzu8N7y1vTtLu8A6AXyVQOQwoRBFswEUsumruG0bBCZCZg4cdWFixce8fjB8YcgihUNQZBAksKjFjNS3vgI8tHIkidTzlgJAKQAlyQlmDSEUiVLio8YOBj6YJRBEwgjPmMWCAAh+QQJCAB/ACwAAAAAFwAXAAAH1oAAgoMAf4SDhoeCCoyMhQAYkRgajyYoly2LjQqPFJ4UFo8fox8kmo2PE5+hhh2kpgCbnIaqnqwArqOwCgm9swATEMIVjxvGGyCKgomHzIR/0NHS09TQytXWygPb24XYADI14jeC3N3Yhigq6y7l5t7VAOrs7tzw1PLrKu0A5gP30wCQGEHwhDKA0q6hWxjtmkNlBCJGfLSihcVMhnT42PhDkMSJhj4QHGHikYsZKMkB+EhA1MiShk6m9PjRJUGYAGTOUMnyUQUNQDs8QnGiKD9FzhApCwQAIfkECQgAfwAsAAAAABcAFwAAB8uAAIKDAH+Eg4aHggiMjIUAE5GRjyMlliuLjQiPEZ2djx2hHSKZjZyeEY8ZoqQAmpuGqKmGq6Gtr5wMurMAGb4ZIIqCiYfEhH/IycrLzMjCzc7CAdPThdAALzHaNILU1dCGJuImKt3e1s0A4+Tm1OjM6uPlAN4B78sAIfohI8L3ys/ACUz2rKCwAggRPuoBpCGQRzp8SPwhKKFCQy1maMTx6IXGGTcqWnyUcWPHjyEBWCxA8iNHQx41plz56IOlEuUwptgZw58xRMICAQAh+QQJCAB/ACwAAAAAFwAXAAAH1IAAgoMAf4SDhoeCBYyMhQAPkZGPHh+WI4uNBY8NnZ2PGaEZHJmNnJ4NjxaipACam4aoqYaroa2vnAq6swAWFb8bioKJh8SEf8jJysvMyMLNzsIC09OF0AArLdoxgtTV0IYj4iMn3d7WzQAi4+UA3gLozOrs5tTxywAe+h4iwvfKz8AJTPasoDAKv3494vGj4Y9HN3JI3CHoQYSLEx61mMHxxiMWL0LOqHgxQkZDGzt+DPliJKSSJwGknOHREEiRghZ4cvBohImfLB6l+GkiqMFiwgIBACH5BAkIAH8ALAAAAAAXABcAAAfPgACCgwB/hIOGh4IDjIyFAAqRkY8YlRgai40Dj5KThhSgFBaZjZydjxOhowCam4adCqiqpI6vCbexhhMQvBWKgomHwYR/xcbHyMnFv8rLvwTQ0IXNACYo1y2C0dLNhh/fHyTa29PKAB3g4gDbBOXJ5+nj0e7IABv3GyC/9MfM3f/GmAn8taKFwWyGdPhY+OORjBoQbwj6MKLiiUcuZmiUaAiFio8uJlYccdFQxo2PPIIUaRGjxhkcAahUERKABQ04O6Q8wTOkIRIjLw4U9isQACH5BAkIAH8ALAAAAAAXABcAAAfHgACCgwB/hIOGh4IBjIyFAAiRkY8TlZWLjQGPkpOGEZ+fmI2bnI+goQCZmoacCKanoo6spZ4MthGKgomHu4R/v8DBwsO/ucTFuQXKyoXHACMl0SuCy8zHhh3ZHSLU1c3EABna3ADVBd/D4ePdy+jC4RnxILnuwcbX+MDG+7k9QP9AHunwQfDHoxcxEtIQ1GKGQxwHHc648ciERRMqGEqEaOiFRIqGLmLU+DCiQ5AARGYE8CFaiYyGWqSYGeNRiJshRtDrhShXIAAh+QQJCAB/ACwAAAAAFwAXAAAH1oAAgoMAf4SDhoeCAoyMhQAFkZGPD5WVi40Cj5KThg2fn5iNm5yPoKEAmZqGnAWmp6KOrKWeCrYNioKJh7uEf7/AwcLDv7nExbkWF8sXhccAHR/SI4IQEtcUzsQAGd0ZHNXXEtnHhhbe4ADW2NrDAOfd6QwO9A/twu8U+hu598HG5QICM0YwF48fCH88upGj4Y5HK1pIjCGoxYyLNx6xcMFRxqMRIEecqHhxRkZDGzs+ChFyJACLGDVydOHREEuQLkeY2MniUYqdJnoa8kDUg4h+vRDlCgQAIfkECQgAfwAsAAAAABcAFwAAB9OAAIKDAH+Eg4aHggSMjIUAA5GRjwqVlYuNBI+Sk4aWlwCZmoacA5SfmI2bnKeWqY6krJ4JtAqKgomHuYR/vb6/wMG9t8LDtystyS2FxQAYzxgagh8j1SfMwgAU2xQW09Uj18WGE9zeANTW2MEA5dvnFhryHevA7RD4Fbf1v8Tj/76ICbylw4fBH49k1Fh445EJFBCXAXAxo2JDQyhUaHTx6IPHDyQEUbT4KOPGRx0+hpxYccZFACZVcDSU0uNKFCdyzgRAApw4ABuCbgCxbxeiW4EAACH5BAkIAH8ALAAAAAAXABcAAAfIgACCgwB/hIOGh4IFjIyFAAGRkY8IlZWLjQWPkpOGlpcAmZqGnAGUn5iNm5ynlqmOpKyeqIqPiomHf7q7vL2+urW/wLU9QMZAhcIAE8zMgi0z0TjJvwAR19fP0TPTwobY2QDQ0tS+1uCCHyXrKuW91gzxEbXuvMHe+LvB+7U6Pv8/Hr2IQZDGoxHrSqwQ9GLbjUcmIppoZ6iDxQ4iGDqEKJEigAwXMwJoGO2hIYkTH4G0KLJFipcxHoWYGWKEygw4QdDDRYjnoEAAIfkECQgAfwAsAAAAABcAFwAAB9iAAIKDAH+Eg4aHghYXjReFAAKSkpAFlpaCERObFJCTlIaXmACanJ6flaKZmxOdhp8CqZeCDA62EKeTsqOKiYe+hH/Cw8TFxsKKhcfAhDw/zz/KxwAP1dWCLTPaN9LGAA3g4NjaM9zLhuHiANnb3cXf6YIjJvQs7sTfCvoNyffDyecC4usFsN+NHAh3QFrRomEMSB0+SBwhiIWLizIgjdg44gSkDCAzcKh40UVGQyE4ejRkIeRIABYxQkq5cSWAliBfpqBnwp4hD0A9iIBkgYLRDf2YCVIKIBAAIfkECQgAfwAsAAAAABcAFwAAB9WAAIKDAH+Eg4aHgiosjSyFAASSkpADlpaCHyObJpCTlIaXmACanJ6flaKZmyOdhp8EqZeCFRm2HaeTsqOKiYe+hH/Cw8TFxsKKhcfAhDo+zz/KxwAK1dWCLjPaN9LG1NYK2Noz3MuG4OEA2dvdxd/Wgign8y7txNQJ+em9y8nm//d6+UsGQEaNg+UAmEDBsAUkDBAxaIinomI9Qx8yfiABiYJHChYoWoTUQSNHQxM+hgSAoqKKiwBKZjwJIKXHlSRYnYC0oecGEJAmQBhagSAzQUcBBAIAIfkECQgAfwAsAAAAABcAFwAAB8aAAIKDAH+Eg4aHgj1AjUCFAAWSkpABlpaCLTObOJCTlIaXmACanJ6flaKZmzOdhp8FqZeCHyW2KqeTsqOKiYe+hH/Cw8TFxsKKhcfAhDo+zz/KxwAI1dWCL6w30sbU1gjY2tzF3tbhm9vLht/gpCnvMePE5dfJ6vbq+cP2/MkvMQBpQBphq8QKSBMSJhRkoqEJXIY6SOwgAlKEixcZOoQIIMPEioYwZgTg8CEkjxJBAhAZQVCIlyFGnMxAE4RFBjhb9vuVLBAAIfkECQgAfwAsAAAAABcAFwAAB9GAAIKDAH+Eg4aHgjs/jT+FABcYkxiQAZeXgi0znDeQEROhFZaYAZqcM56GoKKkmKedn6ETo4alpgAjJrsskAwOwBCumYqQiomHf8rLzM3OysXP0MU2OdY6hdIAB9zcgisu4TLZz9vdB9/hLuPShufoAODi5M7m3YIouya97fbe0dqOtRu4LJrBYipYKIQBqYOHhyIgAZsoSIRFEScgUcLAAVKDjx8FhbiY0ZAFSh0NgQwJYKTFkgBOTkoJYGUDQQ8fhoBkgYJPDR4VCL15MFmxQAA7\");background-position:middle;background-repeat:no-repeat}.jsonary .link{color:#05C}.jsonary .link:hover{color:#07F;text-decoration:underline}.jsonary .jsonary-action,.jsonary a.jsonary-action{text-decoration:none}.jsonary .error,.jsonary .warning{border:1px solid;border-radius:3px;font-size:.8em;padding:.3em;padding-left:25px;padding-right:.5em;background-position:3px 50%;background-repeat:no-repeat}.jsonary .warning{border-color:#DBB;background-color:#F8F8F0;color:#820;background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAG7AAABuwE67OPiAAAACXZwQWcAAAAQAAAAEABcxq3DAAAB2ElEQVQ4y6WTu2tUURCHvzn3nZu7j+hmtTDCBlstUqZQgvoHKGKjjdpIUJtgIwQsVQQNCqJYaaNYiIuYWOQvSCtEEQtJCEHi7jW72d372GNxTaJg1lUHBuacM/Od35yHaK35H1O9FuOqfT595ZzqSdBa/9aTOet0PHekG8+f0J1Z68xOeTsq0JF7xxyZFKN0Etmwb/9VC923xqT4x/ZgGIgBKjg8HL+xr/QNSBP/urF7nIX7N1l4cBdVOIhOzOm+AMmsdU0Gx3fBOuHiB8L3HxGpofxDQ9Fra/rPgDS4ahQrwDKOEhwloJYwcgHdxJvqCWhX1Q0jqOTEWAFzDS/I4w8Ng9NEvAaqOBK0XqpbP9fI1kN6KFaz6IYD+1NPrBgM+PS0hE4jRi+EIKBTh8Y73QpGozxjOgYwN0mNAblnFlxP8vVs1oTKpS+ZRvmxW7eDVS54jcV4ZnCMi9sKnogftnO13ETLEjfOABaszBQA2DtVhy6QgO54fKtK3PY2iuWzuqkAwjqP7YqXFduAk7mJYIpkwE0VqoV9ILDcGo+2WugsMxEcDzK5ySpoIIXS5VoWr2djEoAyzr48jfm1o9tnYKgXX59/PhctRX18zVXErWnlJ89+vYV/tO89rcJJiVkaLAAAACV0RVh0Y3JlYXRlLWRhdGUAMjAwOS0xMS0xNVQxNzowMjozNC0wNzowMLbnjhIAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTAtMDItMjBUMjM6MjY6MjQtMDc6MDAuw1DWAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDEwLTAxLTExVDA5OjI0OjQ0LTA3OjAwGJHf5wAAAGd0RVh0TGljZW5zZQBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS1zYS8zLjAvIG9yIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL0xHUEwvMi4xL1uPPGMAAAAldEVYdG1vZGlmeS1kYXRlADIwMDktMDMtMTlUMTA6NTI6NTEtMDY6MDB/aP0GAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAABN0RVh0U291cmNlAE94eWdlbiBJY29uc+wYrugAAAAndEVYdFNvdXJjZV9VUkwAaHR0cDovL3d3dy5veHlnZW4taWNvbnMub3JnL+83qssAAAAASUVORK5CYII=\")}.jsonary .error{border-color:#DCB;background-color:#F8F0F0;color:#800;background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAA3XAAAN1wFCKJt4AAAACXZwQWcAAAAQAAAAEABcxq3DAAACbklEQVQ4y41TS0sbYRQ9984kTia+sEKFmqLUbUi66kIIcSHFnVBKC4VCf0P2zT/wN7gpVLp20V0IrmtH0IrMwkcx0y5iqs2M+b6Ze7uor1YED5zdPeeee+GQquIm2pXKHBG9Y9eti0gZANhxtsTalqqu1oIgvDlPlwbtSoWJucFDQ+8fzs/7hVKJvakpAMB5FCE5OsqijY2BGtNUkZVaEMiVQbtSYXac9vDsbPXR0lIRSYKs14PEMQCAi0W44+NQz8P39fW4f3CwKVlWqwWBMAAQc6NYKlWnFxeLdncX59vbsJ0Osl+/kJ2ewh4fI9nZgd3bw+OlJd+fnn5KzA0AoFa5POfk85tzr14Np4eHkLMzgOial1AFVOGMjMAplRCurfUzY6rO28nJxoNyuZ7L5dh0OlCRa2bZLaZxDPI8IJ934uPjvqsi9dzoqGN+/kTY7YKIcLX3ZoKLFArgSaGA3MiIIyJ1NzOm7HgeBlGE558/4z749uIF8jMzyIwpu1maIksSpIPBvcQAkBoDThJkaQpXRbb6UTTvMOPLwgJABPo/+n9ncLGIfhRBRbZca0zrdxQ9G52aclNjrsV3magiNzaG351Oao1psVi72gtDY62FMCM15m4OBhBmWGvRC0Mj1q7ycrcbpsY0fwRBnwoFCNHV8C0xEahQwI8g6KfGNJe73ZBUFZ98n4m5nfP96vjMTJFUIYMBVOTvNY4DHhqCAujt7/dtHH9VkdrLOJarMn3M55mIGiBq+hMTnut5Ts73AVXY83PYOE6TkxOjqk2orrw25rpMN/GBeQ7AO2KuQ7V88dAtFWkBWH0j8k+d/wDGsYUOvG2ZLQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxMC0wMi0yMFQyMzoyNDo0MC0wNzowMBgWrX8AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTAtMDEtMTFUMDk6MTI6NDgtMDc6MDBLzaPVAAAANHRFWHRMaWNlbnNlAGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL0dQTC8yLjAvbGoGqAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAATdEVYdFNvdXJjZQBHTk9NRS1Db2xvcnOqmUTiAAAAMXRFWHRTb3VyY2VfVVJMAGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9nbm9tZS1jb2xvcnMvUB216wAAAABJRU5ErkJggg==\")}.jsonary .prompt-outer{display:inline;position:fixed;text-align:center;left:0;right:0;top:0;bottom:0;padding:5%;z-index:10000;overflow:auto;background-color:#CCC;background-color:rgba(100,100,100,.3);background-image:URL(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AwdEQcKfNuiKQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAATElEQVQY043QsQ2AQAxD0Y9rlvBYbJQts8QNQMVJIOCcysWTJWerqgPA9uBx3b1fWQkCUIJm4wrZHkrQrfEPTbhCAErQ65ivLyhBACczESoFljB75gAAAABJRU5ErkJggg==\")}.jsonary .prompt-inner{display:inline-block}.jsonary .prompt-overlay{position:fixed;top:0;left:0;bottom:0;right:0}.jsonary .prompt-box{position:relative;text-align:left;background-color:#fff;border:2px solid #000;border-radius:10px;padding:1em;padding-bottom:1.5em;padding-top:.5em}.jsonary .prompt-box h1{text-align:center;font-size:1.3em;font-weight:700;border:0;border-bottom:1px solid #000;margin:0}.jsonary .prompt-box h2{color:#666;text-align:center;font-size:1.1em;font-style:italic;border:0;margin:0;padding:0;margin-bottom:1em}.jsonary .prompt-buttons{position:relative;top:-13px;border:2px solid #000;border-bottom-left-radius:10px;border-bottom-right-radius:10px;padding-top:.3em;padding-bottom:.3em}.jsonary .prompt-buttons-top{padding:.3em;text-align:center}.jsonary .dialog-anchor{position:relative;height:1em}.jsonary .dialog-overlay{position:fixed;top:0;left:0;width:70%;height:100%;background-color:#000;padding-left:15%;padding-right:15%;background-color:rgba(100,100,100,.2);background-image:URL(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AwdEQcKfNuiKQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAATElEQVQY043QsQ2AQAxD0Y9rlvBYbJQts8QNQMVJIOCcysWTJWerqgPA9uBx3b1fWQkCUIJm4wrZHkrQrfEPTbhCAErQ65ivLyhBACczESoFljB75gAAAABJRU5ErkJggg==\");z-index:1000;opacity:.5}.jsonary .dialog-box{position:absolute;top:-.1em;left:-0em;width:auto;height:auto;padding:.3em;padding-top:1.3em;border:2px solid #000;border-radius:5px;background-color:#FFF;box-shadow:0 0 20px rgba(0,0,0,.1),0 3px 5px rgba(0,0,0,.3);min-width:100px;z-index:1001}.jsonary .dialog-title{display:block;margin:-.3em;margin-top:-1.3em;margin-bottom:.3em;padding-left:3em;padding-right:3em;background-color:#EEE;border-bottom:2px solid #000;font-weight:700;border-top-left-radius:4px;border-top-right-radius:4px;white-space:pre}.jsonary .dialog-close{position:absolute;display:block;margin:0;top:0;left:0;font-weight:400;font-size:.8em}.jsonary .dialog-close.button,.jsonary .dialog-close .button{margin:0;border-top-left-radius:2px;border-bottom-left-radius:2px}.jsonary input[type=text]{border:1px solid;background-color:#FFF;border-radius:3px;border-color:#CCC;border-top-color:#A6A6A6;border-bottom-color:#DDD}.jsonary textarea,.jsonary select,.jsonary textarea:hover,.jsonary select:hover{border:1px solid;background-color:#FFF;border-radius:3px;border-color:#BBB;border-top-color:#AAA;border-bottom-color:#CCC}.jsonary select{box-shadow:-1px -1px 0 rgba(0,0,0,.05),1px 0 0 rgba(0,0,0,.025),0 1px 0 rgba(255,255,255,.5),-1px 0 0 rgba(255,255,255,.25)}.jsonary select:hover{box-shadow:-1px -1px 0 rgba(0,0,0,.1),1px 0 0 rgba(0,0,0,.05),0 1px 0 rgba(255,255,255,.5),-1px 0 0 rgba(255,255,255,.5)}.jsonary .button{display:inline;text-align:center;color:#444;font-weight:700;text-decoration:none;margin-left:.5em;margin-right:.5em;padding-left:.3em;padding-right:.3em;border:1px solid;border-radius:3px;border-left-color:#BBB;border-right-color:#DDD;border-top-color:#F3F3F3;border-bottom-color:#AAA;box-shadow:0 0 1px rgba(0,0,0,.9),0 2px 4px rgba(0,0,0,.05);background:#E4E4E4;font-family:\"Trebuchet MS\";white-space:nowrap;cursor:pointer}.jsonary .button:hover{color:#222;background:#EEE;box-shadow:0 0 1px rgba(0,0,0,1),0 0 4px rgba(255,255,255,1),0 2px 4px rgba(0,0,0,.05)}.jsonary .button:active{background-color:#E0E0E0;border-left-color:#C8C8C8;border-right-color:#DDD;border-top-color:#E8E8E8;border-bottom-color:#BBB;box-shadow:0 0 1px rgba(0,0,0,1),0 0 4px rgba(255,255,255,.7),0 2px 3px rgba(0,0,0,.05)}.jsonary .button.link{color:#05C;background-color:#E0E8F0}.jsonary .button.link:hover{color:#07F;background-color:#E8F0F8;background-image:none}.jsonary .button.action{color:#000;background-color:#F0B870;font-weight:700}.jsonary .button.action:hover{background-color:#FCC47C}.jsonary .button.disabled,.jsonary .button.disabled:hover{border-color:#DDD;color:#999;background-color:#EEE;cursor:default}";
			document.head.appendChild(style);
		})();
	}


/**** plain.jsonary.css ****/

	if (typeof window != 'undefined' && typeof document != 'undefined') {
		(function () {
			var style = document.createElement('style');
			style.innerHTML = ".json-schema,.json-link{margin-right:.5em;margin-left:.5em;border:1px solid #DD3;background-color:#FFB;padding-left:.5em;padding-right:.5em;color:#880;font-size:.85em;font-style:italic;text-decoration:none}.json-link{border:1px solid #88F;background-color:#DDF;color:#008;font-style:normal}.json-raw{display:inline;white-space:pre}.json-null{font-style:italic;color:#666}.valid{background-color:#DFD}.invalid{background-color:#FDD}textarea{vertical-align:middle}.json-object{width:100%;font-size:inherit}.json-object-title{font-weight:700}.json-object-outer{background-color:#FFF;background-color:rgba(255,255,255,.8);padding:1em;padding-top:.8em;border-radius:5px;border:1px solid #DDD;border-top-color:#F2F2F2;border-bottom-color:#BBB;box-shadow:0 1px 0 rgba(0,0,0,.03);margin:-1px}.json-object-outer>legend{background-color:#EEE;border:1px solid #BBB;border-radius:3px;font-size:.8em;padding:.2em;padding-left:.7em;padding-right:.7em}.json-object-pair{margin-bottom:.3em}.json-object-key{padding:0;vertical-align:top;width:4em}.json-object-key-text,.json-object-key-title{text-align:right;font-style:italic;padding-right:.5em;border-right:1px solid #000;white-space:pre}.json-object-key-title{font-weight:700;font-style:normal;min-height:1.2em}.json-object-value{padding-left:.5em;vertical-align:top}.json-object-delete-container,.json-array-delete-container{position:relative;vertical-align:top;padding-left:1.2em}.json-object-delete-inner,.json-array-delete-inner{position:absolute;top:0;left:0}.json-object-delete,.json-array-delete{font-family:Arial,sans-serif;font-style:normal;font-weight:700;font-size:.9em;color:red;text-decoration:none;opacity:.5;transition:opacity .05s ease-in;text-shadow:0 -1px 1px rgba(255,255,255,.7),0 1px 1px rgba(0,0,0,.8)}.json-object-delete:hover,.json-array-delete:hover{opacity:1}.json-object-delete-value{}.json-object-add{display:block;padding-left:2.2em;color:#888;font-size:.9em}.json-object-add-key,.json-object-add-key-new{text-decoration:none;margin-left:1em;color:#000;border:1px solid #888;background-color:#EEE}.json-object-add-key-new{border:1px dotted #BBB;background-color:#EEF;font-style:italic}.json-select-type-dialog-outer{position:relative}.json-select-type-dialog{position:absolute;top:-.65em;left:-.5em;width:12em;border:2px solid #000;border-radius:10px;background-color:#fff;padding:.5em;z-index:1;opacity:.95;box-shadow:0 1px 3px rgba(0,0,0,.1)}.json-select-type-background{position:fixed;top:0;right:0;bottom:0;left:0;background-image:URL(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AwdEQcKfNuiKQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAATElEQVQY043QsQ2AQAxD0Y9rlvBYbJQts8QNQMVJIOCcysWTJWerqgPA9uBx3b1fWQkCUIJm4wrZHkrQrfEPTbhCAErQ65ivLyhBACczESoFljB75gAAAABJRU5ErkJggg==\")}.json-select-type{font-family:monospaced;font-weight:700;font-size:.8em;padding-left:.3em;padding-right:.3em}.json-array{font-size:inherit}.json-array-item{display:block;position:relative;padding-left:1.2em}.json-array-item .json-array-move{position:absolute;left:0;top:0}.json-array-value{}.json-string{white-space:pre-wrap;border-radius:3px;font-size:inherit}.json-string-content-editable{display:inline;display:inline-block;vertical-align:text-top;background-color:#FFF;background-color:rgba(255,255,255,.95);outline:1px solid #BBB;outline:1px solid rgba(0,0,0,.05);color:#444;margin:.1em;padding:.3em;font-family:inherit;text-shadow:none;font-size:.9em;line-height:1.2em;min-width:5em;min-height:1.2em;max-height:20em;overflow:auto;border:1px solid;background-color:#FFF;border-radius:3px;border-color:#CCC;border-top-color:#A6A6A6;border-bottom-color:#DDD}.json-string-content-editable:focus{color:#000;border-color:#48C;box-shadow:0 0 2px rgba(0,0,0,.1);z-index:1}.json-string-content-editable p{display:block!important;margin:0!important;padding:0!important}.json-string-content-editable *{position:static!important;margin:0!important;padding:0!important;font-size:inherit!important;font-family:inherit!important;color:#000!important;background:none!important;border:0!important;outline:0!important;font-weight:400!important;font-style:normal!important;text-decoration:none!important;text-transform:none!important;font-variant:normal!important;line-height:1.2em!important}textarea.json-string{font-size:inherit;font-weight:inherit;font-family:inherit;background-color:#FFF;background-color:rgba(255,255,255,.5);width:90%}.json-string-notice{color:#666;margin-left:.5em}.json-number{font-family:monospace;color:#000;font-weight:700;text-decoration:none;white-space:nowrap}input.json-number-input{width:3em;text-align:center;font-family:Trebuchet MS;font-weight:700}.json-number-increment,.json-number-decrement{font-family:monospace;padding-left:.5em;padding-right:.5em}.json-boolean-true,.json-boolean-false{font-family:monospace;color:#080;font-weight:700;text-decoration:none}.json-boolean-false{color:#800}.json-undefined-create{color:#008;text-decoration:none}.json-undefined-create:hover{color:#08F}.prompt-overlay{position:fixed;top:0;left:0;width:70%;height:100%;background-color:#000;padding-left:15%;padding-right:15%;background-color:rgba(100,100,100,.5)}.prompt-buttons{background-color:#EEE;border:2px solid #000;text-align:center;position:relative}.prompt-data{background-color:#fff;border:2px solid #000;border-radius:10px;position:relative}.json-array-move,.json-array-delete,.json-object-delete{display:block;width:16px;height:16px;text-indent:16px;overflow:hidden;background-position:center middle;background-repeat:no-repeat;opacity:.35}.json-array-move:hover,.json-array-delete:hover,.json-object-delete:hover{opacity:1}.json-array-delete,.json-object-delete{background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAApElEQVQ4y82SsQ3CMBBFHxEFAyAKF6HLCKTPHhnkJsgg2SODuDNFhJAHcIFsmhSWYgeQkeCkq/7/r7h/8G9zAcKGHhZPPmxFQgYSa0lIsCLh1raxsV42pfEuZDO8y0B4TBNV0wDgtWbfdRyHYZVJAWrA3PuewzwD4JTiNI4AZ+Aam6vS2lIAY0XwWuOUwimF1xorAmBeAT8+4ldrLH6k4lf+zTwBbL+JOS+cUboAAAAASUVORK5CYII=\")}.json-array-move-start{background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAdElEQVQ4y62Tyw2AIBBEH94oAauwB+qedrQEj3iRRBMW5TPJXAjzQnYHsLUB6XagUQFIkpKkKsQZ4V3S6zDGCLACRw1QDNcg7m/YgriWsAUJj2m3essv8PTpXOiXLxWm1WF4iNPWOKVIXVUe/kyfkFwY69IFeyZbUaKi2aEAAAAASUVORK5CYII=\");float:left}.json-array-move-cancel{background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZklEQVQ4y81SwQmAQAwLDuIYjpwtOlee8XNCxTs5KaKBvtKEpi3wN2wAfMO79YzFEeGBSea6Jo4I286Na6seh1mTafHFhKRJPhLjGJmkJVmSSeZIJyxvnLIUobTE8hnLj1R+5W+wA9RyupOydS/wAAAAAElFTkSuQmCC\")}.json-array-move-select{background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAdUlEQVQ4y+2RMQqAMBAE58BGG+v4ChsL67x7X+A/9AmWsVBBwQQTWxcC4cgMdxdjT6AsVh2XERgy4enNowZoC7ujP0YLgMuFHRAkBUlJiUXgWdKt6L0H6IAlJXiEUxJ7C8cklgPHJO6y7dzTnx3UhV+98ud7NsZqMHtU+VD/AAAAAElFTkSuQmCC\")}.json-array-move-up{background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAW0lEQVQ4y+2QwQmAMAxFX4+OEKfoDp37r6MjeKwXhQomGM99kEvgPULApwL9GiOJAV1SlxRGiiNvkh7L1hrACuxR4FWOIuWr7EVKRvYiNnw7O/W+YOEfB5MJcAIH0y4k53GkLAAAAABJRU5ErkJggg==\")}.json-array-move-down{background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAY0lEQVQ4y+2RsQnAMAwEz2VGUKbwDp7710lGSOk0MYhgB8W1H4RAcC/xgqUlSE/fJvkLwIA6WbldYMAhKbS2lAKwA2dy85CJh30GIZM33DMYmvTgLxlQJVVJLTD7+6Ls0h7CNyr1LiTNtq8FAAAAAElFTkSuQmCC\")}";
			document.head.appendChild(style);
		})();
	}


/**** jsonary.render.table.css ****/

	if (typeof window != 'undefined' && typeof document != 'undefined') {
		(function () {
			var style = document.createElement('style');
			style.innerHTML = ".json-array-table{border-spacing:0;border-collapse:collapse}.json-array-table .json-array-table{width:100%;margin:-4px;width:calc(100% + 8px)}.json-array-table>thead>tr>th{background-color:#EEE;border-bottom:1px solid #666;padding:.3em;font-size:.9em;font-weight:700;text-align:center}.json-array-table>thead{border:1px solid #BBB}.json-array-table>thead>tr>th.json-array-table-pages{border-bottom:1px solid #BBB;background-color:#DDD}.json-array-table>thead>tr>th.json-array-table-pages .button{font-family:Courier New,monospace}.json-array-table>tbody>tr>td{border:1px solid #CCC;border-top-color:#DDD;border-bottom-color:#DDD;padding:3px;font-size:inherit;text-align:left}.json-array-table>tbody>tr>td.json-array-table-full{padding:.3em;background-color:#EEE}.json-array-table>tbody>tr>td.json-array-table-add{text-align:center;background-color:#F8F8F8;border:1px solid #DDD}.json-array-table-full-buttons{text-align:center}.json-array-table-full-title{text-align:center;margin:-.3em;margin-bottom:.5em;background-color:#CCC;border-bottom:1px solid #BBB;font-weight:700;padding:.2em}.json-array-table-sort,.json-array-table-sort-asc,.json-array-table-sort-desc{padding-left:15px;padding-right:15px;margin-left:-5px;margin-right:-5px}.json-array-table-sort-asc,.json-array-table-sort-desc{background-position:right center;background-repeat:no-repeat}.json-array-table-sort-text{display:block;float:right;width:0;overflow:hidden}.json-array-table-sort-asc{background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAXklEQVQoz+3SuwmAQBBF0SPGNmG1lrENmCoWZGoH7pqssCyCn9gLE0xweW9g+ClpMaD5Is9IGN9ITRZilmPeHzUIWaon3IkL9iI1Fek7prriSYe+EK/OgRXb/08fOAC7tBnlR5zMuwAAAABJRU5ErkJggg==\")}.json-array-table-sort-desc{background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAW0lEQVQoz2NgGAUkAUY0NgsRev4yMDD8wyaxE0nyPxL+BxXfhs9UHQYGhgVoGmF4AVQeL9BlYGBYi2T7Pyhfl9iw0GFgYNgO1byWGBvRgT4DA0MHKTZic8FwAwDm/hlxhNq1AAAAAABJRU5ErkJggg==\")}";
			document.head.appendChild(style);
		})();
	}


/**** tag-list.css ****/

	if (typeof window != 'undefined' && typeof document != 'undefined') {
		(function () {
			var style = document.createElement('style');
			style.innerHTML = ".json-tag-list{width:100%;overflow:auto;position:relative}.json-tag-list-current{width:100%;overflow:auto;position:relative}.json-tag-list-entry{display:block;float:left;padding:1px;padding-left:3px;padding-right:3px;background-color:#F0F2F8;border:1px solid #CCD;border-bottom-color:#BBB;border-top-color:#DDDDE4;border-radius:3px}.json-tag-list-add{clear:both;float:left;border-radius:4px;background-color:#EEE;border-bottom:1px solid #DDD;border-top:1px solid #F8F8F8}";
			document.head.appendChild(style);
		})();
	}


/**** image-picker.css ****/

	if (typeof window != 'undefined' && typeof document != 'undefined') {
		(function () {
			var style = document.createElement('style');
			style.innerHTML = ".base64-image-preview{width:100px;height:100px;overflow:hidden;text-align:center;padding:2px}.base64-image-preview img{max-height:100%;max-width:100%;vertical-align:middle;border:1px solid #444;border-radius:2px;box-shadow:0 1px 2px rgba(0,0,0,.2)}";
			document.head.appendChild(style);
		})();
	}

return this;
}).call(this);