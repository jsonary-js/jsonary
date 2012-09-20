tests.add("Schema hint (test.json)", function () {
	var thisTest = this;
	Jsonary.addToCache("http://example.com/schema", {
		"title": "Test"
	});
	var request = Jsonary.getData("test.json?test=Schema_hint", function (data, req) {
		var schemas = data.schemas();
		thisTest.assert(schemas.length == 1, "schemas.length == 1, not " + schemas.length);
		thisTest.assert(schemas[0].title() == "Test", "schemas[0].title() == \"Test\", not " + JSON.stringify(schemas[0].title));
		thisTest.pass();
	}, "http://example.com/schema");
	setTimeout(function () {
		thisTest.fail("Timeout");
	}, 50);
});

tests.add("Schema hint from link (test.json)", function () {
	var thisTest = this;
	Jsonary.addToCache("http://example.com/schema", {
		"title": "Test"
	});
	var linkDefinition = Jsonary.create({
		"href": "test.json?test=Schema_hint_from_link",
		"rel": "test",
		"targetSchema": {
			"$ref": "http://example.com/schema"
		}
	});
	var link = linkDefinition.asLink();

	var request = link.follow();
	request.getData(function (data, req) {
		var schemas = data.schemas();
		thisTest.assert(schemas.length == 1, "schemas.length == 1, not " + schemas.length);
		thisTest.assert(schemas[0].title() == "Test", "schemas[0].title() == \"Test\", not " + JSON.stringify(schemas[0].title));
		thisTest.pass();
	}, "http://example.com/schema");
	setTimeout(function () {
		thisTest.fail("Timeout");
	}, 50);
});
