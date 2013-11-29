tests.add("percent-encoded data URL", function () {
	var thisTest = this;

	Jsonary.getData("data:application/json,%22Hello!%22", function (data) {
		thisTest.assert(data.value() === "Hello!", 'Value mismatch: ' + data.json());
		thisTest.pass();
	});
	
	setTimeout(function () {	
		thisTest.fail('timeout');
	}, 100);
});