var exampleData = {
	"important_key": "B"
};

var exampleData2 = {
	"important_key": {"inner_key": "B"}
};

var exampleTypeA = {
	"title": "Schema A",
	"type": "object",
	"properties": {
		"important_key": {
			"enum": ["A"]
		},
	}
}

var exampleTypeB = {
	"title": "Schema B",
	"type": "object",
	"properties": {
		"important_key": {
			"enum": ["B"]
		},
	}
}

var exampleTypeA2 = {
	"title": "Schema A",
	"type": "object",
	"properties": {
		"important_key": {
			"type": "object",
			"required": ["inner_key"],
			"properties": {
				"inner_key": {"enum": ["A"]}
			}
		}
	}
}

var exampleTypeB2 = {
	"title": "Schema B",
	"type": "object",
	"properties": {
		"important_key": {
			"type": "object",
			"required": ["inner_key"],
			"properties": {
				"inner_key": {"enum": ["B"]}
			}
		}
	}
}

var exampleSchema = {
	"type": [
	exampleTypeA,
	exampleTypeB, "string"]
};

var exampleSchema2 = {
	"type": [
	exampleTypeA2,
	exampleTypeB2, "string"]
};

tests.add("Listing \"or\" options (v3-style)", function () {
	var data = Jsonary.create(exampleData);
	var schema = Jsonary.createSchema(exampleSchema);
	data.addSchema(schema);
	var schemas = data.schemas();
	var orSchemas = schema.orSchemas();
	this.assert(orSchemas.length == 1, "orSchemas.length should be 1, was " + orSchemas.length);
	this.assert(orSchemas[0].length == 3, "orSchemas[0].length should be 3, was " + orSchemas.length);
	return true;
});

tests.add("Listing \"xor\" options: (v4-style)", function () {
	var schema = Jsonary.createSchema({
		"oneOf": [
			{"title": "Schema 1"},
			{"title": "Schema 1"}
		]
	});
	var xorSchemas = schema.xorSchemas();
	this.assert(xorSchemas.length == 1, "orSchemas.length should be 1, was " + xorSchemas.length);
	this.assert(xorSchemas[0].length == 2, "orSchemas[0].length should be 3, was " + xorSchemas.length);
	return true;
});

tests.add("Validating a schema with types", function () {
	var thisTest = this;
	var data = Jsonary.create(exampleData);
	var schema = Jsonary.createSchema(exampleSchema);
	var callbackCount = 0;
	var lastMatch = null;
	var lastFailReason = null;
	var failReasons = [];

	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (match, failReason) {
		callbackCount++;
		lastMatch = match;
		lastFailReason = failReason;
		failReasons.push(failReason);
	});
	thisTest.assert(callbackCount === 1, "callbackCount == 1");
	thisTest.assert(lastMatch === true, "initial match should be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	data.property("important_key").setValue(1);
	thisTest.assert(callbackCount === 2, "callbackCount == 2, was " + callbackCount);
	thisTest.assert(lastMatch === false, "second match should be false, was " + JSON.stringify(lastMatch));

	data.setValue("some string");
	thisTest.assert(lastMatch === true, "third match should be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);
	thisTest.assert(callbackCount === 3, "callbackCount should be 3, was " + callbackCount);

	data.setValue({
		"important_key": "B"
	});
	thisTest.assert(callbackCount === 3, "callbackCount == 3 (no change), was " + callbackCount);
	thisTest.assert(lastMatch === true, "third match should still be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	data.setValue({
		"important_key": "X"
	});
	thisTest.assert(callbackCount === 4, "callbackCount == 4");
	thisTest.assert(lastMatch === false, "fourth match should be false, was " + JSON.stringify(lastMatch));

	data.setValue({
		"important_key": false
	});
	thisTest.assert(callbackCount === 4, "callbackCount == 4 (no change)");
	thisTest.assert(lastMatch === false, "fourth match should still be false, was " + JSON.stringify(lastMatch));

	data.property("important_key").setValue("A");
	thisTest.assert(callbackCount === 5, "callbackCount == 5");
	thisTest.assert(lastMatch === true, "fifth match should be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	return true;
});

tests.add("Validating a different schema with types, because I can't quite believe that just worked", function () {
	var thisTest = this;
	var schema = Jsonary.createSchema({
		"type": "object",
		"properties": {
			"switchContainer": {
				"type": [{
					"properties": {
						"switch": {
							"enum": [true]
						},
						"text": {
							"enum": ["true"]
						}
					}
				}, {
					"properties": {
						"switch": {
							"enum": [false]
						},
						"text": {
							"enum": ["false"]
						}
					}
				}],
				"properties": {
					"switch": {
						"type": "boolean"
					},
					"text": {
						"type": "string"
					}
				},
				"extends": {
					"type": "object"
				}
			}
		}
	});
	var data = Jsonary.create({
		"switchContainer": {
			"switch": true,
			"text": "maybe"
		}
	});

	var callbackCount = 0;
	var lastMatch = null;
	var lastFailReason = null;
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (match, failReason) {
		callbackCount++;
		lastMatch = match;
		lastFailReason = failReason;
	});

	thisTest.assert(callbackCount === 1, "callbackCount == 1, was " + callbackCount);
	thisTest.assert(lastMatch === false, "first match should be false, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	// Could count as the same error, or a different one
	if (callbackCount === 1) {
		callbackCount = 2;
	}
	data.property("switchContainer").property("switch").setValue(false);
	thisTest.assert(callbackCount === 2, "callbackCount == 2, was " + callbackCount);
	thisTest.assert(lastMatch === false, "second match should be false, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	// Could count as the same error, or a different one
	if (callbackCount === 2) {
		callbackCount = 3;
	}
	data.property("switchContainer").property("text").setValue("true");
	thisTest.assert(callbackCount === 3, "callbackCount == 3, was " + callbackCount);
	thisTest.assert(lastMatch === false, "third match should be false, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	data.property("switchContainer").property("switch").setValue(true);
	thisTest.assert(callbackCount === 4, "callbackCount == 4, was " + callbackCount);
	thisTest.assert(lastMatch === true, "fourth match should be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	data.property("switchContainer").property("switch").setValue(false);
	thisTest.assert(callbackCount === 5, "callbackCount == 5, was " + callbackCount);
	thisTest.assert(lastMatch === false, "fifth match should be false, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	data.property("switchContainer").removeProperty("text");
	thisTest.assert(callbackCount === 6, "callbackCount == 6, was " + callbackCount);
	thisTest.assert(lastMatch === true, "sixth match should be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	data.property("switchContainer").property("text").setValue("false");
	thisTest.assert(callbackCount === 6, "callbackCount == 6 (still), was " + callbackCount);
	thisTest.assert(lastMatch === true, "seventh match should be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	data.property("switchContainer").removeProperty("switch");
	thisTest.assert(callbackCount === 6, "callbackCount == 6, was " + callbackCount);
	thisTest.assert(lastMatch === true, "eighth match should still be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	return true;
});


tests.add("Validating a third schema with types", function () {
	var thisTest = this;
	var data = Jsonary.create(exampleData2);
	var schema = Jsonary.createSchema(exampleSchema2);
	var callbackCount = 0;
	var lastMatch = null;
	var lastFailReason = null;
	var failReasons = [];

	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (match, failReason) {
		callbackCount++;
		lastMatch = match;
		lastFailReason = failReason;
		failReasons.push(failReason);
	});
	thisTest.assert(callbackCount === 1, "callbackCount == 1");
	thisTest.assert(lastMatch === true, "initial match should be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	data.property("important_key").property("inner_key").setValue(1);
	thisTest.assert(callbackCount === 2, "callbackCount == 2, was " + callbackCount);
	thisTest.assert(lastMatch === false, "second match should be false, was " + JSON.stringify(lastMatch));

	data.setValue("some string");
	thisTest.assert(lastMatch === true, "third match should be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);
	thisTest.assert(callbackCount === 3, "callbackCount should be 3, was " + callbackCount);

	data.setValue({
		"important_key": {"inner_key": "A"}
	});
	thisTest.assert(callbackCount === 3, "callbackCount == 3 (no change), was " + callbackCount);
	thisTest.assert(lastMatch === true, "third match should still be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	data.setValue({
		"important_key": {"inner_key": "B"}
	});
	thisTest.assert(callbackCount === 3, "callbackCount == 3 (no change), was " + callbackCount);
	thisTest.assert(lastMatch === true, "third match should still be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	data.setValue({
		"important_key": "X"
	});
	thisTest.assert(callbackCount === 4, "callbackCount == 4");
	thisTest.assert(lastMatch === false, "fourth match should be false, was " + JSON.stringify(lastMatch));

	data.setValue({
		"important_key": false
	});
	thisTest.assert(callbackCount === 4, "callbackCount == 4 (no change)");
	thisTest.assert(lastMatch === false, "fourth match should still be false, was " + JSON.stringify(lastMatch));

	data.property("important_key").setValue({}).property("inner_key").setValue("A");
	thisTest.assert(callbackCount === 5, "callbackCount == 5, was " + callbackCount);
	thisTest.assert(lastMatch === true, "fifth match should be true, was " + JSON.stringify(lastMatch) + ": " + lastFailReason);

	return true;
});

