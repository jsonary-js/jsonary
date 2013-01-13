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

tests.add("Recursive dependency check 2", function () {
	var data = Jsonary.create({
	   "properties":{
	      "createSchema":{
		  "arguments":true
	      }
	   }
	}, null, true);
	var schema = Jsonary.createSchema({
		"title": "API documentation",
		"properties": {
			"properties": {
				"title": "Object properties",
				"additionalProperties": {"$ref": "#"}
			}
		},
		"dependencies": {
			"arguments": {"title": "Dependency schema"}
		}
	});
	data.addSchema(schema);
	
	this.assert(data.schemas().length == 1, "data.schemas().length == 1, was " + data.schemas().length);
	var innerSchemas = data.property("properties").property("createSchema").schemas();
	this.assert(innerSchemas.length == 2, "innerSchemas.length == 2, was " + innerSchemas.length);
	
	return true;
});
