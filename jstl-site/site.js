var jstlserver = require('jstl-server');
var mime = require('mime');

var server = jstlserver.createServer().listen(8080);
setupServer(server);

/*
var server = jstlserver.createServer().listen(80);
setupServer(server);
*/

jstlserver.handlers.jstl.addIncludeDir("include/");

function setupServer(server) {
	// Steal certain files from the parent directory
	var filesFromMain = {
		"/jsonary.js": true,
		"/jsonary.min.js": true,
		"/get-started-bundle.zip": true
	}
	server.addHandler(jstlserver.directoryHandler("/", "../")
		.addHandler(jstlserver.fileReader(function (request, response) {
			return filesFromMain[request.path];
		}, function (request, response, buffer, next) {
			if (typeof filesFromMain[request.path] == "string") {
				var mimeType = filesFromMain[request.path];
			} else {
				var mimeType = mime.lookup(request.path);
			}
			response.setHeader("Content-Type", mimeType);
			response.end(buffer);
		}))
	);
	// Also, merge in the renderers/ and plugins/ directories
	server.addHandler(jstlserver.directoryHandler("/renderers/", "../renderers")
		.addHandler(jstlserver.handlers.plain)
	);
	server.addHandler(jstlserver.directoryHandler("/plugins/", "../plugins")
		.addHandler(jstlserver.handlers.plain)
	);

	// Include the HTML site from html/
	server.addHandler(jstlserver.directoryHandler("/", "html/")
		.addHandler(jstlserver.handlers.jstl)
		.addHandler(jstlserver.handlers.plain)
	);
	// And include the JSON APIs
	server.addHandler(jstlserver.directoryHandler("/json/", "json/")
		.addHandler(new jstlserver.Handler(true, function (request, response, next) {
			request.path = request.path.replace(/^\/pages\//, "/index.jshtml/pages/");
			console.log(request.path);
			next();
		}))
		.addHandler(jstlserver.handlers.jstl)
		.addHandler(jstlserver.handlers.plain)
	);
}