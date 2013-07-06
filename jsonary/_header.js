(function(publicApi) { // Global wrapper
	
publicApi.toString = function() {
	return "<Jsonary>";
};
publicApi.plugins = {};

function setTimeout(fn, t) {
	throw new Error("setTimeout() should not be used");
}

