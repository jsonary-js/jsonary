var express = require('express');
var jsonary = require('../jsonary-server.js');
var bundle = require('./create-bundle.js');

var app = express();
app.get('/', function (request, response) {
	// This could be put up above, but this way it refreshes the bundle on every request
	var jsonaryBundle = bundle.createBundle([
		[
			'Jsonary.actionUrl = function () {',
			'	var args = arguments',
			'	return "javascript:console.log(" + encodeURIComponent(JSON.stringify(args)) + ")";',
			'}'
		]
	], 'bundle.js');

	response.setHeader('Content-Type', 'text/html');
	
	console.time('instantiating bundle');
	var result = jsonaryBundle();
	var Jsonary = result.Jsonary;
	console.timeEnd('instantiating bundle');
	
	var html = Math.random() + "<br>\n";
	var data = Jsonary.create({
		"title": "Test object",
		"data": [
			null,
			true,
			15.5,
			"test"
		]
	});
	html += Jsonary.renderHtml(data);
	response.send(html);
});
app.listen(8080);
console.log('Listening on port 8080');