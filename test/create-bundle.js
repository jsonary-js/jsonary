var fs = require('fs');
var path = require('path');

exports.js = function (filenames, outputFile) {
	var code = '(function() {\n';
	for (var i = 0; i < filenames.length; i++) {
		if (Array.isArray(filenames[i])) {
			code += filenames[i].join('\n');
			continue;
		}
		var filename = filenames[i];
		code += '\n\n/* ' + filename + '*/\n\n';
		code += fs.readFileSync(filename, {enc:'utf8'});
	}
	code += '\nreturn this;\n';
	code += '})';
	
	if (outputFile) {
		//console.log('Writing JS bundle to: ' + outputFile);
		// Timestamp line also keeps line numbers in sync between bundle file and anonymous function in Node
		var fileCode = '/* Bundled on ' + (new Date) + '*/\n' + code + '.call(this);';
		fs.writeFileSync(outputFile, fileCode, {enc:'utf8'});
	}
	
	var functionCode = 'return ' + code + '.call({}); // to set "this" in case any of the renderers/code expect a global context\n';
	return new Function(functionCode);
};

exports.plain = function (filenames, outputFile, comments) {
	if (comments === undefined) {
		comments = true;
	}
	var code = '';
	for (var i = 0; i < filenames.length; i++) {
		if (Array.isArray(filenames[i])) {
			code += filenames[i].join('\n');
			continue;
		}
		var filename = filenames[i];
		if (comments) {
			code += '\n\n/* ' + filename + '*/\n\n';
		}
		code += fs.readFileSync(filename, {enc:'utf8'}) + "\n";
	}
	
	if (comments) {
		var code = '/* Bundled on ' + (new Date) + '*/\n' + code + '.call(this);';
	}
	if (outputFile) {
		//console.log('Writing plain bundle to: ' + outputFile);
		// Timestamp line also keeps line numbers in sync between bundle file and anonymous function in Node
		fs.writeFileSync(outputFile, code, {enc:'utf8'});
	}
	
	return code;
};