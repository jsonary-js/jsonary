var fs = require('fs');
var path = require('path');

exports.globalIncludes = [
	'../jsonary.js',
	[
		'var Jsonary = this.Jsonary;'
	],
	'../renderers/plain.jsonary.js',
	'../renderers/string-formats.js'
];
exports.createBundle = function (filenames, outputFile) {
	filenames = this.globalIncludes.concat(filenames || []);
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
		console.log('Writing bundle to: ' + outputFile);
		// Timestamp line also keeps line numbers in sync between bundle file and anonymous function in Node
		var fileCode = '/* Bundled on ' + (new Date) + '*/\n' + code + '.call(this);';
		fs.writeFileSync(outputFile, fileCode, {enc:'utf8'});
	}
	
	var functionCode = 'return ' + code + '.call({}); // to set "this" in case any of the renderers/code expect a global context\n';
	return new Function(functionCode);
};