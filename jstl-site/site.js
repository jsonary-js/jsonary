var jstlserver = require('jstl-server');
var mime = require('mime');

var server = jstlserver.createServer().listen(8080);

var filesFromMain = {
	"/jsonary.js": true,
	"/jsonary.min.js": true,
	"/get-started-bundle.zip": true
}
server.addHandler(jstlserver.directoryHandler("/renderers/", "../renderers")
	.addHandler(jstlserver.handlers.plain)
);
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

server.addHandler(jstlserver.directoryHandler("/", "public/")
	.addHandler(jstlserver.handlers.jstl.addIncludeDir("include/"))
	.addHandler(new jstlserver.Handler(true, function (request, response, next) {
		next();
	}))
	.addHandler(jstlserver.handlers.plain)
);