var exampleData = {
	"title": "Example data",
	"link_url": "http://google.com",
	"other_key": 5
}

var exampleSchemaData = {
	title: "Example schema",
	description: "Part of the automated tests",
	type: "object",
	properties: {
		"title": {
			"title": "Title",
			"type": "string"
		},
		"key": {
			"title": "Key"
		}
	},
	items: {
		"title": "Items"
	}
};

var exampleSchemaData2 = {
	description: "Another part of the automated tests",
	type: ["integer", "boolean"]
};

tests.add("Adding schema", function () {
	var data = Jsonary.create(exampleData);
	var schema = Jsonary.createSchema(exampleSchemaData);
	data.addSchema(schema);
	var schemas = data.schemas();
	var titleSchemas = data.property("title").schemas();
	this.assert(schemas.length == 1, "schema count should be 1");
	this.assert(titleSchemas.length == 1, "schema count for title should be 1");
	this.assert(schemas[0] === schema, "schemas[0] should be equal to the added schema");
	return true;
});

tests.add("Removing schema", function () {
	var data = Jsonary.create(exampleData);
	var schema = Jsonary.createSchema(exampleSchemaData);
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchema(schema, schemaKey);
	data.removeSchema(schemaKey);
	var schemas = data.schemas();
	var titleSchemas = data.property("title").schemas();
	this.assert(schemas.length == 0, "schema count should be 0");
	this.assert(titleSchemas.length == 0, "schema count for title should be 1");
	return true;
});

tests.add("Schema title", function () {
	var data = Jsonary.create(exampleData);
	var schema = Jsonary.createSchema(exampleSchemaData);
	this.assert(schema.title() === exampleSchemaData.title, "schema[0].title() should be: " + exampleSchemaData.title);
	return true;
});

tests.add("getFull()", function () {
	var thisTest = this;
	var schema = Jsonary.createSchema(exampleSchemaData);
	var fullSchema = schema.getFull(function (data, req) {
		thisTest.pass();
	});
	setTimeout(function () {
		thisTest.fail("Timeout");
	}, 2000);
});

tests.add("Comparing schemas", function () {
	var schema = Jsonary.createSchema(exampleSchemaData);
	var schema2 = Jsonary.createSchema(exampleSchemaData2);
	var schemaDuplicate = Jsonary.createSchema(exampleSchemaData);
	this.assert(schema.equals(schema) === true, "schema.equals(schema) should return true");
	this.assert(schema.equals(schema2) === false, "schema.equals(schema2) should return false");
	this.assert(schema.equals(schemaDuplicate) === true, "schema.equals(schemaDuplicate) should return true");
	return true;
});

tests.add("Adding duplicate schema", function () {
	var data = Jsonary.create(exampleData);
	var schema = Jsonary.createSchema(exampleSchemaData);
	var schema2 = Jsonary.createSchema(exampleSchemaData);
	data.addSchema(schema);
	data.addSchema(schema2);
	var schemas = data.schemas();
	this.assert(schemas.length == 1, "schema count should be 1, not " + schemas.length);
	return true;
});

tests.add("Child property schemas", function () {
	var data = Jsonary.create(exampleData);
	var schema = Jsonary.createSchema(exampleSchemaData);
	var extraSchema = Jsonary.createSchema({
		"patternProperties": {
			"[Yy]": {"title": "Property containing a Y"}
		}
	});
	data.addSchema(schema).addSchema(extraSchema);
	var schemas = data.property("title").schemas();
	this.assert(schemas.length === 1, "schema count for title should be 1");
	var schemas = data.property("key").schemas();
	this.assert(schemas.length === 0, "schema count for key should be 0");
	data.property("key").setValue("value");
	var schemas = data.property("key").schemas();
	this.assert(schemas.length === 2, "schema count for key should now be 2, was " + schemas.length);
	data.property("key").remove();
	var schemas = data.property("key").schemas();
	this.assert(schemas.length === 0, "schema count for key should be 0 again");
	return true;
});

tests.add("Child property schemas 2", function () {
	var data = Jsonary.create({});
	var schema = Jsonary.createSchema({
		"properties": {
			"key": {}
		}
	});
	data.addSchema(schema);
	var schemas = data.property("key").schemas();
	this.assert(schemas.length === 0, "schema count for key should be 0");
	data.setValue({key: "value"});
	var schemas = data.property("key").schemas();
	this.assert(schemas.length === 1, "schema count for key should be 1");
	return true;
});

tests.add("Child index schemas", function () {
	var data = Jsonary.create([0]);
	var schema = Jsonary.createSchema(exampleSchemaData);
	data.addSchema(schema);
	var schemas = data.index(0).schemas();
	this.assert(schemas.length === 1, "schema count for index 0 should be 1");
	var schemas = data.index(1).schemas();
	this.assert(schemas.length === 0, "schema count for index 1 should be 0");
	data.index(1).setValue("value");
	var schemas = data.index(1).schemas();
	this.assert(schemas.length === 1, "schema count for index 1 should now be 1");
	data.index(0).remove();
	var schemas = data.index(1).schemas();
	this.assert(schemas.length === 0, "schema count for index 1 should be 0 again");
	return true;
});


tests.add("Child index schemas 2", function () {
	var data = Jsonary.create([]);
	var schema = Jsonary.createSchema({
		"items": {
			"key": {}
		}
	});
	data.addSchema(schema);
	var schemas = data.item(0).schemas();
	this.assert(schemas.length === 0, "schema count for item should be 0");
	data.setValue([true]);
	var schemas = data.item(0).schemas();
	this.assert(schemas.length === 1, "schema count for item should be 1");
	return true;
});

tests.add("Inserting array items", function () {
	var data = Jsonary.create([0]).addSchema(Jsonary.createSchema({
		"items": {}
	}));
	this.assert(data.item(0).schemas().length == 1, "first item should have a schema");	
	this.assert(data.item(1).schemas().length == 0, "second item should not have a schema");
	data.insertItem(0, "test");
	this.assert(data.item(1).schemas().length == 1, "second item should now have one schema");
	return true;
});

tests.add("Remote schema", function () {
	var thisTest = this;
	var schemaUrl = "http://example.com/schema";
	var data = Jsonary.create(exampleData);
	Jsonary.addToCache(schemaUrl, exampleSchemaData);
	var schema = Jsonary.createSchema({
		"$ref": schemaUrl
	});
	var expectedSchema = Jsonary.createSchema(exampleSchemaData);
	data.addSchema(schema);
	data.whenSchemasStable(function (data, schemas) {
		thisTest.assert(schemas.length == 1, "schema count should be 1");
		thisTest.assert(schemas[0].equals(expectedSchema), "schemas[0] should be equal to the example schema:\n" + JSON.stringify(schemas[0].data.value()) + "\n" + JSON.stringify(expectedSchema.data.value()));
		thisTest.pass();
	});
	setTimeout(function () {
		thisTest.fail("timeout");
	}, 50);
});

tests.add("Remote schema title", function () {
	var thisTest = this;
	var schemaUrl = "http://example.com/schema2";
	var schema = Jsonary.createSchema({
		"$ref": schemaUrl
	});
	Jsonary.addToCache(schemaUrl, exampleSchemaData);
	var data = Jsonary.create(exampleData);
	data.addSchema(schema);
	data.whenSchemasStable(function (data, schemas) {
		thisTest.assert(schemas.length == 1, "schema count should be 1");
		var expected = "Example schema";
		thisTest.assert(schemas[0].title() == expected, "Schema title should be " + JSON.stringify(expected) + " not " + JSON.stringify(schemas[0].title()));
		thisTest.pass();
	});
	setTimeout(function () {
		thisTest.fail("timeout");
	}, 50);
});
