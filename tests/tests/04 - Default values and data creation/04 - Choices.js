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
	
	return true;
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
