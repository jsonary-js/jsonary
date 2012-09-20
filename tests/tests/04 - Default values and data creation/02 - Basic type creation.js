tests.add("basicTypes()", function () {
	var schema1 = Jsonary.createSchema({
		"type": ["string", "object", "boolean"]
	});
	var schema2 = Jsonary.createSchema({
		"type": ["string", "boolean", "number"]
	});
	var schemaList = Jsonary.createSchemaList([schema1, schema2]);
	
	var basicTypes = schemaList.basicTypes();
	this.assert(basicTypes.length == 2, "length == 2: " + JSON.stringify(basicTypes));
	this.assert((basicTypes[0] == "string" && basicTypes[1] == "boolean") || (basicTypes[1] == "string" && basicTypes[0] == "boolean"), "boolean and string, in some order");

	return true;
});

tests.add("null", function () {
	var schema = Jsonary.createSchema({
		"type": "null"
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(value === null, "value === null, was " + JSON.stringify(value));

	return true;
});

tests.add("boolean", function () {
	var schema = Jsonary.createSchema({
		"type": "boolean"
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(typeof value == "boolean", "typeof value == \"boolean\", was " + typeof value + " (" + JSON.stringify(value) + ")");

	return true;
});

tests.add("integer", function () {
	var schema = Jsonary.createSchema({
		"type": "integer",
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(typeof value == "number", "typeof value == \"number\", was " + typeof value + " (" + JSON.stringify(value) + ")");
	this.assert(value%1 == 0, "value should be integer, was " + JSON.stringify(value));

	return true;
});

tests.add("integer min/max", function () {
	var schema = Jsonary.createSchema({
		"type": "integer",
		"minimum": 0.5,
		"maximum": 9.5
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(typeof value == "number", "typeof value == \"number\", was " + typeof value + " (" + JSON.stringify(value) + ")");
	this.assert(value%1 == 0, "value should be integer, was " + JSON.stringify(value));
	this.assert(value >= schema.minimum(), "value >= minimum, was " + JSON.stringify(value));
	this.assert(value <= schema.maximum(), "value <= maximum, was " + JSON.stringify(value));

	return true;
});

tests.add("integer max", function () {
	var schema = Jsonary.createSchema({
		"type": "integer",
		"maximum": -1
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(typeof value == "number", "typeof value == \"number\", was " + typeof value + " (" + JSON.stringify(value) + ")");
	this.assert(value%1 == 0, "value should be integer, was " + JSON.stringify(value));
	this.assert(value <= schema.maximum(), "value <= maximum, was " + JSON.stringify(value));

	return true;
});

tests.add("number interval", function () {
	var schema = Jsonary.createSchema({
		"type": "number",
		"divisibleBy": 2,
		"minimum": -4.2,
		"maximum": 9.5
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(typeof value == "number", "typeof value == \"number\", was " + typeof value + " (" + JSON.stringify(value) + ")");
	this.assert(value%1 == 0, "value should be integer, was " + JSON.stringify(value));
	this.assert(value >= schema.minimum(), "value >= minimum, was " + JSON.stringify(value));
	this.assert(value <= schema.maximum(), "value <= maximum, was " + JSON.stringify(value));

	return true;
});


tests.add("number exclusive min/max", function () {
	var schema = Jsonary.createSchema({
		"type": "number",
		"minimum": 0.5,
		"maximum": 1.5,
		"exclusiveMinimum": true,
		"exclusiveMaximum": true
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(typeof value == "number", "typeof value == \"number\", was " + typeof value + " (" + JSON.stringify(value) + ")");
	this.assert(value > schema.minimum(), "value > minimum, was " + JSON.stringify(value));
	this.assert(value < schema.maximum(), "value < maximum, was " + JSON.stringify(value));

	return true;
});

tests.add("string", function () {
	var schema = Jsonary.createSchema({
		"type": "string"
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(typeof value == "string", "typeof value == \"string\", was " + typeof value + " (" + JSON.stringify(value) + ")");

	return true;
});

tests.add("array", function () {
	var schema = Jsonary.createSchema({
		"type": "array"
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(Array.isArray(value), "Array.isArray(value) note true for: " + JSON.stringify(value));

	return true;
});

tests.add("array minItems", function () {
	var schema = Jsonary.createSchema({
		"type": "array",
		minItems: 1
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(Array.isArray(value), "Array.isArray(value) note true for: " + JSON.stringify(value));
	this.assert(value.length > 0, "value.length > 0: " + JSON.stringify(value));

	return true;
});

tests.add("array minItems, items correct type", function () {
	var schema = Jsonary.createSchema({
		"type": "array",
		minItems: 1,
		items: {"type": "integer"}
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(Array.isArray(value), "Array.isArray(value) note true for: " + JSON.stringify(value));
	this.assert(value.length > 0, "value.length > 0: " + JSON.stringify(value));
	this.assert(typeof value[0] == "number", "first item is number: " + JSON.stringify(value));
	this.assert(value[0]%1 == 0, "first item is integer: " + JSON.stringify(value));

	return true;
});

tests.add("object", function () {
	var schema = Jsonary.createSchema({
		"type": "object"
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(typeof value == "object" && value != null, "value is object: " + JSON.stringify(value));

	return true;
});

tests.add("required properties (v4-style)", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"required": ["key1", "key2"]
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(typeof value == "object" && value != null, "value is object: " + JSON.stringify(value));
	this.assert(value.key1 !== undefined, "value.key1 defined: " + JSON.stringify(value));
	this.assert(value.key2 !== undefined, "value.key2 defined: " + JSON.stringify(value));

	return true;
});

tests.add("required properties are correct type", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"required": ["key1", "key2"],
		properties: {
			key1: {"type": "string"}
		},
		additionalProperties: {"type": "boolean"}
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(typeof value == "object" && value != null, "value is object: " + JSON.stringify(value));
	this.assert(typeof value.key1 == "string", "value.key1 is string: " + JSON.stringify(value));
	this.assert(typeof value.key2 == "boolean", "value.key2 is boolean: " + JSON.stringify(value));

	return true;
});

