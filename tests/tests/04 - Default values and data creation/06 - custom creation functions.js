tests.add("custom function", function () {
	var customFormat = 'test-format-' + Math.random();
	Jsonary.extendCreateValue(function (schemas) {
		if (schemas.containsFormat(customFormat)) {
			return "Custom string";
		}
	});
	var schema1 = Jsonary.createSchema({
		"type": "string",
		"format": customFormat
	});
	var createdData = schema1.createValue();
	
	this.assert(createdData == "Custom string", "value matches");
	return true;
});
