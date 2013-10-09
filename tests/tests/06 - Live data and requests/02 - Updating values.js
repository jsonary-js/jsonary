tests.add("invalidate() - string argument", function () {
	var thisTest = this;
	Jsonary.addToCache("test.json?test=invalidate_1", "Cached data");
	var data;
	Jsonary.getData("test.json?test=invalidate_1", function(d) {
		data = d;
	});
	
	this.assert(data.value() == "Cached data", "Value should be \"Test data\", not " + JSON.stringify(data.value()));
	
	Jsonary.invalidate("test.json?test=invalidate_1");

	setTimeout(function () {	
		thisTest.assert(data.basicType() == "object", "Basic type should be object, was " + JSON.stringify(data.basicType()));
		thisTest.pass();
	}, 100);
});

tests.add("invalidate() - regex argument", function () {
	var thisTest = this;
	Jsonary.addToCache("test.json?test=invalidate_2", "Cached data");
	var data;
	Jsonary.getData("test.json?test=invalidate_2", function(d) {
		data = d;
	});
	
	this.assert(data.value() == "Cached data", "Value should be \"Test data\", not " + JSON.stringify(data.value()));
	
	Jsonary.invalidate(/test\.json/);

	setTimeout(function () {	
		thisTest.assert(data.basicType() == "object", "Basic type should be object, was " + JSON.stringify(data.basicType()));
		thisTest.pass();
	}, 100);
});
