var exampleSchemaMinimal = {
};
var exampleSchemaFull = {
	"enum": [null, true, 2, "3", [4], {5:5}],
	"type": "integer"
};
var exampleSchemaFull2 = {
	"type": ["string", "boolean", {}]
};

tests.add("enumValues()", function () {
	var schemaMinimal = Jsonary.createSchema(exampleSchemaMinimal);
	var schemaFull = Jsonary.createSchema(exampleSchemaFull);
	var expected;

	expected = exampleSchemaFull["enum"];
	this.assert(recursiveCompare(schemaFull.enumValues(), expected), "enumValues() should return the contents of enum (as values, not data objects) when present");
	
	this.assert(schemaMinimal.enumValues() == undefined, "enumValues() should return undefined when not present");
	
	return true;
});

tests.add("enumData()", function () {
	var schemaMinimal = Jsonary.createSchema(exampleSchemaMinimal);
	var schemaFull = Jsonary.createSchema(exampleSchemaFull);
	var expected;

	expected = exampleSchemaFull["enum"];
	this.assert(schemaFull.enumData().equals(schemaFull.data.property("enum")), "enumData() should return the contents of enum as a data object representing a list when present");
	
	this.assert(!schemaMinimal.enumData().defined(), "enumData().defined() should be false when not present");
	
	return true;
});

tests.add("basicTypes()", function () {
	var schemaMinimal = Jsonary.createSchema(exampleSchemaMinimal);
	var schemaFull = Jsonary.createSchema(exampleSchemaFull);
	var schemaFull2 = Jsonary.createSchema(exampleSchemaFull2);
	var expected;
	this.assert(schemaMinimal.basicTypes().length == 7, "basicTypes() should return a complete list when not present");
	
	expected = ["integer"];
	this.assert(recursiveCompare(schemaFull.basicTypes(), expected), "basicTypes() should return a list, even when only one type is specified");

	// Does the order matter?  Perhaps it shouldn't.
	this.assert(schemaFull2.basicTypes().length == 7, "basicTypes() should return a full list of basic types if there is an object in \"type\"");

	return true;
});
