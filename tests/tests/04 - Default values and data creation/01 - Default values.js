tests.add("Basic default", function () {
	var schema = Jsonary.createSchema({
		"default": "Default value"
	});

	this.assert(schema.hasDefault() == true, "hasDefault() should be true");
	this.assert(schema.defaultValue() == "Default value", "defaultValue() should provide a default when one exists");

	return true;
});

tests.add("Assembling data (default)", function () {
	var schema = Jsonary.createSchema({
		"default": "Test string"
	});
	var schemaList = schema.asList();
	
	var value = schemaList.createValue();
	this.assert(value == "Test string");

	return true;
});

tests.add("Schema list items (from default)", function () {
	var schema = Jsonary.createSchema({
		"items": {
			"default": "New item"
		}
	});
	
	var data = Jsonary.create([]);
	data.addSchema(schema);

	this.assert(schema.hasDefault() == false, "hasDefault() should be false");

	var schemas = data.schemas();
	this.assert(schemas.length == 1, "schemas should have exactly one item");
	
	var assembledData = schemas.createValueForIndex(0);
	this.assert(assembledData == "New item", "assembledData == \"New item\"");

	return true;
});

tests.add("Schema properties (from default)", function () {
	var schema = Jsonary.createSchema({
		"properties": {
			"key1": {
				"default": "value1"
			},
			"key2": {
				"default": "value2"
			}
		},
		"additionalProperties": {
			"default": "Additional properties"
		}
	});
	
	var data = Jsonary.create([]);
	data.addSchema(schema);

	this.assert(schema.hasDefault() == false, "hasDefault() should be false");

	var schemas = data.schemas();
	this.assert(schemas.length == 1, "schemas should have exactly one item");
	
	var assembledData = schemas.createValueForProperty("key1");
	this.assert(assembledData == "value1", "key1 == \"value1\"");

	var assembledData = schemas.createValueForProperty("key2");
	this.assert(assembledData == "value2", "key2 == \"value2\"");

	var assembledData = schemas.createValueForProperty("key3");
	this.assert(assembledData == "Additional properties", "key3 == \"Additional Properties1\"");

	return true;
});


tests.add("Schema list tuple items (from default)", function () {
	var schema = Jsonary.createSchema({
		"items": [
			{
				"default": "item0"
			},
			{
				"default": "item1"
			}
		],
		"additionalItems": {
			"default": "Additional items"
		}
	});
	
	var data = Jsonary.create([]);
	data.addSchema(schema);

	this.assert(schema.hasDefault() == false, "hasDefault() should be false");

	var schemas = data.schemas();
	this.assert(schemas.length == 1, "schemas should have exactly one item");
	
	var assembledData = schemas.createValueForIndex(0);
	this.assert(assembledData == "item0", "assembledData == \"New item\"");

	var assembledData = schemas.createValueForIndex(1);
	this.assert(assembledData == "item1", "assembledData == \"item1\"");

	var assembledData = schemas.createValueForIndex(2);
	this.assert(assembledData == "Additional items", "assembledData == \"Additional items\"");

	return true;
});

