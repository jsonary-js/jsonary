tests.add("suggestedProperties()", function () {
	var schema = Jsonary.createSchema({
		type: "object",
		"properties": {
			"key1": {},
			"key2": {},
			"key3": {}
		}
	});
	this.assert(schema.definedProperties().length == 3, "schema.definedProperties().length == 3: " + JSON.stringify(schema.definedProperties()));
	this.assert(schema.allowedAdditionalProperties() == true, "schema.allowedAdditionalProperties() == true: " + JSON.stringify(schema.allowedAdditionalProperties()));
	var schema2 = Jsonary.createSchema({
		"properties": {
			"key3": {},
			"key4": {},
			"key5": {}
		},
		additionalProperties: true
	});
	this.assert(schema2.definedProperties().length == 3, "schema2.definedProperties().length == 3: " + JSON.stringify(schema2.definedProperties()));
	this.assert(schema2.allowedAdditionalProperties() == true, "schema2.allowedAdditionalProperties() == true: " + JSON.stringify(schema2.allowedAdditionalProperties()));
	var schema3 = Jsonary.createSchema({
		"properties": {
			"key2": {},
			"key4": {},
		},
		additionalProperties: false
	});
	this.assert(schema3.allowedAdditionalProperties() == false, "schema3.allowedAdditionalProperties() == false: " + JSON.stringify(schema3.allowedAdditionalProperties()));
	var schema4 = Jsonary.createSchema({
		"properties": {
			"key4": {},
			"key5": {},
		},
		additionalProperties: false
	});
	this.assert(schema4.allowedAdditionalProperties() == false, "schema4.allowedAdditionalProperties() == false: " + JSON.stringify(schema4.allowedAdditionalProperties()));
	
	var data = Jsonary.create({
		"key1": "value"
	});
	data.addSchema(schema);
	var schemas = data.schemas();
	var definedProperties = schemas.definedProperties();
	this.assert(definedProperties.length == 3, "definedProperties.length == 3: " + JSON.stringify(definedProperties));

	data.addSchema(schema2);
	var schemas = data.schemas();
	var definedProperties = schemas.definedProperties();
	this.assert(definedProperties.length == 5, "definedProperties.length == 5: " + JSON.stringify(definedProperties));

	data.addSchema(schema3);
	var schemas = data.schemas();
	var definedProperties = schemas.definedProperties();
	this.assert(definedProperties.length == 2, "definedProperties.length == 2: " + JSON.stringify(definedProperties));
	
	data.addSchema(schema4);
	var schemas = data.schemas();
	var definedProperties = schemas.definedProperties();
	this.assert(definedProperties.length == 1, "definedProperties.length == 1: " + JSON.stringify(definedProperties));
	
	return true;
});

tests.add("readOnlyCopy()", function () {
	var data = Jsonary.create({"key": "value"});
	var dataRO = data.readOnlyCopy();
	
	this.assert(data.readOnly() === false, "data.readOnly() must be false");
	this.assert(dataRO.readOnly() === true, "dataRO.readOnly() must be true");
	
	data.removeProperty("key");
	this.assert(data.property("key").defined() === false, "key should not be defined in data");
	this.assert(dataRO.property("key").defined() === true, "key should still be defined in dataRO");
	
	return true;
});

tests.add("editableCopy()", function () {
	var data = Jsonary.create({"key": "value"});
	var dataRO = data.readOnlyCopy();
	dataRW = dataRO.editableCopy();
	dataRWcopy = dataRW.editableCopy();
	
	this.assert(dataRO.readOnly() === true, "dataRO.readOnly() must be true");
	this.assert(dataRW.readOnly() === false, "dataRW.readOnly() must be false");
	this.assert(dataRWcopy.readOnly() === false, "dataRWcopy.readOnly() must be false");
	
	dataRW.removeProperty("key");
	this.assert(dataRO.property("key").defined() === true, "key should still be defined in dataRO");
	this.assert(dataRW.property("key").defined() === false, "key should not be defined in dataRW");
	this.assert(dataRWcopy.property("key").defined() === true, "key should still be defined in dataRWcopy");
	
	return true;
});

