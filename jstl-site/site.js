var jstlserver = require('./jstl-server');
var handlers = jstlserver.handlers;
var mime = require('mime');

handlers.jstl.addIncludeDir("include/");

var siteHandler = handlers.createComposite();

var staticFiles = siteHandler.get();
// Steal certain files from the parent directory
var filesFromMain = {
	"/jsonary.js": true,
	"/jsonary.min.js": true,
	"/get-started-bundle.zip": true,
	"/LICENSE.txt": true
}
staticFiles.directory("/", "../")
	.fileReader(function (request, response) {
		return filesFromMain[request.path];
	}, function (request, response, buffer, next) {
		if (typeof filesFromMain[request.path] == "string") {
			var mimeType = filesFromMain[request.path];
		} else {
			var mimeType = mime.lookup(request.path);
		}
		response.setHeader("Content-Type", mimeType);
		response.end(buffer);
	});

// Also, merge in the renderers/ and plugins/ directories
staticFiles.directory("/renderers/", "../renderers")
	.add(handlers.plain);
staticFiles.directory("/plugins/", "../plugins")
	.add(handlers.plain);

// Include the JSON APIs from json/
staticFiles.directory("/json/", "json/")
	.add(true, function (request, response, next) {
		request.path = request.path.replace(/^\/pages\//, "/index.jshtml/pages/");
		next();
	})
	.add(jstlserver.handlers.jstl)
	.add(jstlserver.handlers.plain);

// Include the HTML site from html/
staticFiles.directory("/", "html/")
	.add(handlers.jstl)
	.add(handlers.cacheControl(true, handlers.cacheControl.presets.staticFiles))
	.add(handlers.plain);
/*
var server = jstlserver.createServer().listen(80);
setupServer(server);
*/

function setupServer(server) {

}

setupServer(siteHandler);

var server = jstlserver.createServer().listen(8080);
server.addHandler(siteHandler);
