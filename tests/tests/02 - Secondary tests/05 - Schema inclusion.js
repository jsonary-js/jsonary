tests.add("schemas.orSchemas()", function () {
	var schema = Jsonary.createSchema({
		"anyOf": [
			{
				"title": "Schema 1",
				"type": "object",
				"required": ["key1"]
			},
			{
				"title": "Schema 2",
				"type": "object",
				"required": ["key2"]
			}
		]
	});
	
	var orSchemas = schema.orSchemas();
	this.assert(orSchemas.length == 1, "orSchemas().length == 1, was " + orSchemas.length);
	this.assert(orSchemas[0].length == 2, "orSchemas()[0].length == 2, was " + orSchemas[0].length);

	return true;
});

function searchForTitleInSchemaList(title, schemaList) {
	for (var i = 0; i < schemaList.length; i++) {
		var schema = schemaList[i];
		var schemaTitle = schema.title();
		if (schemaTitle == title) {
			return true;
		}
	}
	return false;
}

tests.add("oneOf validation", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"oneOf": [
			{
				"title": "Schema 1",
				"required": ["key1"]
			},
			{
				"title": "Schema 2",
				"required": ["key2"]
			}
		]
	});
	
	var data = Jsonary.create({key1: true});
	
	var monitorKey = Jsonary.getMonitorKey();
	var failReasons = [];
	var lastMatch = null;
	data.addSchemaMatchMonitor(monitorKey, schema, function (match, failReason) {
		lastMatch = match;
		failReasons.push(failReason);
	});
	
	this.assert(lastMatch === true, "should initially match");
	this.assert(failReasons.length == 1, "should have 1 callback");

	data.property("key1").remove();
	this.assert(lastMatch === false, "2: should not match");
	this.assert(failReasons.length == 2, "should have 2 callbacks");

	data.property("key2").setValue(true);
	this.assert(lastMatch === true, "3: should match");
	this.assert(failReasons.length == 3, "should have 3 callbacks");

	data.property("key1").setValue(true);
	this.assert(lastMatch === false, "4: should not match");
	this.assert(failReasons.length == 4, "should have 4 callbacks");

	data.property("key2").remove();
	this.assert(lastMatch === true, "5: should still match");
	this.assert(failReasons.length == 5, "should still have 5 callbacks");

	data.property("key1").remove();
	this.assert(lastMatch === false, "6: should not match");
	this.assert(failReasons.length == 6, "should have 6 callbacks");

	return true;
});

tests.add("oneOf inference", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"oneOf": [
			{
				"title": "Schema 1",
				"required": ["key1"]
			},
			{
				"title": "Schema 2",
				"required": ["key2"]
			}
		]
	});
	
	var data = Jsonary.create({key1: true});
	data.addSchema(schema);
	
	this.assert(searchForTitleInSchemaList("Schema 1", data.schemas()), "1: Should contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "1: Should not contain Schema 2");
	
	data.property("key2").setValue(true);
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "2: Should not contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "2: Should not contain Schema 2");

	data.property("key1").remove();
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "3: Should not contain Schema 1");
	this.assert(searchForTitleInSchemaList("Schema 2", data.schemas()), "3: Should contain Schema 2");

	data.property("key2").remove();
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "4: Should not contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "4: Should not contain Schema 2");

	return true;
});

tests.add("oneOf inference 2", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"items": {
			"oneOf": [
				{
					"title": "Schema 1",
					"required": ["key1"]
				},
				{
					"title": "Schema 2",
					"required": ["key2"]
				}
			]
		}
	});
	
	var rootData = Jsonary.create([{key1: true}]);
	rootData.addSchema(schema);
	var data = rootData.item(0);
	
	this.assert(searchForTitleInSchemaList("Schema 1", data.schemas()), "1: Should contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "1: Should not contain Schema 2");
	
	data.property("key2").setValue(true);
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "2: Should not contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "2: Should not contain Schema 2");

	data.property("key1").remove();
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "3: Should not contain Schema 1");
	this.assert(searchForTitleInSchemaList("Schema 2", data.schemas()), "3: Should contain Schema 2");

	data.property("key2").remove();
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "4: Should not contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "4: Should not contain Schema 2");

	return true;
});

tests.add("oneOf inference 3", function () {
	var schema = Jsonary.createSchema({
		"oneOf": [
			{
				"title": "Schema 1",
				"type": "object"
			},
			{
				"title": "Schema 2",
				"type": "array",
				"items": {"title": "Items"}
			}
		]
	});
	
	var data = Jsonary.create({key1: true}).addSchema(schema);
	
	this.assert(searchForTitleInSchemaList("Schema 1", data.schemas()), "1: Should contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "1: Should not contain Schema 2");

	data.setValue([1]);
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "2: Should not contain Schema 1");
	this.assert(searchForTitleInSchemaList("Schema 2", data.schemas()), "2: Should contain Schema 2");
	this.assert(searchForTitleInSchemaList("Items", data.item(0).schemas()), "2: first item should contain Items");
	
	return true;
});

tests.add("anyOf validation", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"anyOf": [
			{
				"title": "Schema 1",
				"required": ["key1"]
			},
			{
				"title": "Schema 2",
				"required": ["key2"]
			}
		]
	});
	
	var data = Jsonary.create({key1: true});
	
	var monitorKey = Jsonary.getMonitorKey();
	var failReasons = [];
	var lastMatch = null;
	data.addSchemaMatchMonitor(monitorKey, schema, function (match, failReason) {
		lastMatch = match;
		failReasons.push(failReason);
	});
	
	this.assert(lastMatch === true, "should initially match");
	this.assert(failReasons.length == 1, "should have 1 callback");

	data.property("key1").remove();
	this.assert(lastMatch === false, "2: should not match");
	this.assert(failReasons.length == 2, "should have 2 callbacks");

	data.property("key2").setValue(true);
	this.assert(lastMatch === true, "3: should match");
	this.assert(failReasons.length == 3, "should have 3 callbacks");

	data.property("key1").setValue(true);
	this.assert(lastMatch === true, "4: should still match");
	this.assert(failReasons.length == 3, "should still have 3 callbacks");

	data.property("key2").remove();
	this.assert(lastMatch === true, "5: should still match");
	this.assert(failReasons.length == 3, "should still have 3 callbacks");

	data.property("key1").remove();
	this.assert(lastMatch === false, "6: should not match");
	this.assert(failReasons.length == 4, "should have 4 callbacks");

	return true;
});

tests.add("anyOf inference", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"anyOf": [
			{
				"title": "Schema 1",
				"required": ["key1"]
			},
			{
				"title": "Schema 2",
				"required": ["key2"]
			}
		]
	});
	
	var data = Jsonary.create({key1: true});
	data.addSchema(schema);
	
	this.assert(searchForTitleInSchemaList("Schema 1", data.schemas()), "1: Should contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "1: Should not contain Schema 2");
	
	data.property("key2").setValue(true);
	this.assert(searchForTitleInSchemaList("Schema 1", data.schemas()), "2: Should contain Schema 1");
	this.assert(searchForTitleInSchemaList("Schema 2", data.schemas()), "2: Should contain Schema 2");

	data.property("key1").remove();
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "3: Should not contain Schema 1");
	this.assert(searchForTitleInSchemaList("Schema 2", data.schemas()), "3: Should contain Schema 2");

	data.property("key2").remove();
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "4: Should not contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "4: Should not contain Schema 2");

	return true;
});

tests.add("allOf validation", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"allOf": [
			{
				"title": "Schema 1",
				"required": ["key1"]
			},
			{
				"title": "Schema 2",
				"required": ["key2"]
			}
		]
	});
	
	var data = Jsonary.create({key1: true});
	
	var monitorKey = Jsonary.getMonitorKey();
	var failReasons = [];
	var lastMatch = null;
	data.addSchemaMatchMonitor(monitorKey, schema, function (match, failReason) {
		lastMatch = match;
		failReasons.push(failReason);
	});
	
	this.assert(lastMatch === false, "should initially not match");
	this.assert(failReasons.length == 1, "should have 1 callback");

	data.property("key1").remove();
	this.assert(lastMatch === false, "2: should not match");
	this.assert(failReasons.length == 2, "should have 2 callbacks");

	data.property("key2").setValue(true);
	this.assert(lastMatch === false, "3: should not match");
	this.assert(failReasons.length == 2, "should still have 2 callbacks");

	data.property("key1").setValue(true);
	this.assert(lastMatch === true, "4: should match");
	this.assert(failReasons.length == 3, "should have 3 callbacks");

	data.property("key2").remove();
	this.assert(lastMatch === false, "5: should not match");
	this.assert(failReasons.length == 4, "should have 4 callbacks");

	return true;
});

tests.add("allOf inference", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"allOf": [
			{
				"title": "Schema 1",
				"required": ["key1"]
			},
			{
				"title": "Schema 2",
				"required": ["key2"]
			}
		]
	});
	
	var data = Jsonary.create({key1: true});
	data.addSchema(schema);

	// All schemas shoudl be present, even if one of them doesn't validate
	this.assert(searchForTitleInSchemaList("Schema 1", data.schemas()), "2: Should contain Schema 1");
	this.assert(searchForTitleInSchemaList("Schema 2", data.schemas()), "2: Should contain Schema 2");

	return true;
});

tests.add("dependency inference", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"dependencies": {
			"key1": {"title": "Schema 1"},
			"key2": {"title": "Schema 2"},
			"0": {"title": "Dummy schema"}
		}
	});
	var data = Jsonary.create({key1: true});
	data.addSchema(schema);
	
	this.assert(searchForTitleInSchemaList("Schema 1", data.schemas()), "1: Should contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "1: Should not contain Schema 2");
	
	data.property("key2").setValue("test");
	this.assert(searchForTitleInSchemaList("Schema 1", data.schemas()), "2: Should contain Schema 1");
	this.assert(searchForTitleInSchemaList("Schema 2", data.schemas()), "2: Should contain Schema 2");
	
	data.property("key1").remove();
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "3: Should not contain Schema 1");
	this.assert(searchForTitleInSchemaList("Schema 2", data.schemas()), "3: Should contain Schema 2");
	
	data.property("key2").remove();
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "4: Should not contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "4: Should not contain Schema 2");
	
	data.setValue({key1: true});
	this.assert(searchForTitleInSchemaList("Schema 1", data.schemas()), "5: Should contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "5: Should not contain Schema 2");

	data.setValue([0]);
	this.assert(!searchForTitleInSchemaList("Schema 1", data.schemas()), "6: Should not contain Schema 1");
	this.assert(!searchForTitleInSchemaList("Schema 2", data.schemas()), "6: Should not contain Schema 2");
	this.assert(!searchForTitleInSchemaList("Dummy schema", data.schemas()), "6: Should not contain Dummy schema");
	
	return true;
});


tests.add("dependency validation", function () {
	var schema = Jsonary.createSchema({
		"type": "object",
		"dependencies": {
			"key1": {
				"title": "Schema 1",
				"required": ["key2"]
			},
			"keyA": ["keyB", "keyC"]
		}
	});
	var data = Jsonary.create({key1: true});

	var monitorKey = Jsonary.getMonitorKey();
	var failReasons = [];
	var lastMatch = null;
	data.addSchemaMatchMonitor(monitorKey, schema, function (match, failReason) {
		lastMatch = match;
		failReasons.push(failReason);
	});
	
	this.assert(lastMatch === false, "1: should not match");
	this.assert(failReasons.length == 1, "1: should have 1 callback");

	data.property("key1").remove();
	this.assert(lastMatch === true, "2: should match");
	this.assert(failReasons.length == 2, "should have 2 callbacks");
	
	data.setValue({key1: true, key2: true});
	this.assert(lastMatch === true, "3: should match");
	this.assert(failReasons.length == 2, "should have 2 callbacks");
	
	data.property("keyA").setValue("test");
	this.assert(lastMatch === false, "4: should not match");
	this.assert(failReasons.length == 3, "4: should have 3 callbacks");
	
	data.property("keyB").setValue("test");
	if (failReasons.length == 3) {
		failReasons.push("Placeholder");
	}
	this.assert(lastMatch === false, "5: should not match");
	this.assert(failReasons.length == 4, "5: should have 4 callbacks");
	
	data.property("keyC").setValue("test");
	this.assert(lastMatch === true, "6: should match");
	this.assert(failReasons.length == 5, "6: should have 5 callbacks");
	
	return true;
});
