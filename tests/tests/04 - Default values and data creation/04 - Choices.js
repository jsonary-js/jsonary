tests.add("xorSchemas()", function () {
	var schema1 = Jsonary.createSchema({
		type: "number",
		oneOf: [
			{minimum: 10},
			{maximum: -1}
		]
	});
	var schema2 = Jsonary.createSchema({
		type: "number",
		oneOf: [
			{maximum: -5},
			{minimum: 5, maximum: 8}
		]
	});
	var schemaList = Jsonary.createSchemaList([schema1, schema2]);
	
	var xorSchemas = schemaList.xorSchemas();
	this.assert(xorSchemas.length == 2, "xorSchemas.length == 2");
	return true;
});

tests.add("orSchemas()", function () {
	var schema1 = Jsonary.createSchema({
		type: "number",
		anyOf: [
			{minimum: 10},
			{maximum: -1}
		]
	});
	var schema2 = Jsonary.createSchema({
		type: "number",
		anyOf: [
			{maximum: -5},
			{minimum: 5, maximum: 8}
		]
	});
	var schemaList = Jsonary.createSchemaList([schema1, schema2]);
	
	var orSchemas = schemaList.orSchemas();
	this.assert(orSchemas.length == 2, "xorSchemas.length == 2");
	return true;
});

tests.add("allCombinations()", function () {
	var schema1 = Jsonary.createSchema({
		type: "number",
		oneOf: [
			{minimum: 10},
			{
				anyOf: [
					{minimum: 10},
					{}
				]
			}
		]
	});
	var schema2 = Jsonary.createSchema({
		type: "number",
		oneOf: [
			{maximum: -5},
			{minimum: 5, maximum: 8}
		]
	});
	var schemaList = Jsonary.createSchemaList([schema1, schema2]);
	
	var combinations = schemaList.allCombinations();
	this.assert(combinations.length == 8, "combinations.length == 8, was " + combinations.length);
	// Check they are distinct
	for (var i = 0; i < combinations.length; i++) {
		for (var j = i + 1; j < combinations.length; j++) {
			var idsA = [];
			var idsB = [];
			combinations[i].each(function (index, schema) {
				idsA.push(schema.data.uniqueId);
			});
			combinations[j].each(function (index, schema) {
				idsB.push(schema.data.uniqueId);
			});
			idsA.sort();
			idsB.sort();
			if (recursiveCompare(idsA, idsB)) {
				thisTest.fail("Identical combinations at " + i + " and " + j);
			}
		}
	}
	
	return true;
});

tests.add("allCombinations(callback)", function () {
	var thisTest = this;
	var schema1 = Jsonary.createSchema({
		type: "number",
		oneOf: [
			{minimum: 10},
			{"$ref": "#/definitions/combo"}
		],
		definitions: {
			combo: {
				anyOf: [
					{minimum: 10},
					{}
				]
			}
		}
	});
	var schema2 = Jsonary.createSchema({
		type: "number",
		oneOf: [
			{maximum: -5},
			{minimum: 5, maximum: 8}
		]
	});
	var schemaList = Jsonary.createSchemaList([schema1, schema2]);
	
	schemaList.allCombinations(function (combinations) {
		thisTest.assert(combinations.length == 8, "combinations.length == 8, was " + combinations.length);
		// Check they are distinct
		for (var i = 0; i < combinations.length; i++) {
			for (var j = i + 1; j < combinations.length; j++) {
				var idsA = [];
				var idsB = [];
				combinations[i].each(function (index, schema) {
					idsA.push(schema.data.uniqueId);
				});
				combinations[j].each(function (index, schema) {
					idsB.push(schema.data.uniqueId);
				});
				idsA.sort();
				idsB.sort();
				if (recursiveCompare(idsA, idsB)) {
					thisTest.fail("Identical combinations at " + i + " and " + j);
				}
			}
		}
		thisTest.pass();
	});
	setTimeout(function () {
		thisTest.fail("Timeout");
	}, 100);
});

tests.add("xorSchemas value", function () {
	var schema1 = Jsonary.createSchema({
		type: "number",
		oneOf: [
			{minimum: 10},
			{maximum: -10}
		]
	});
	var schema2 = Jsonary.createSchema({
		type: "number",
		oneOf: [
			{maximum: -5},
			{minimum: 5, maximum: 8}
		]
	});
	var schemaList = Jsonary.createSchemaList([schema1, schema2]);
	
	var value = schemaList.createValue();
	this.assert(value <= -10, "value <= -10,  was " + value);
	
	return true;
});
