tests.add("stealing properties", function () {
	var schema1 = Jsonary.createSchema({
		type: "object",
		properties: {
			propA: {type: "string"},
			propB: {type: "number"}
		},
		required: ["propA", "propB"]
	});
	var origData = {
		propA: "test string",
		propB: "other string"
	};
	var createdData = schema1.createValue(origData);
	
	this.assert(createdData.propA == origData.propA, "propA matches");
	this.assert(typeof createdData.propB == 'number', "propB is number, not string");
	return true;
});

tests.add("stealing properties in preference 1", function () {
	var schema1 = Jsonary.createSchema({
		type: "object",
		properties: {
			propA: {type: "string"},
			propB: {type: ["number", "string"]}
		},
		required: ["propA", "propB"]
	});
	var origData = {
		propA: "test string",
		propB: "other string"
	};
	var createdData = schema1.createValue(origData);
	
	this.assert(createdData.propA == origData.propA, "propA matches");
	this.assert(createdData.propB == origData.propB, "propB matches");
	return true;
});

tests.add("stealing properties in preference 2", function () {
	var schema1 = Jsonary.createSchema({
		type: "object",
		properties: {
			propA: {type: "string"},
			propB: {type: ["number", "string"]}
		},
		required: ["propA", "propB"]
	});
	var origData = {
		propA: "test string",
		propB: 2
	};
	var createdData = schema1.createValue(origData);
	
	this.assert(createdData.propA == origData.propA, "propA matches");
	this.assert(createdData.propB == origData.propB, "propB matches");
	return true;
});

tests.add("defining properties where possible", function () {
	var schema1 = Jsonary.createSchema({
		type: "object",
		properties: {
			propA: {type: "string"},
			propB: {type: "string"}
		},
	});
	var origData = {
		propA: "test string",
		propB: 2,
		propC: true
	};
	var createdData = schema1.createValue(origData);
	
	this.assert(createdData.propA == origData.propA, "propA matches");
	this.assert(typeof createdData.propB !== 'number', "propB is not a number");
	this.assert(createdData.propC == origData.propC, "propA matches");
	return true;
});

tests.add("defining array items to match original", function () {
	var schema1 = Jsonary.createSchema({
		type: "array",
		items: {"type": "string"}
	});
	var origData = ["test string"];
	var createdData = schema1.createValue(origData);
	
	this.assert(createdData.length == origData.length, "lengths match");
	this.assert(createdData[0] == origData[0], "first index matches");
	return true;
});

tests.add("defining object properties inside array items (no constraints)", function () {
	var schema1 = Jsonary.createSchema({
		type: "array",
		items: {"type": "object"}
	});
	var origData = [
		{
			"propA": "test string",
			"propB": "test string"
		}
	];
	var createdData = schema1.createValue(origData);
	
	this.assert(createdData.length == origData.length, "lengths match");
	this.assert(createdData[0].propA == origData[0].propA, "/0/propA matches");
	this.assert(createdData[0].propB == origData[0].propB, "/0/propA matches");
	return true;
});

tests.add("used in preference to default", function () {
	var schema1 = Jsonary.createSchema({
		type: "number",
		'default': 5
	});
	var origData = 10;
	var createdData = schema1.createValue(origData);
	
	this.assert(createdData == origData, "data matches");
	return true;
});

tests.add("default used when supplied value is invalid", function () {
	var schema1 = Jsonary.createSchema({
		type: "number",
		'default': 5
	});
	var origData = "ten";
	var createdData = schema1.createValue(origData);
	
	this.assert(createdData == 5, "data matches");
	return true;
});

tests.add("used in preference to default (with callback)", function () {
	var thisTest = this;
	var schema1 = Jsonary.createSchema({
		type: "number",
		'default': 5
	});
	var origData = 10;
	schema1.createValue(function (createdData) {
		thisTest.assert(createdData == origData, "data matches");
		thisTest.pass();
	}, origData);
});

tests.add("default used when supplied value is invalid (with callback)", function () {
	var thisTest = this;
	var schema1 = Jsonary.createSchema({
		type: "number",
		'default': 5
	});
	var origData = "ten";
	schema1.createValue(function (createdData) {
		thisTest.assert(createdData == 5, "data matches");
		thisTest.pass();
	}, origData);
});

tests.add("casting number -> string", function () {
	var schema1 = Jsonary.createSchema({
		type: "string"
	});
	var origData = 10;
	var createdData = schema1.createValue(origData);
	
	this.assert("10" === createdData, "data matches");
	return true;
});

tests.add("casting string -> number", function () {
	var schema1 = Jsonary.createSchema({
		type: "number"
	});
	var origData = "10.5";
	var createdData = schema1.createValue(origData);
	
	this.assert(10.5 === createdData, "data matches");
	return true;
});

tests.add("casting string -> integer", function () {
	var schema1 = Jsonary.createSchema({
		type: "integer"
	});
	var origData = "10";
	var createdData = schema1.createValue(origData);
	
	this.assert(10 === createdData, "data matches");
	return true;
});

tests.add("use default boolean value (true)", function () {
	var schema1 = Jsonary.createSchema({
		type: "boolean",
		'default': true
	});
	var createdData = schema1.createValue();
	
	this.assert(createdData === true, "data matches");
	return true;
});

tests.add("use default boolean value (false)", function () {
	var schema1 = Jsonary.createSchema({
		type: "boolean",
		'default': false
	});
	var createdData = schema1.createValue();
	
	this.assert(createdData === false, "data matches");
	return true;
});
