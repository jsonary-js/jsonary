tests.add("Jsonary.beforeAjax(callback)", function () {
	var thisTest = this;

	Jsonary.beforeAjax(function (params) {
		params.headers['x-test-2'] = ':)';
	});	
	Jsonary.ajaxFunction = (function (oldFunction) {
		return function (params, callback) {
			thisTest.assert(params.headers, 'headers defined');
			thisTest.assert(params.headers['x-test-2'] === ':)', '"X-Test-2" headers set to correct value');
			thisTest.pass();
			return oldFunction.call(null, params, callback);
		};
	})(Jsonary.ajaxFunction);

	Jsonary.getData({
		url: "test.json?test=extra_headers_1"
	});
	
	setTimeout(function () {	
		thisTest.fail('timeout');
	}, 100);
});