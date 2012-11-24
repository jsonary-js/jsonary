tests.add("minLength() and maxLength()", function() {
	var schema1 = Jsonary.createSchema({
		maxLength: 10,
		minLength: 1
	});
	var schema2 = Jsonary.createSchema({
		maxLength: 5,
		minLength: 0
	});
	var schema3 = Jsonary.createSchema({
		maxLength: 5,
		minLength: 5
	});
	var data = Jsonary.create("value");
	
	var maxLength = data.schemas().maxLength();
	this.assert(maxLength == null, "maxLength == null");
	var minLength = data.schemas().minLength();
	this.assert(minLength == 0, "minLength == 0");

	data.addSchema(schema1);
	var maxLength = data.schemas().maxLength();
	this.assert(maxLength == 10, "maxLength == 10");
	var minLength = data.schemas().minLength();
	this.assert(minLength == 1, "minLength == 1");
	
	data.addSchema(schema2);
	var maxLength = data.schemas().maxLength();
	this.assert(maxLength == 5, "maxLength == 5");
	var minLength = data.schemas().minLength();
	this.assert(minLength == 1, "minLength stil == 1");

	data.addSchema(schema3);
	var maxLength = data.schemas().maxLength();
	this.assert(maxLength == 5, "maxLength still == 5");
	var minLength = data.schemas().minLength();
	this.assert(minLength == 5, "minLength == 5");
	
	return true;
});

