tests.add("minProperties() and maxProperties", function() {
	var schema1 = Jsonary.createSchema({
		maxProperties: 10,
		minProperties: 1
	});
	var schema2 = Jsonary.createSchema({
		maxProperties: 5,
		minProperties: 0
	});
	var schema3 = Jsonary.createSchema({
		maxProperties: 5,
		minProperties: 5
	});
	var data = Jsonary.create({"key": true});
	
	var maxProperties = data.schemas().maxProperties();
	this.assert(maxProperties == null, "maxProperties == null");
	var minProperties = data.schemas().minProperties();
	this.assert(minProperties == 0, "minProperties == 0");

	data.addSchema(schema1);
	var maxProperties = data.schemas().maxProperties();
	this.assert(maxProperties == 10, "maxProperties == 10");
	var minProperties = data.schemas().minProperties();
	this.assert(minProperties == 1, "minProperties == 1");
	
	data.addSchema(schema2);
	var maxProperties = data.schemas().maxProperties();
	this.assert(maxProperties == 5, "maxProperties == 5");
	var minProperties = data.schemas().minProperties();
	this.assert(minProperties == 1, "minProperties stil == 1");

	data.addSchema(schema3);
	var maxProperties = data.schemas().maxProperties();
	this.assert(maxProperties == 5, "maxProperties still == 5");
	var minProperties = data.schemas().minProperties();
	this.assert(minProperties == 5, "minProperties == 5");
	
	return true;
});

