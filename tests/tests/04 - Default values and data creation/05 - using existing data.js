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
