(function(global) { // Global wrapper
	
var publicApi = {
    "toString": function() {
        return "[JsonApi]";
    }
};
window.Jsonary = publicApi;

function setTimeout(fn, t) {
	throw new Error("setTimeout() should not be used");
	fn();
	//Utils.log(Utils.logLevel.DEBUG, "setTimeout()");
	//return window.setTimeout(fn, t);
}

