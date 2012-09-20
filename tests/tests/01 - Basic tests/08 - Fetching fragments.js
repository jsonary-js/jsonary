tests.add("Basic fragment", function () {
	var thisTest = this;
	var url = "http://example.com/test.json";
	var testData = {
		"key": "value"
	};
	Jsonary.addToCache(url, testData);
	var request = Jsonary.getData(url + "#/key", function (data, req) {
		thisTest.assert(data.value() == "value", "Returned data does not match: " + JSON.stringify(data.value()) + " != \"value\"");
		thisTest.pass();
	});
	setTimeout(function () {
		thisTest.fail("Timeout");
	}, 50);
});
