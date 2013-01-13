tests.add("Recursive dependency check", function () {
	var data = Jsonary.create({
		properties: {
			arbitrary: {
				dependencyKey: true
			}
		}
	}, null, true);
	var schema = Jsonary.createSchema({
		properties: {
			"properties": {
				additionalProperties: {"$ref": "#"}
			}
		},
		dependencies: {
			"dependencyKey": {"title": "Dependency"}
		}
	});
	data.addSchema(schema);
	
	this.assert(data.schemas().length == 1, "data.schemas().length == 1, was " + data.schemas().length);
	var innerSchemas = data.property("properties").property("arbitrary").schemas();
	this.assert(innerSchemas.length == 2, "innerSchemas.length == 2, was " + innerSchemas.length);
	
	return true;
});
