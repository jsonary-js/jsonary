tests.add("Fragment inline addressing for schema", function () {
	var schema = Jsonary.createSchema({
		"title": "Example schema",
		"type": "array",
		"items": {"$ref": "#arrayItems"},
		"definitions": {
			"subSchema": {
				"id": "#arrayItems",
				"type": "boolean"
			}
		}
	});
	
	var data = Jsonary.create([true, false, true]).addSchema(schema);
	var subData = data.item(0);
	var basicTypes = subData.schemas().types();
	
	this.assert(basicTypes.length == 1 && basicTypes[0] == "boolean", "basicTypes should be [boolean], not " + JSON.stringify(basicTypes));
	
	return true;
});