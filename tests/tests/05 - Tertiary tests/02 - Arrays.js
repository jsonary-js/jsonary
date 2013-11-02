tests.add("tupleTypingLength()", function() {
	var schema1 = Jsonary.createSchema({
		items: {}
	});
	var schema2 = Jsonary.createSchema({
		items: [{}]
	});
	var schema3 = Jsonary.createSchema({
		items: [{}, {}]
	});
	var data = Jsonary.create([]);
	
	var tupleTypingLength = data.schemas().tupleTypingLength();
	this.assert(tupleTypingLength == 0, "tupleTypingLength == 0");

	data.addSchema(schema1);
	var tupleTypingLength = data.schemas().tupleTypingLength();
	this.assert(tupleTypingLength == 0, "tupleTypingLength still == 0");
	
	data.addSchema(schema2);
	var tupleTypingLength = data.schemas().tupleTypingLength();
	this.assert(tupleTypingLength == 1, "tupleTypingLength == 1");

	data.addSchema(schema3);
	var tupleTypingLength = data.schemas().tupleTypingLength();
	this.assert(tupleTypingLength == 2, "tupleTypingLength == 2");
	
	return true;
});

tests.add('uniqueItems()', function () {
	var schema1 = Jsonary.createSchema({
		type: 'array'
	});
	var schema2 = Jsonary.createSchema({
		type: 'array',
		uniqueItems: false
	});
	var schema3 = Jsonary.createSchema({
		type: 'array',
		uniqueItems: true
	});
	
	var schemaList;
	schemaList = Jsonary.createSchemaList([schema1]);
	this.assert(schemaList.uniqueItems() === false, '1: false');
	schemaList = Jsonary.createSchemaList([schema1, schema2]);
	this.assert(schemaList.uniqueItems() === false, '2: false');
	schemaList = Jsonary.createSchemaList([schema3]);
	this.assert(schemaList.uniqueItems() === true, '3: true');
	schemaList = Jsonary.createSchemaList([schema1, schema3]);
	this.assert(schemaList.uniqueItems() === true, '4: true');
	schemaList = Jsonary.createSchemaList([schema2, schema3]);
	this.assert(schemaList.uniqueItems() === true, '5: true');
	return true;
});

tests.add('unordered()', function () {
	var schema1 = Jsonary.createSchema({
		type: 'array'
	});
	var schema2 = Jsonary.createSchema({
		type: 'array',
		unordered: false
	});
	var schema3 = Jsonary.createSchema({
		type: 'array',
		unordered: true
	});
	var schema4 = Jsonary.createSchema({
		items: [{type: 'integer'}]
	});
	
	var schemaList;
	schemaList = Jsonary.createSchemaList([schema1]);
	this.assert(schemaList.unordered() === false, '1: false');
	schemaList = Jsonary.createSchemaList([schema1, schema2]);
	this.assert(schemaList.unordered() === false, '2: false');
	schemaList = Jsonary.createSchemaList([schema3]);
	this.assert(schemaList.unordered() === true, '3: true');
	schemaList = Jsonary.createSchemaList([schema1, schema3]);
	this.assert(schemaList.unordered() === true, '4: true');
	schemaList = Jsonary.createSchemaList([schema2, schema3]);
	this.assert(schemaList.unordered() === true, '5: true');
	schemaList = Jsonary.createSchemaList([schema2, schema3, schema4]);
	this.assert(schemaList.unordered() === false, '6: false');
	return true;
});