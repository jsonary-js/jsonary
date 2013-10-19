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

tests.add("enumDataList() (for list)", function () {
	var schemaFull = Jsonary.createSchema(exampleSchemaFull);
	var schemaList = schemaFull.asList();
	var enumDataList = schemaList.enumDataList();
	
	this.assert(enumDataList.length == schemaFull.data.property('enum').length(), 'lengths match');
	this.assert(enumDataList[0] === schemaFull.data.property('enum').item(0), 'entries match');
	
	return true;
});

tests.add("basicTypes()", function () {
	var schemaMinimal = Jsonary.createSchema(exampleSchemaMinimal);
	var schemaFull = Jsonary.createSchema(exampleSchemaFull);
	var schemaFull2 = Jsonary.createSchema(exampleSchemaFull2);
	var schema3 = Jsonary.createSchema({"type": "all"});
	var schema4 = Jsonary.createSchema({"type": ["all"]});
	var expected;
	this.assert(schemaMinimal.basicTypes().length == 7, "basicTypes() should return a complete list when not present");
	
	expected = ["integer"];
	this.assert(recursiveCompare(schemaFull.basicTypes(), expected), "basicTypes() should return a list, even when only one type is specified");

	// Does the order matter?  Perhaps it shouldn't.
	this.assert(schemaFull2.basicTypes().length == 7, "basicTypes() should return a full list of basic types if there is an object in \"type\"");

	// Does the order matter?  Perhaps it shouldn't.
	this.assert(schema3.basicTypes().length == 7, "basicTypes() should return a full list for \"all\"");

	// Does the order matter?  Perhaps it shouldn't.
	this.assert(schema4.basicTypes().length == 7, "basicTypes() should return a full list for [all]");

	return true;
});

tests.add("definedProperties()", function () {
	var schema1 = Jsonary.createSchema({
		"properties": {
			"key1": {},
			"key2": {}
		},
		"required": ["anotherKey"],
		additionalProperties: false
	});
	var schema2 = Jsonary.createSchema({
		"properties": {
			"key2": {},
			"key3": {}
		},
	});
	var schema3 = Jsonary.createSchema({
		"properties": {
			"key2": {},
			"key4": {}
		},
		additionalProperties: false
	});
	var schemaList1 = Jsonary.createSchemaList([schema1, schema2]);
	var schemaList2 = Jsonary.createSchemaList([schema1, schema2, schema3]);
	this.assert(schema1.definedProperties().length == 2, "schema1");
	this.assert(schema2.definedProperties().length == 2, "schema2");
	var defined1 = schemaList1.definedProperties();
	this.assert(defined1.length == 2, "defined1.length == 2, was " + defined1.length);
	var defined2 = schemaList2.definedProperties();
	this.assert(defined2.length == 1, "defined2.length == 1, was " + defined2.length);
	return true;
});

tests.add("knownProperties()", function () {
	var schema1 = Jsonary.createSchema({
		"properties": {
			"key1": {},
			"key2": {}
		},
		"required": ["anotherKey"]
	});
	var schema2 = Jsonary.createSchema({
		"properties": {
			"key2": {},
			"key3": {}
		},
		"required": ["key1", "key2"]
	});
	var schema3 = Jsonary.createSchema({
		"properties": {
			"key1": {},
			"key3": {}
		},
		"additionalProperties": false
	});
	
	var known1 = schema1.knownProperties();
	this.assert(known1.length == 3, "known1.length == 3, was " + known1.length);
	
	var schemaList = Jsonary.createSchemaList([schema1, schema2]);
	var known2 = schemaList.knownProperties();
	this.assert(known2.length == 4, "known2.length == 4, was " + known2.length);
	
	var schemaList = Jsonary.createSchemaList([schema1, schema2, schema3]);
	var known3 = schemaList.knownProperties();
	this.assert(known3.length == 2, "known3.length == 2, was " + known3.length);
	
	return true;
});

tests.add("knownProperties(ignoreList)", function () {
	var schema1 = Jsonary.createSchema({
		"properties": {
			"key1": {},
			"key2": {}
		},
		"required": ["anotherKey"]
	});
	var schema2 = Jsonary.createSchema({
		"properties": {
			"key2": {},
			"key3": {}
		},
		"required": ["key1", "key2"]
	});
	var schema3 = Jsonary.createSchema({
		"properties": {
			"key1": {},
			"key3": {}
		},
		"additionalProperties": false
	});
	
	var known1 = schema1.knownProperties(["key2", "keyX"]);
	this.assert(known1.length == 2, "known1.length == 2, was " + known1.length);
	
	var schemaList = Jsonary.createSchemaList([schema1, schema2]);
	var known2 = schemaList.knownProperties(["key2", "keyX"]);
	this.assert(known2.length == 3, "known2.length == 3, was " + known2.length);
	
	var schemaList = Jsonary.createSchemaList([schema1, schema2, schema3]);
	var known3 = schemaList.knownProperties(["keyY"]);
	this.assert(known3.length == 2, "known3.length == 2, was " + known3.length);
	
	return true;
});

tests.add("schemaList.propertyDependencies()", function () {
	var schema1 = Jsonary.createSchema({
		"dependencies": {
			"testKey": {}
		}
	});
	var schema2 = Jsonary.createSchema({
		"dependencies": {
			"testKey": ["key1", "key2"]
		}
	});
	var schema3 = Jsonary.createSchema({
		"dependencies": {
			"testKey": "key3",
		}
	});
	
	var schemaList = Jsonary.createSchemaList([schema1, schema2, schema3]);
	var dependencies = schemaList.propertyDependencies("testKey");
	this.assert(dependencies.length == 4, "dependencies.length == 4, was " + dependencies.length);
	
	return true;
});

tests.add("schemaList.propertyDependencies()", function () {
	var schema1 = Jsonary.createSchema({
		"dependencies": {
			"testKey": {}
		}
	});
	var schema2 = Jsonary.createSchema({
		"dependencies": {
			"testKey": ["key1", "key2"]
		}
	});
	var schema3 = Jsonary.createSchema({
		"dependencies": {
			"testKey": "key2",
		}
	});
	
	var schemaList = Jsonary.createSchemaList([schema1, schema2, schema3]);
	var dependencies = schemaList.propertyDependencies("testKey");
	this.assert(dependencies.length == 3, "dependencies.length == 3, was " + dependencies.length);
	
	return true;
});

tests.add("schemaList.readOnly()", function () {
	var schema1 = Jsonary.createSchema({});
	var schema2 = Jsonary.createSchema({
		readOnly: true
	});
	// Accept both capitalisations
	var schema3 = Jsonary.createSchema({
		readonly: true
	});
	
	var schemaList = Jsonary.createSchemaList([schema1, schema2]);
	this.assert(schemaList.readOnly() == true, "1: true");
	
	var schemaList = schema1.asList();
	this.assert(schemaList.readOnly() == false, "2: false");
	
	var schemaList = schema3.asList();
	this.assert(schemaList.readOnly() == true, "3: true");

	return true;
});

tests.add("data.readOnly() from schema", function () {
	var schema = Jsonary.createSchema({readOnly: true});
	var data = Jsonary.create({});
	
	this.assert(data.readOnly() == false, "readOnly() == false");
	data.addSchema(schema);
	this.assert(data.readOnly() == true, "readOnly() == true");
	this.assert(data.readOnly(false) == false, "readOnly(false) == true");
	return true;
});

tests.add("subData.readOnly() from schema", function () {
	var schema = Jsonary.createSchema({readOnly: true});
	var data = Jsonary.create({
		a: 1
	});
	var subData = data.property("a");
	
	this.assert(subData.readOnly() == false, "readOnly() == false");
	data.addSchema(schema);
	this.assert(subData.readOnly() == true, "readOnly() == true");
	this.assert(subData.readOnly(false) == false, "readOnly(false) == true");
	return true;
});