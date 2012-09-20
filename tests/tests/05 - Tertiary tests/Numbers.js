tests.add("numberInterval()", function() {
	var schema1 = Jsonary.createSchema({
		divisibleBy: 1.5
	});
	var schema2 = Jsonary.createSchema({
		type: "integer"
	});
	var schema3 = Jsonary.createSchema({
		divisibleBy: -2
	});
	var schema4 = Jsonary.createSchema({
		divisibleBy: 0
	});
	var data = Jsonary.create(6);
	
	var numberInterval = data.schemas().numberInterval();
	this.assert(numberInterval == null, "numberInterval == null");

	data.addSchema(schema1);
	var numberInterval = data.schemas().numberInterval();
	this.assert(numberInterval == 1.5, "numberInterval == 1.5");
	
	data.addSchema(schema2);
	var numberInterval = data.schemas().numberInterval();
	this.assert(numberInterval == 3, "numberInterval == 3");

	data.addSchema(schema3);
	var numberInterval = data.schemas().numberInterval();
	this.assert(numberInterval == 6, "numberInterval == 6");
	
	data.addSchema(schema4);
	var numberInterval = data.schemas().numberInterval();
	this.assert(isNaN(numberInterval), "numberInterval should be NaN");
	return true;
});

