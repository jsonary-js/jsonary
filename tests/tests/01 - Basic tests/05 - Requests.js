tests.add("Inserting into cache", function() {
    var thisTest = this;
    var url = "http://example.com/test.json";
    var testData = {"key":"value"};
    Jsonary.addToCache(url, testData);
    var request = Jsonary.getData(url, function(data, req) {
        thisTest.assert(recursiveCompare(testData, data.value()), "Returned data does not match: " + JSON.stringify(testData) + " vs " + JSON.stringify(data.value()));
        thisTest.pass();
    });
    setTimeout(function() {
        thisTest.fail("Timeout");
    }, 50);
});

tests.add("encodeData()", function() {
	var data = [
		"plain string",
		1,
		{"key": "value"},
		{"array":[null, true, 3, "4"]},
		{"object":{"key": "value"}},
		{"array":[[0,1],[2,3]]}
	];
	var expectedForm = [
		"plain%20string",
		"1",
		"key=value",
		"array%5B%5D=null&array%5B%5D=true&array%5B%5D=3&array%5B%5D=4",
		"object%5Bkey%5D=value",
		"array%5B0%5D%5B%5D=0&array%5B0%5D%5B%5D=1&array%5B1%5D%5B%5D=2&array%5B1%5D%5B%5D=3",
	];
	var expectedJson = [
		"\"plain string\"",
		"1",
		"{\"key\":\"value\"}",
		'{"array":[null,true,3,"4"]}',
		'{"object":{"key":"value"}}',
		'{"array":[[0,1],[2,3]]}'
	];
	for (var i = 0; i < data.length; i++) {
		var formResult = Jsonary.encodeData(data[i]);
		this.assert(formResult == expectedForm[i], "Expected form:\n" + expectedForm[i] + ", got:\n" + formResult);
		if (expectedJson[i] != undefined) {
			var jsonResult = Jsonary.encodeData(data[i], "application/json");
			this.assert(jsonResult == expectedJson[i], "Expected JSON:\n" + expectedJson[i] + ", got:\n" + formResult);
		}
	}
	return true;
});
