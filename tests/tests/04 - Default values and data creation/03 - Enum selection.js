tests.add("enum()", function () {
	var schema1 = Jsonary.createSchema({
		"enum": ["A", "B", "C"]
	});
	var schemaList = Jsonary.createSchemaList(schema1);
	
	var enums = schemaList.enumValues();
	this.assert(enums.length == 3, "length == 3: " + JSON.stringify(enums));

	return true;
});

tests.add("enum() combination", function () {
	var schema1 = Jsonary.createSchema({
		"enum": ["A", "B", "C"]
	});
	var schema2 = Jsonary.createSchema({
		"enum": ["B", "C", "D"]
	});
	var schemaList = Jsonary.createSchemaList([schema1, schema2]);
	
	var enums = schemaList.enumValues();
	this.assert(enums.length == 2, "length == 2: " + JSON.stringify(enums));

	return true;
});

tests.add("select an enum", function () {
	var schema1 = Jsonary.createSchema({
		"enum": ["A", "B", "C"]
	});
	var schemaList = Jsonary.createSchemaList(schema1);
	
	var value = schemaList.createValue();
	this.assert(value === "A" || value === "B" || value === "C", "value in [A, B, C], was " + JSON.stringify(value));

	return true;
});

tests.add("default affects enum choice (A)", function () {
	var schema1 = Jsonary.createSchema({
		"enum": ["A", "B", "C"],
		"default": "A"
	});
	var schemaList = Jsonary.createSchemaList(schema1);
	
	var value = schemaList.createValue();
	this.assert(value === "A", "value === 'A'");

	return true;
});

tests.add("default affects enum choice (B)", function () {
	var schema1 = Jsonary.createSchema({
		"enum": ["A", "B", "C"],
		"default": "B"
	});
	var schemaList = Jsonary.createSchemaList(schema1);
	
	var value = schemaList.createValue();
	this.assert(value === "B", "value === 'B'");

	return true;
});
