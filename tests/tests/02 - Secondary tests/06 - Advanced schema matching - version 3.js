tests.add("Array length constraints", function () {
	var thisTest = this;

	var data = Jsonary.create([0, 1, 2]);
	var schema = Jsonary.createSchema({
		"minItems": 2,
		"maxItems": 4
	});

	var match = null;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m) {
		match = m;
	});

	this.assert(match, "should match initially");

	data.removeIndex(2);
	data.removeIndex(1);
	this.assert(!match, "should not match after removal of items");

	data.setValue([0, 1, 2, 3, 4]);
	this.assert(!match, "should not match after replacement with long array");

	data.removeIndex(4);
	this.assert(match, "should match after removal of final item");

	return true;
});

tests.add("Required properties (v3-style)", function () {
	var data = Jsonary.create({
		"key1": 1
	});
	var schema = Jsonary.createSchema({
		"properties": {
			"key1": {
				"required": true
			},
			"key2": {
				"required": true
			}
		}
	});

	var requiredKeys = schema.requiredProperties();
	this.assert(requiredKeys.length == 2, "There should be two required keys");

	var match = null;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m) {
		match = m;
	});

	this.assert(!match, "should not match initially");

	data.property("key3").setValue("not needed");
	this.assert(!match, "should still not match");

	data.property("key2").setValue("needed");
	this.assert(match, "should match, now we have both keys");

	data.removeProperty("key1");
	this.assert(!match, "should not match, when we remove key1");

	return true;
});

tests.add("Dependencies (string)", function () {
	var data = Jsonary.create({
		"key1": 1
	});
	var schema = Jsonary.createSchema({
		"dependencies": {
			"key1": "key2"
		}
	});

	var dependencies = schema.propertyDependencies("key1");
	this.assert(dependencies.length == 1, "dependencies.length == 1");

	var match = null;
	var failReason = null;
	var notificationCount = 0;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m, fr) {
		notificationCount++;
		match = m;
		failReason = fr;
	});

	this.assert(!match, "should not match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);

	data.property("key2").setValue("needed");
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);
	this.assert(match, "should now match: " + failReason);

	data.removeProperty("key1");
	this.assert(match, "should still match");

	data.property("key1").setValue("present");
	this.assert(match, "should still match after key1 has been re-added");

	data.removeProperty("key2");
	this.assert(!match, "should no longer match");

	return true;
});

tests.add("Dependencies (array of strings)", function () {
	var data = Jsonary.create({
		"key1": 1
	});
	var schema = Jsonary.createSchema({
		"dependencies": {
			"key1": ["key2", "key3"]
		}
	});

	var dependencies = schema.propertyDependencies("key1");
	this.assert(dependencies.length == 2, "dependencies.length == 1");

	var match = null;
	var failReason = null;
	var notificationCount = 0;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m, fr) {
		notificationCount++;
		match = m;
		failReason = fr;
	});

	this.assert(!match, "should not match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);

	data.property("key2").setValue("needed");
	if (notificationCount == 1) {
		// Might be same error, might not
		notificationCount == 2;
	}
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);
	this.assert(!match, "should still not match:");

	data.property("key3").setValue("also needed");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);
	this.assert(match, "should now match:");

	data.removeProperty("key1");
	this.assert(match, "should still match");

	data.property("key1").setValue("present");
	this.assert(match, "should still match after key1 has been re-added");

	data.removeProperty("key2");
	this.assert(!match, "should no longer match");

	return true;
});

tests.add("Dependencies (object)", function () {
	var data = Jsonary.create({
		"int-key": "integer",
		"value": "string"
	});
	var schema = Jsonary.createSchema({
		"type": "object",
		"dependencies": {
			"int-key": {
				"properties": {
					"value": {
						"type": "integer"
					}
				}
			},
			"string-key": {
				"properties": {
					"value": {
						"type": "string"
					}
				}
			}
		}
	});

	var match = null;
	var failReason = null;
	var notificationCount = 0;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m, fr) {
		notificationCount++;
		match = m;
		failReason = fr;
	});

	this.assert(!match, "should not match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);

	data.property("value").setValue(5);
	this.assert(match, "should match after stage 2");
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);

	data.property("string-key").setValue(5);
	this.assert(!match, "should not match after setting string-key");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);

	data.removeProperty("int-key");
	this.assert(!match, "should not match after removing int-key");
	this.assert(notificationCount == 3, "notificationCount == 3 (still), not " + notificationCount);

	data.property("value").setValue("string value");
	this.assert(match, "should now match, after setting value to string");
	this.assert(notificationCount == 4, "notificationCount == 4, not " + notificationCount);

	return true;
});

tests.add("Min/max (number)", function () {
	var data = Jsonary.create(5);
	var schema = Jsonary.createSchema({
		"minimum": 3,
		"maximum": 10
	});
	
	var match = null;
	var failReason = null;
	var notificationCount = 0;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m, fr) {
		notificationCount++;
		match = m;
		failReason = fr;
	});
	
	this.assert(match, "should match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);

	data.setValue(11);
	this.assert(!match, "should not match after stage 2");
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);

	data.setValue(2);
	this.assert(!match, "should not match after stage 3");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);

	data.setValue(7);
	this.assert(match, "should match after stage 4");
	this.assert(notificationCount == 4, "notificationCount == 4, not " + notificationCount);
	
	return true;
});


tests.add("Exclusive min/max (number)", function () {
	var data = Jsonary.create(5);
	var schema = Jsonary.createSchema({
		"minimum": 3,
		"exclusiveMinimum": true,
		"maximum": 10,
		"exclusiveMaximum": true
	});
	
	var match = null;
	var failReason = null;
	var notificationCount = 0;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m, fr) {
		notificationCount++;
		match = m;
		failReason = fr;
	});
	
	this.assert(match, "should match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);

	data.setValue(10);
	this.assert(!match, "should not match after stage 2");
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);

	data.setValue(3);
	this.assert(!match, "should not match after stage 3");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);

	data.setValue(7);
	this.assert(match, "should match after stage 4");
	this.assert(notificationCount == 4, "notificationCount == 4, not " + notificationCount);
	
	return true;
});

tests.add("min/max and oneOf", function () {
	var data = Jsonary.create(5);
	var schema = Jsonary.createSchema({
		"oneOf": [
			{
				"minimum": 0
			},
			{
				"maximum": 10
			}
		]
	});

	var match = null;
	var failReason = null;
	var notificationCount = 0;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m, fr) {
		notificationCount++;
		match = m;
		failReason = fr;
	});

	this.assert(!match, "should not match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);

	data.setValue(11);
	this.assert(match, "should match after stage 2");
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);

	data.setValue(5);
	this.assert(!match, "should not match after stage 3");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);

	data.setValue(-1);
	this.assert(match, "should match after stage 4");
	this.assert(notificationCount == 4, "notificationCount == 4, not " + notificationCount);

	return true;
});

tests.add("\"not\" match (disallow)", function () {
	var data = Jsonary.create("other value");
	var schema = Jsonary.createSchema({
		"disallow": ["integer", {
			"enum": ["value"]
		}]
	});

	var match = null;
	var failReason = null;
	var notificationCount = 0;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m, fr) {
		notificationCount++;
		match = m;
		failReason = fr;
	});

	this.assert(match, "should match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);

	data.setValue("value");
	this.assert(!match, "should not match after stage 2");
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);

	data.setValue(5.5);
	this.assert(match, "should match after stage 3");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);

	data.setValue(5);
	this.assert(!match, "should not match after stage 4");
	this.assert(notificationCount == 4, "notificationCount == 4, not " + notificationCount);

	return true;
});

tests.add("additionalProperties schema", function () {
	var data = Jsonary.create({a:1, b:2});
	var schema = Jsonary.createSchema({
		properties: {
			"a": {},
			"b": {}
		},
		additionalProperties: {type: "number"}
	});

	var match = null;
	var failReason = null;
	var notificationCount = 0;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m, fr) {
		notificationCount++;
		match = m;
		failReason = fr;
	});

	this.assert(match, "should match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);

	data.set('/c', 5.5);
	this.assert(match, "should still match after stage 2");
	this.assert(notificationCount == 1, "notificationCount still 1, not " + notificationCount);

	data.set('/c', 'test string');
	this.assert(!match, "should not match after stage 3");
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);

	data.removeProperty("c");
	this.assert(match, "should match after stage 4");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);

	return true;
});


tests.add("additionalProperties boolean", function () {
	var data = Jsonary.create({a:1, b:2});
	var schema = Jsonary.createSchema({
		properties: {
			"a": {},
			"b": {}
		},
		additionalProperties: false
	});

	var match = null;
	var failReason = null;
	var notificationCount = 0;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (m, fr) {
		notificationCount++;
		match = m;
		failReason = fr;
	});

	this.assert(match, "should match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);

	data.set('/c', 5.5);
	this.assert(!match, "should not match after stage 2");
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);

	data.set('/c', 'test string');
	this.assert(!match, "should not match after stage 3");
	this.assert(notificationCount == 2, "notificationCount still 2, not " + notificationCount);

	data.removeProperty("c");
	this.assert(match, "should match after stage 4");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);

	return true;
});
