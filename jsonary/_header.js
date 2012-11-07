(function(global) { // Global wrapper
	
var publicApi = {
    "toString": function() {
        return "[JsonApi]";
    }
};
global.Jsonary = publicApi;

function setTimeout(fn, t) {
	throw new Error("setTimeout() should not be used");
}

