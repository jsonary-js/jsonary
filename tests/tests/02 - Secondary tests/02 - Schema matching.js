var dataNull = null;
var schemaNull = {
	type: "null"
};

var dataBoolean = false;
var schemaBoolean = {
	type: "boolean"
};

var dataInteger = 5;
var schemaInteger = {
	type: "integer"
};

var dataNumber = 4.52;
var schemaNumber = {
	type: "number"
};

var dataString = "string";
var schemaString = {
	type: "string"
};

var dataArray = [1, 2, 3];
var schemaArray = {
	type: "array"
};

var dataObject = {
	"key": "value"
};
var schemaObject = {
	type: "object"
};

var schemaTypeParent = {
	items: [schemaString, schemaObject]
}

var schemaEnum1 = {
	"enum": [1, "one"]
};
var schemaEnum2 = {
	"enum": [2, "two"]
};

var schemaEnumParent = {
	properties: {
		"one": schemaEnum1,
		"two": schemaEnum2
	}
}

tests.add("Enum test pass", function () {
	var thisTest = this;
	var data1 = Jsonary.create(1);
	var schema1 = Jsonary.createSchema(schemaEnum1);
	var schemaKey = Jsonary.getMonitorKey();
	data1.addSchemaMatchMonitor(schemaKey, schema1, function (match, failReason) {
		thisTest.assert(match === true, "match must be true: " + failReason);
		thisTest.assert(this === schema1, "this must equal schema1");
		thisTest.pass();
	}, true);
	setTimeout(function () {
		thisTest.fail("timeout");
	}, 50);
});

tests.add("Enum test fail", function () {
	var thisTest = this;
	var data2 = Jsonary.create("two");
	var schema1 = Jsonary.createSchema(schemaEnum1);
	var schemaKey = Jsonary.getMonitorKey();
	data2.addSchemaMatchMonitor(schemaKey, schema1, function (match, failReason) {
		thisTest.assert(match === false, "match must be false");
		thisTest.assert(this === schema1, "this must equal schema1");
		thisTest.pass();
	}, true);
	setTimeout(function () {
		thisTest.fail("timeout");
	}, 50);
});

tests.add("Enum value change", function () {
	var thisTest = this;
	var data2 = Jsonary.create("two");
	var schema1 = Jsonary.createSchema(schemaEnum1);
	var schemaKey = Jsonary.getMonitorKey();
	var i = 0;
	data2.addSchemaMatchMonitor(schemaKey, schema1, function (match, failReason) {
		i++;
		if (i == 1) {
			thisTest.assert(match === false, "match must be false on first callback");
		} else if (i == 2) {
			thisTest.assert(match === true, "match must be true on second callback: " + failReason);
		} else if (i == 3) {
			thisTest.assert(match === false, "match must be false on third callback");
			thisTest.pass()
		}
	}, true);
	data2.setValue("one");
	data2.setValue(2);
	setTimeout(function () {
		thisTest.fail("timeout");
	}, 50);
});

tests.add("Enum sub-data change", function () {
	var thisTest = this;
	var data = Jsonary.create({
		"one": "two"
	});
	var schema = Jsonary.createSchema(schemaEnumParent);
	var schemaKey = Jsonary.getMonitorKey();
	var i = 0;
	data.addSchemaMatchMonitor(schemaKey, schema, function (match, failReason) {
		i++;
		if (i == 1) {
			thisTest.assert(match === false, "match must be false on first callback");
		} else if (i == 2) {
			thisTest.assert(match === true, "match must be true on second callback: " + failReason);
		} else if (i == 3) {
			thisTest.assert(match === false, "match must be false on third callback");
		} else if (i == 4) {
			thisTest.assert(match === true, "match must be true on fourth callback: " + failReason);
		} else if (i == 5) {
			thisTest.assert(match === false, "match must be false on fifth callback");
		} else if (i == 6) {
			thisTest.assert(match === true, "match must be true on sixth callback: " + failReason);
			thisTest.pass();
		}
	}, true);
	data.property("one").setValue(1);	// 2: {one: 1}
	data.property("two").setValue(1);	// 3: {one: 1, two: 1}
	data.property("two").setValue("two");	// 4: {one: 1, two: "two"}
	data.property("one").setValue(2);	// 5: {one: 2, two: "two"}
	data.removeProperty("one");	// 6: {two: "two"}
	setTimeout(function () {
		thisTest.fail("timeout");
	}, 50);
});

tests.add("Basic type match success", function() {
	var thisTest = this;
	var data = Jsonary.create(dataBoolean);
	var schema = Jsonary.createSchema(schemaBoolean);
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (match, failReason) {
		thisTest.assert(match === true, "match must be true: " + failReason);
		thisTest.pass();
	});
	setTimeout(function () {
		thisTest.fail("timeout");
	}, 50);
});

tests.add("Basic type match failure", function() {
	var thisTest = this;
	var data = Jsonary.create(dataBoolean);
	var schema = Jsonary.createSchema(schemaNull);
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (match, failReason) {
		thisTest.assert(match === false, "match must be false: " + JSON.stringify(schema.basicTypes()));
		thisTest.pass();
	});
	setTimeout(function () {
		thisTest.fail("timeout");
	}, 50);
});


tests.add("Basic type value change", function () {
	var thisTest = this;
	var data2 = Jsonary.create(dataBoolean);
	var schema1 = Jsonary.createSchema(schemaInteger);
	var schemaKey = Jsonary.getMonitorKey();
	var i = 0;
	data2.addSchemaMatchMonitor(schemaKey, schema1, function (match, failReason) {
		i++;
		if (i == 1) {
			thisTest.assert(match === false, "match must be false on first callback");
		} else if (i == 2) {
			thisTest.assert(match === true, "match must be true on second callback: " + failReason);
		} else if (i == 3) {
			thisTest.assert(match === false, "match must be false on third callback");
			thisTest.pass()
		}
	}, true);
	data2.setValue(dataInteger);
	data2.setValue(dataString);
	setTimeout(function () {
		thisTest.fail("timeout");
	}, 50);
});

tests.add("Basic type sub-data change", function () {
	var thisTest = this;
	var data = Jsonary.create([5]);
	var schema = Jsonary.createSchema(schemaTypeParent);
	var schemaKey = Jsonary.getMonitorKey();
	var i = 0;
	data.addSchemaMatchMonitor(schemaKey, schema, function (match, failReason) {
		i++;
		if (i == 1) {
			thisTest.assert(match === false, "match must be false on first callback");
		} else if (i == 2) {
			thisTest.assert(match === true, "match must be true on second callback: " + failReason);
		} else if (i == 3) {
			thisTest.assert(match === false, "match must be false on third callback");
		} else if (i == 4) {
			thisTest.assert(match === true, "match must be true on fourth callback: " + failReason);
		} else if (i == 5) {
			thisTest.assert(match === false, "match must be false on fifth callback");
		} else if (i == 6) {
			thisTest.assert(match === false, "match must be false on sixth callback");
		} else if (i == 7) {
			thisTest.assert(match === true, "match must be true on seventh callback: " + failReason);
			thisTest.pass();
		} else {
			alert("surplus notification " + i + ": " + match + " : " + failReason);
		}
	}, true);
	this.assert(i == 1, "we should have had exactly 1 notification by now");

	data.index(0).setValue(dataString) // 2
	this.assert(i == 2, "we should have had exactly 2 notifications by now");

	data.index(1).setValue(dataBoolean); // 3
	this.assert(i == 3, "we should have had exactly 3 notifications by now");

	data.index(1).setValue(dataObject); // 4
	this.assert(i == 4, "we should have had exactly 4 notifications by now");

	data.removeIndex(1);
	this.assert(i == 4, "we should not have had another notification when index 1 was deleted");

	data.index(1).setValue(dataObject);
	this.assert(i == 4, "we should not have had a notification when we added dataObject to index 1, as it should still be passing");

	data.removeIndex(0); // 5
	this.assert(i == 5, "we should have had exactly 5 notifications by now, not " + i);

	data.index(1).setValue(dataString); // 6
	if (i == 5) {
		i = 6;
	}
	this.assert(i == 6, "we should have had 5 or 6 notifications by now, not " + i);

	data.removeIndex(0); // 7
	this.assert(i == 7, "we should have had a notification when we remove index 0, as the new value slides into place");

	setTimeout(function () {
		thisTest.fail("timeout");
	}, 50);
});

tests.add("Schema expansion", function () {
	var thisTest = this;
	Jsonary.addToCache("http://example.com/schema?test=expansion", {
		"enum": ["B"]
	});
	
	var data = Jsonary.create("A");
	var schema = Jsonary.createSchema({"$ref": "http://example.com/schema?test=expansion"});
	
	var matchHistory = [];
	var failReasonHistory = [];
	var schemaKey = Jsonary.getMonitorKey();
	data.addSchemaMatchMonitor(schemaKey, schema, function (match, failReason) {
		matchHistory.push(match);
		failReasonHistory.push(failReason);
	}, true);
	this.assert(matchHistory.length == 1, "matchHistory.length == 1");
	this.assert(matchHistory[0] == false, "matchHistory[0] should be false");
	return true;
});

