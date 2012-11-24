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

