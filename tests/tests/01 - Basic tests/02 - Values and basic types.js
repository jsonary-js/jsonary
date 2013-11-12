var exampleData = {
	"null key": null,
	"boolean key": true,
	"number key": 4,
	"string key": "string",
	"array key": [0, 1, 2, 3, 4],
	"object key": {
		"key": "value"
	}
}

var exampleArray = [false, {
	"key": "value"
},
5];

tests.add("Creating data", function () {
	var data = Jsonary.create(exampleData);
	return Jsonary !== undefined;
});

tests.add("Creating/extracting data", function () {
	var data = Jsonary.create(exampleData);
	return recursiveCompare(exampleData, data.value());
});

tests.add("Setting/getting (value/setValue)", function () {
	var data = Jsonary.create("value 1");
	this.assert(data.value() == "value 1", 'equal');
	
	data.setValue(false);
	this.assert(data.value() == false, 'equal 2');
	
	return true;
});

tests.add("Setting/getting (set/get)", function () {
	var data = Jsonary.create("value 1");
	this.assert(data.get() == "value 1", 1);
	
	data.set(false);
	this.assert(data.get() == false, 2);

	data.set(undefined);
	this.assert(data.get() === undefined, 3);

	data.set({a: 1, b: 2});
	this.assert(data.get('/a') === 1, 4);
	this.assert(data.get('/b') === 2, 5);
	
	data.set('/b', undefined);
	this.assert(data.get('/b') === undefined, 6);
	
	return true;
});

tests.add("Basic type (new)", function () {
	var data, basicType;
	var basicTypeExamples = {
		"null": null,
		"boolean": true,
		"number": 5.3,
		"integer": 5,
		"string": "string",
		"array": [],
		"object": {}
	}
	for (basicType in basicTypeExamples) {
		data = Jsonary.create(basicTypeExamples[basicType]);
		this.assert(data.basicType() == basicType, "Basic type of " + JSON.stringify(basicTypeExamples[basicType]) + " should be " + basicType + " not " + data.basicType());
	}
	data = Jsonary.create();
	this.assert(data.basicType() == undefined, "Basic type of undefined should be undefined, not " + JSON.stringify(data.basicType()));
	return true;
});

tests.add("Basic type (setValue)", function () {
	var data, basicType, i;
	// Yes, we have 5 in there twice.  When the previous basic type was a number, we shouldn't be guessing type as integer
	var basicTypes = ["null", "boolean", "integer", "number", "integer", "string", "array", "object"];
	var values = [null, true, 5, 5.3, 5, "string", [], {}];
	data = Jsonary.create("Initial value");
	for (i = 0; i < basicTypes.length; i++) {
		var basicType = basicTypes[i];
		var value = values[i];
		data.setValue(value);
		this.assert(data.basicType() == basicType, "Basic type of " + JSON.stringify(value) + " should be " + basicType + " not " + data.basicType());
	}
	return true;
});

tests.add("Array length and indices", function () {
	var i;
	var thisTest = this;
	var data = Jsonary.create(exampleArray);
	thisTest.assert(data.length() == exampleArray.length, "Length must reflect data");
	for (i = 0; i < data.length(); i++) {
		thisTest.assert(recursiveCompare(data.index(i).value(), exampleArray[i]), ".index(" + i + ").value() should match data[" + i + "]");
		thisTest.assert(recursiveCompare(data.indexValue(i), exampleArray[i]), ".indexValue(" + i + ") should match data[" + i + "]");
	}
	try {
		thisTest.assert(recursiveCompare(data.index(-1), undefined), ".index(-1) should return undefined if it does not throw an error");
		thisTest.assert(recursiveCompare(data.indexValue(-1), undefined), ".indexValue(-1) should return undefined if it does not throw an error");
	} catch (e) {
	}
	var overEndIndex = exampleArray.length;
	thisTest.assert(recursiveCompare(data.index(overEndIndex).value(), undefined), ".index(length).value() should return undefined");
	thisTest.assert(recursiveCompare(data.indexValue(overEndIndex), undefined), ".indexValue(length) should return undefined");
	return true;
});

tests.add("removeIndex()", function () {
	var i;
	var data = Jsonary.create([0, 1, 2]);
	this.assert(data.length() == 3, "Length must reflect data");
	data.removeIndex(0);
	this.assert(data.indexValue(0) == 1, "Value at [0] must be 1, was " + data.indexValue(0));
	this.assert(data.indexValue(1) == 2, "Value at [1] must be 2, was " + data.indexValue(0));
	return true;
});

tests.add("index(...).setValue()", function () {
	var i;
	var data = Jsonary.create([0, 1, 2]);
	this.assert(data.length() == 3, "Length must reflect data");
	data.index(0).setValue("zero");
	this.assert(data.indexValue(0) == "zero", "Value at [0] must be \"zero\", was " + data.indexValue(0));
	data.index(3).setValue("three");
	this.assert(data.length() == 4, "Length must reflect data");
	this.assert(data.indexValue(3) == "three", "Value at [3] must be \"three\", was " + data.indexValue(0));
	return true;
});

tests.add("Object keys and properties", function () {
	var i;
	var thisTest = this;
	var data = Jsonary.create(exampleData);
	var keys = [];
	for (var key in exampleData) {
		keys.push(key);
	}
	thisTest.assert(data.keys().length == keys.length, "keys must reflect data");
	var keys = data.keys();
	for (i = 0; i < keys.length; i++) {
		thisTest.assert(recursiveCompare(data.property(keys[i]).value(), exampleData[keys[i]]), ".property(" + keys[i] + ").value() should match data[" + keys[i] + "]");
		thisTest.assert(recursiveCompare(data.propertyValue(keys[i]), exampleData[keys[i]]), ".propertyValue(" + keys[i] + ") should match data[" + keys[i] + "]");
	}
	var notIncludedKey = "grgpgb'ogs3ipg'";
	thisTest.assert(recursiveCompare(data.property(notIncludedKey).value(), undefined), ".property(length).value() should return undefined");
	thisTest.assert(recursiveCompare(data.propertyValue(notIncludedKey), undefined), ".property(length).value() should return undefined");
	return true;
});

tests.add("removeProperty()", function () {
	var i;
	var data = Jsonary.create({"a": "b", "c": "d"});
	this.assert(data.keys().length == 2, "Object has two keys");
	data.removeProperty("a");
	this.assert(data.keys().length == 1, "Object should have one key remaining");
	this.assert(data.propertyValue("a") == undefined, "Value at [\"a\"] must be undefined, was " + data.propertyValue("a"));
	this.assert(data.propertyValue("c") == "d", "Value at [\"c\"] must still be \"d\", was " + data.propertyValue("c"));
	return true;
});

tests.add("property(...).setValue()", function () {
	var i;
	var data = Jsonary.create({"a": "b", "c": "d"});
	this.assert(data.keys().length == 2, "Object has two keys");
	data.property("a").setValue(1);
	this.assert(data.keys().length == 2, "Object should still have two keys");
	this.assert(data.propertyValue("a") == 1, "value at [\"a\"] should be 1");
	data.property("e").setValue(null);
	this.assert(data.keys().length == 3, "Object should have three keys");
	this.assert(data.propertyValue("e") == null, "value at [\"a\"] should be null");
	return true;
});

tests.add("moveTo(data) object", function () {
	var data = Jsonary.create({"key1": "value"});
	
	var key1 = data.property("key1");
	var key2 = data.property("key2");
	
	var result = key1.moveTo(key2);
	this.assert(!key1.defined(), "key1 should not be defined");
	this.assert(key2.value() == "value", "key2 == value");
	this.assert(result == key2, "moveTo() should return target");
	
	return true;
});

tests.add("moveTo(data) array", function () {
	var data = Jsonary.create([0, 1, 2, 3]);
	
	var result = data.item(2).moveTo(data.item(0));
	this.assert(data.value()[0] == 2, "[0] == 2");
	this.assert(data.value()[1] == 0, "[1] == 0");
	this.assert(data.value()[2] == 1, "[2] == 1");
	this.assert(result == data.item(0), "moveTo() should return target");

	var result = data.item(1).moveTo(data.item(3));
	this.assert(data.value()[0] == 2, "[0] == 2");
	this.assert(data.value()[1] == 1, "[1] == 1");
	this.assert(data.value()[2] == 3, "[2] == 3");
	this.assert(data.value()[3] == 0, "[3] == 0");
	this.assert(result == data.item(3), "moveTo() should return target");
	
	return true;
});

tests.add("document.move()", function () {
	var data = Jsonary.create({"key1": "value"});
	var document = data.document;
	
	var key1 = data.property("key1");
	var key2 = data.property("key2");
	document.move("/key1", "/key2");
	
	this.assert(!key1.defined(), "key1 should not be defined");
	this.assert(key2.value() == "value", "key2 == value");
	
	return true;
});

tests.add("defined()", function () {
	var data = Jsonary.create({"key": "value"});
	var dataKey = data.property("key");
	var dataKey2 = data.property("key2");
	this.assert(data.defined() === true, "data.defined() === true, not " + JSON.stringify(data.defined()));
	this.assert(dataKey.defined() === true, "dataKey.defined() === true, not " + JSON.stringify(data.defined()));
	this.assert(dataKey2.defined() === false, "dataKey2.defined() === false, not " + JSON.stringify(data.defined()));
	return true;
});

tests.add("get()", function () {
	var data = Jsonary.create({"key": {"subKey": "value"}});
	this.assert(data.get("/key/subKey") == "value", "values do not match");
	this.assert(typeof data.get("/key") == "object", "/key must be object");
	return true;
});

tests.add("set()", function () {
	var data = Jsonary.create({"key": {"subKey": "value"}});
	data.set("/key/subKey", "new value");
	this.assert(data.get("/key/subKey") == "new value", "values do not match");
	return true;
});

tests.add("document.get()", function () {
	var data = Jsonary.create({"key": {"subKey": "value"}});
	var document = data.document;
	this.assert(document.get("/key/subKey") == "value", "values do not match");
	this.assert(typeof document.get("/key") == "object", "/key must be object");
	return true;
});

tests.add("document.set()", function () {
	var data = Jsonary.create({"key": {"subKey": "value"}});
	var document = data.document;
	document.set("/key/subKey", "new value");
	this.assert(document.get("/key/subKey") == "new value", "values do not match");
	return true;
});

tests.add("properties() iterator", function () {
	var data = Jsonary.create({a:1, b:2, c:3});
	var counter = 0;
	data.properties(function (key, subData) {
		counter++;
	});
	return counter == 3;
});

tests.add("properties() iterator with prescribed keys", function () {
	var data = Jsonary.create({a:1, b:2, c:3});
	var result = [];
	data.properties(["a", "b"], function (key, subData) {
		result.push(subData.value());
	});
	data.properties(["b", "c"], function (key, subData) {
		result.push(subData.value());
	});
	return result[0] == 1 && result[1] == 2 && result[2] == 2 && result[3] == 3;
});

tests.add("properties() iterator with prescribed keys and secondary callback", function () {
	var data = Jsonary.create({a:1, b:2, c:3, d:10});
	var result = [];
	var additionalResult = [];
	data.properties(["b", "c"], function (key, subData) {
		result.push(subData.value());
	}, function (otherKey, subData) {
		additionalResult.push(subData.value());
	});
	data.properties([], false, function () {});
	this.assert(result.length == 2, "result.length == 2");
	this.assert(additionalResult.length == 2 && additionalResult[0] + additionalResult[1] == 11, "additionalResult");
	return true;
});