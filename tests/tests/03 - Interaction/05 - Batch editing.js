tests.add("batch() and endBatch", function () {
	var callbackCount = 0;
	Jsonary.registerChangeListener(function (patch, document) {
		callbackCount++;
	});
	
	var data = Jsonary.create("");
	Jsonary.batch();
	data.setValue({});
	data.property("key").setValue("value");
	this.assert(callbackCount == 0, "callbackCount == 0");
	Jsonary.batchDone();
	this.assert(callbackCount == 1, "callbackCount == 1");
	return true;
});

tests.add("batch(fn)", function () {
	var callbackCount = 0;
	Jsonary.registerChangeListener(function (patch, document) {
		callbackCount++;
	});
	
	var data = Jsonary.create("");
	Jsonary.batch(function () {
		data.setValue({});
		data.property("key").setValue("value");
	});
	this.assert(callbackCount == 1, "callbackCount == 1");
	return true;
});

tests.add("patch.inverse()", function () {
	var callbackCount = 0;
	var patch = null;
	Jsonary.registerChangeListener(function (p, document) {
		callbackCount++;
		patch = p;
	});
	
	var data = Jsonary.create({key1: "value 1"});
	Jsonary.batch(function () {
		data.property("key1").setValue("value 2");
		data.property("key2").setValue("blah");
	});
	var inversePatch = patch.inverse();
	data.document.patch(inversePatch);
	this.assert(data.propertyValue("key1") == "value 1", "data.key1 == value 1");
	this.assert(data.property("key2").defined() == false, "data.key2 not defined");
	return true;
});

