tests.add("Dependencies (array)", function() {
	var data = Jsonary.create({"key1": 1});
	var schema = Jsonary.createSchema({
		"dependencies": {
			"key1": ["key2", "key3"]
		}
	});
	
	var dependencies = schema.propertyDependencies("key1");
	this.assert(dependencies.length == 2, "dependencies.length == 2");

	var match = null;
	var failReason = null;
	var notificationCount = 0;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function(m, fr) {
		notificationCount++;
		match = m;
		failReason = fr;
	});
	
	this.assert(!match, "should not match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);
	
	data.property("key2").setValue("needed");
	if (notificationCount == 1) {
		notificationCount = 2;
	}
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);
	this.assert(!match, "should still not match: " + failReason);

	data.property("key3").setValue("needed");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);
	this.assert(match, "should match now: " + failReason);

	data.removeProperty("key1");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);
	this.assert(match, "should still match after key1 has been removed");

	return true;
});

tests.add("Required properties (v4-style)", function () {
	var data = Jsonary.create({
		"key1": 1
	});
	var schema = Jsonary.createSchema({
		"properties": {
			"key1": {
			},
			"key2": {
			}
		},
		"required": ["key1", "key2"]
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

tests.add("\"not\" match (not keyword)", function () {
	var data = Jsonary.create("other value");
	var schema = Jsonary.createSchema({
		"not": {
			"enum": ["value"]
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

	this.assert(match, "should match initially");
	this.assert(notificationCount == 1, "notificationCount == 1, not " + notificationCount);

	data.setValue("value");
	this.assert(!match, "should not match after stage 2");
	this.assert(notificationCount == 2, "notificationCount == 2, not " + notificationCount);

	data.setValue(5);
	this.assert(match, "should match after stage 3");
	this.assert(notificationCount == 3, "notificationCount == 3, not " + notificationCount);

	return true;
});
