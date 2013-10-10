tests.add("Match all fixed schemas for data", function () {
	var schema = Jsonary.createSchema({
		"title": "Example schema",
		"type": "array",
		"items": {"type": "string"}
	});
	
	var data = Jsonary.create(["string", false]).addSchema(schema);

	var match = data.validate();
	this.assert(!!match, "match should be defined");
	this.assert(!!match.errors, "match.errors should be defined");
	this.assert(match.valid === false, "match.valid should be false");
	this.assert(typeof match.errors[0].message === 'string', "Error message should be string");
	
	return true;
});

tests.add("Available as data.valid()", function () {
	var schema = Jsonary.createSchema({
		"title": "Example schema",
		"type": "array",
		"items": {"type": "string"}
	});
	
	var data = Jsonary.create(["string", "foo"]).addSchema(schema);

	this.assert(data.valid() === true, "data.valid() should be true");
	
	return true;
});

tests.add("Works for read-only as well", function () {
	var schema = Jsonary.createSchema({
		"title": "Example schema",
		"type": "array",
		"items": {"type": "string"}
	});
	
	var data = Jsonary.create(["string", false], null, true).addSchema(schema);

	var match = data.validate();
	this.assert(match.valid === false, "match.valid should be false");
	
	return true;
});

tests.add("Tracks data changes", function () {
	var schema = Jsonary.createSchema({
		"title": "Example schema",
		"type": "array",
		"items": {"type": "string"}
	});
	
	var data = Jsonary.create(["string", false]).addSchema(schema);

	var match = data.validate();
	this.assert(match.valid === false, "match.valid should be false");
	
	data.set('/1', 'foo');
	
	this.assert(match.valid === true, "match.valid should be true after change");
	
	return true;
});

tests.add("Callback when changed", function () {
	var thisTest = this;
	var schema = Jsonary.createSchema({
		"title": "Example schema",
		"type": "array",
		"items": {"type": "string"}
	});
	
	var data = Jsonary.create(["string", false]).addSchema(schema);

	var callbackCounter = 0;
	data.validate().onChange(function (match) {
		callbackCounter++;
		if (callbackCounter == 1) {
			thisTest.assert(match.valid === false, 'initial is false');
		} else if (callbackCounter == 2) {
			thisTest.assert(match.valid === true, 'second is true');
		} else {
			thisTest.assert(match.valid === false, 'remaining is false');
		}
	});
	
	data.set('/1', 'foo');
	data.set('/0', 5);
	
	this.assert(callbackCounter === 3, 'Should have three callbacks by end');
	return true;
});

tests.add("Child also has validation", function () {
	var schema = Jsonary.createSchema({
		"title": "Example schema",
		"type": "array",
		"items": {"type": "string"}
	});
	
	var data = Jsonary.create(["string", false]).addSchema(schema);

	this.assert(data.item(0).valid() === true, "first child should be valid");
	this.assert(data.item(1).valid() === false, "second child should be invalid");
	
	return true;
});
