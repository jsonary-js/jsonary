tests.add("Uses original value if matches oneOf (first)", function () {
	var schema1 = Jsonary.createSchema({
		"oneOf": [
			{"type": "number"},
			{"type": "string"}
		]
	});
	var createdData = schema1.createValue(5);
	
	this.assert(createdData == 5, "value matches");
	return true;
});

tests.add("Uses original value if matches oneOf (second)", function () {
	var schema1 = Jsonary.createSchema({
		"oneOf": [
			{"type": "number"},
			{"type": "string"}
		]
	});
	var createdData = schema1.createValue("test");
	
	this.assert(createdData == "test", "value matches");
	return true;
});

tests.add("Uses original value if matches oneOf (first option, in property)", function () {
	var schema1 = Jsonary.createSchema({
		"type": "object",
		"oneOf": [
			{
				"properties": {
					"myProp": {"type": "number"}
				}
			},
			{
				"properties": {
					"myProp": {"type": "string"}
				}
			}
		]
	});
	var createdData = schema1.createValue({myProp: 10});
	
	this.assert(createdData.myProp === 10, "value matches: " + JSON.stringify(createdData));
	return true;
});

tests.add("Uses original value if matches oneOf (second option, in property)", function () {
	var schema1 = Jsonary.createSchema({
		"type": "object",
		"oneOf": [
			{
				"properties": {
					"myProp": {"type": "number"}
				}
			},
			{
				"properties": {
					"myProp": {"type": "string"}
				}
			}
		]
	});
	var createdData = schema1.createValue({myProp: "10"});
	
	this.assert(createdData.myProp === "10", "value matches: " + JSON.stringify(createdData));
	return true;
});
