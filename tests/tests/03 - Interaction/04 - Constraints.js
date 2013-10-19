var exampleSchemaMinimal = {
};
var exampleSchemaFull = {
	"enum": [null, true, 2, "3", [4], {5:5}],
	"type": "integer"
};
var exampleSchemaFull2 = {
	"type": ["string", "boolean", {}]
};

tests.add("enumData()", function () {
	var schemaMinimal = Jsonary.createSchema(exampleSchemaMinimal);
	var schemaFull = Jsonary.createSchema(exampleSchemaFull);
	var expected;

	expected = Jsonary.create(exampleSchemaFull["enum"]);
	this.assert(schemaFull.enumData().equals(expected), "enumList() should return the contents of enum when present");
	
	this.assert(!schemaMinimal.enumData().defined(), "enumList() should not be defined");
	
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
	this.assert(schemaFull2.basicTypes().length == 7, "basicTypes() should return a full list of the basic types in the list when object is in types array");

	return true;
});