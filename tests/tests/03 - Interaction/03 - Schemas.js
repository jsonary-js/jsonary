tests.add("links()", function () {
	var schema = Jsonary.createSchema({
		links: [
			{href:"http://example.com/link-rel1", rel:"rel1"},
			{href:"http://example.com/link-rel2", rel:"rel2"}
		]
	});
	
	this.assert(schema.links().length == 2, "schema.links().length == 2");

	var link = schema.getLink("rel1");
	this.assert(link.href = "http://example.com/link-rel1", "link.href");
	
	return true;
});

tests.add("fixedSchemas() with allOf", function () {
	var schema = Jsonary.createSchema({
		allOf: [
			{
				"title": "Schema 1"
			},
			{
				"title": "Schema 2"
			}
		]
	});
	var data = Jsonary.create({});
	data.addSchema(schema);
	
	var schemaList = data.schemas();
	
	this.assert(schemaList.length == 3, "schemaList.length should be 3, was " + schemaList.length);
	this.assert(schemaList.fixed().length == 3, "schemaList.fixed().length should be 3, was " + schemaList.fixed().length);
	
	return true;
});

tests.add("fixedSchemas() with anyOf/allOf", function () {
	var schema = Jsonary.createSchema({
		anyOf: [
			{
				"title": "Schema 1"
			},
			{
				"title": "Schema 2"
			}
		],
		oneOf: [
			{
				"title": "Schema 3",
				"type": "object"
			},
			{
				"title": "Schema 4",
				"type": "boolean"
			}
		]
	});
	var data = Jsonary.create({});
	data.addSchema(schema);
	
	var schemaList = data.schemas();
	
	this.assert(schemaList.length == 4, "schemaList.length should be 4, was " + schemaList.length);
	this.assert(schemaList.fixed().length == 1, "schemaList.fixed().length should be 1, was " + schemaList.fixed().length);
	
	return true;
});

tests.add("fixedSchemas() with property", function () {
	var schema = Jsonary.createSchema({
		anyOf: [
			{
				"title": "Schema 1",
				"description": "Should always be applied",
				"properties": {
					"testKey": {
						"title": "Subschema 1A"
					}
				}
			}
		]
	});
	var data = Jsonary.create({testKey: "test"});
	data.addSchema(schema);
	
	var schemaList = data.property("testKey").schemas();
	
	this.assert(schemaList.length == 1, "schemaList.length should be 1, was " + schemaList.length);
	this.assert(schemaList.fixed().length == 1, "schemaList.fixed().length should be 1, was " + schemaList.fixed().length);
	
	return true;
});

tests.add("fixedSchemas() with item", function () {
	var schema = Jsonary.createSchema({
		anyOf: [
			{
				"title": "Schema 1",
				"description": "Should always be applied",
				"items": {
					"title": "Subschema 1A"
				}
			}
		]
	});
	var data = Jsonary.create(["test"]);
	data.addSchema(schema);
	
	var schemaList = data.item(0).schemas();
	
	this.assert(schemaList.length == 1, "schemaList.length should be 1, was " + schemaList.length);
	this.assert(schemaList.fixed().length == 1, "schemaList.fixed().length should be 1, was " + schemaList.fixed().length);
	
	return true;
});


tests.add("fixedSchemas() with dependency", function () {
	var schema = Jsonary.createSchema({
		dependencies: {
			"testKey": {
				"title": "Subschema"
			}
		}
	});
	var data = Jsonary.create({
		testKey: "test"
	});
	data.addSchema(schema);
	
	var schemaList = data.schemas();
	
	this.assert(schemaList.length == 2, "schemaList.length should be 2, was " + schemaList.length);
	this.assert(schemaList.fixed().length == 1, "schemaList.fixed().length should be 1, was " + schemaList.fixed().length);
	
	return true;
});
