var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var cleanCss = require('clean-css');
var mime = require('mime');

function Bundle() {
	this.baseDir = '.';
	this.jsCode = [];
	this.cssJsCode = [];
	this.cssCode = [];
}
Bundle.prototype = {
	base: function (baseDir) {
		this.baseDir = baseDir;
		return this;
	},
	filename: function (filename) {
		if (filename.charAt(0) == '/') {
			return filename;
		}
		return path.join(this.baseDir, filename);
	},
	css: function (filenames) {
		if (typeof filenames == 'string') {
			filenames = [filenames];
		}
		var jsCode = "";
		for (var i = 0; i < filenames.length; i++) {
			var filename = filenames[i];
			var resolvedFilename = this.filename(filenames[i]);
			var cssCode = fs.readFileSync(resolvedFilename, {enc:'utf8'}).toString();
			// Replace each URI(...) with a base64-encoded data URI
			cssCode = cssCode.replace(/((:|\s)url\()\s*(.*)\s*\)/gi, function (fullString, prefix, spacing, uri) {
				if (uri.substring(0, 10).replace(/^('|")/, '').toLowerCase().substring(0, 5) == "data:") {
					return fullString;
				}
				var suffix = fullString.substring(prefix.length + uri.length);
				if (uri.charAt(0) == '"' || uri.charAt(0) == "'") {
					uri = uri.substring(1, (uri.charAt(uri.length - 1) === uri.charAt(0)) ? uri.length - 1 : uri.length);
				}
				var resourcePath = path.resolve(path.dirname(resolvedFilename), uri);
				var base64 = fs.readFileSync(resourcePath).toString('base64');
				var mimeType = mime.lookup(resourcePath);
				var dataUri = "data:" + mimeType + ";base64," + base64;
				return prefix + JSON.stringify(dataUri) + suffix;
			});
			this.cssCode.push('\n\n/**** ' + path.basename(filename) + ' ****/\n\n' + cssCode);
			
			jsCode += '\n\n/**** ' + path.basename(filename) + ' ****/\n\n';
			jsCode += "	if (typeof window != 'undefined' && typeof document != 'undefined') {\n";
			jsCode += "		(function () {\n";
			jsCode += "			var style = document.createElement('style');\n";
			jsCode += "			style.innerHTML = " + JSON.stringify(cleanCss.process(cssCode)) + ";\n";
			jsCode += "			document.head.appendChild(style);\n";
			jsCode += "		})();\n";
			jsCode += "	}\n";
		}
		this.cssJsCode.push(jsCode);
		return this;
	},
	code: function (code) {
		if (typeof code == 'string') {
			code = [code];
		}
		this.jsCode.push(code.join('\n'));
		return this;
	},
	js: function (filenames) {
		if (typeof filenames == 'string') {
			filenames = [filenames];
		}
		var code = "";
		for (var i = 0; i < filenames.length; i++) {
			var filename = filenames[i];
			var resolvedFilename = this.filename(filenames[i]);
			code += '\n\n/**** ' + path.basename(filename) + ' ****/\n\n\t';
			code += fs.readFileSync(resolvedFilename, {enc:'utf8'}).toString().replace(/\n/g, "\n\t");
		}
		this.jsCode.push(code);
		return this;
	},
	compileJs: function (outputFile, minify, includeCss) {
		var code = '(function() {\n';
		code += this.jsCode.join("");
		if (includeCss) {
			code += this.cssJsCode.join("");
		}
		code += '\nreturn this;\n';
		code += '})';
		code = code.replace(/\r\n/g, "\n");
		
		if (outputFile) {
			outputFile = this.filename(outputFile);
			// Timestamp line also keeps line numbers in sync between bundle file and anonymous function in Node
			var today = new Date();
			function pad(n) {
				return (n < 10) ? '0' + n : '' + n
			}
			var fileCode = '/* Bundled on ' + today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate()) + ' */\n' + code + '.call(this);';
			if (minify) {
				var outputDir = path.dirname(outputFile);
				var outputBasename = path.basename(outputFile);
				var mapFile = outputBasename + ".map";
				var minifiedFile = outputBasename.replace(/\.js$/i, '.min.js');
				var oldCwd = process.cwd();
				process.chdir(outputDir);
				fs.writeFileSync(outputBasename, fileCode, {enc:'utf8'});
				var uglifyResult = uglify.minify(outputBasename, {outSourceMap: mapFile, prefix: outputDir});
				fs.writeFileSync(minifiedFile, uglifyResult.code, {enc:'utf8'});
				fs.writeFileSync(mapFile, uglifyResult.map, {enc:'utf8'});
				var uglifyResult = uglify.minify(fileCode, {fromString: true});
				process.chdir(oldCwd);
			} else {
				fs.writeFileSync(outputFile, fileCode, {enc:'utf8'});
			}
		}
		
		var functionCode = 'return ' + code + '.call({}); // to set "this" in case any of the renderers/code expect a global context\n';
		return new Function(functionCode);
	},
	compileCss: function (outputFile, minify) {
		var today = new Date();
		function pad(n) {
			return (n < 10) ? '0' + n : '' + n
		}
		var cssCode = '/* Bundled on ' + today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate()) + ' */\n';
		cssCode += this.cssCode.join("");
		if (minify) {
			cssCode = cleanCss.process(cssCode);
		}
		if (outputFile) {
			outputFile = this.filename(outputFile);
			fs.writeFileSync(outputFile, cssCode, {enc:'utf8'});
		}
		return cssCode;
	}
};
Bundle.prototype.compile = Bundle.prototype.compileCss;

exports.base = function (baseDir) {
	return (new Bundle).base(baseDir);
}

exports.js = function (filenames) {
	var bundle = new Bundle();
	if (filenames) {
		bundle.js(filenames);
	}
	return bundle;
};

exports.css = function (filenames) {
	var bundle = new Bundle();
	if (filenames) {
		bundle.css(filenames);
	}
	return bundle;
}