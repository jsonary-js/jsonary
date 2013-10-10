tests.add("Extra headers from request options", function () {
	var thisTest = this;
	
	Jsonary.ajaxFunction = (function (oldFunction) {
		return function (params, callback) {
			thisTest.assert(params.headers, 'headers defined');
			thisTest.assert(params.headers['x-test'] === 'test-value', '"X-Test" headers set to correct value');
			thisTest.pass();
			return oldFunction.call(null, params, callback);
		};
	})(Jsonary.ajaxFunction);

	Jsonary.getData({
		url: "test.json?test=extra_headers_1",
		headers: {
			"X-Test": "test-value"
		}
	});
	
	setTimeout(function () {	
		thisTest.fail('timeout');
	}, 100);
});