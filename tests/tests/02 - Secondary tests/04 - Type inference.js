var exampleData = {
	"important_key": {
		"inner_key": "B"
	}
};

var exampleTypeA = {
	"title": "Schema A",
	"type": "object",
	"properties": {
		"important_key": {
			"type": "object",
			"required": ["inner_key"],
			"properties": {
				"inner_key": {"enum": ["A"]}
			}
		}
	}
}

var exampleTypeB = {
	"title": "Schema B",
	"type": "object",
	"properties": {
		"important_key": {
			"type": "object",
			"required": ["inner_key"],
			"properties": {
				"inner_key": {"enum": ["B"]}
			}
		}
	}
}

var exampleSchema = {
	"type": [
		exampleTypeA,
		exampleTypeB,
		"string"
	]
};

tests.add("schemas.containsUrl()", function () {
	var thisTest = this;
	var data = Jsonary.create(exampleData);
	var schema = Jsonary.createSchema(exampleSchema, "http://example.com/test-schema");
	var callbackCount = 0;
	var schemas = [];

	schemas = data.schemas();
	this.assert(!schemas.containsUrl("http://example.com/test-schema"), "Schemas must not contain the test schema initially");
	data.addSchema(schema);
	schemas = data.schemas();
	this.assert(schemas.containsUrl("http://example.com/test-schema"), "Schemas must contain the test schema");

	return true;
});

function searchForTitleInSchemaList(title, schemaList) {
	for (var i = 0; i < schemaList.length; i++) {
		var schema = schemaList[i];
		var schemaTitle = schema.title();
		if (schemaTitle == title) {
			return true;
		}
	}
	return false;
}

tests.add("Inferring correct type (v3-style)", function () {
	var thisTest = this;
	var data = Jsonary.create(exampleData);
	var schema = Jsonary.createSchema(exampleSchema, "http://example.com/test-schema");
	var callbackCount = 0;
	var schemas = [];

	var schemaKey = Jsonary.getMonitorKey();
	data.addSchema(schema);
	schemas = data.schemas();
	this.assert(searchForTitleInSchemaList(exampleTypeB.title, schemas), "\"Schema B\" must be in list");

	return true;
});

tests.add("Switching type", function () {
	var thisTest = this;
	var data = Jsonary.create(exampleData);
	var schema = Jsonary.createSchema(exampleSchema, "http://example.com/test-schema");
	var callbackCount = 0;
	var schemas = [];

	var schemaKey = Jsonary.getMonitorKey();
	data.addSchema(schema);
	schemas = data.schemas();
	this.assert(searchForTitleInSchemaList(exampleTypeB.title, schemas), "Schema \"B\" must be in list");
	this.assert(!searchForTitleInSchemaList(exampleTypeA.title, schemas), "Schema \"A\" must not be in the list initially");

	data.property("important_key").property("inner_key").setValue("A");
	schemas = data.schemas();
	this.assert(!searchForTitleInSchemaList(exampleTypeB.title, schemas), "Schema \"B\" must no longer be in list");
	this.assert(searchForTitleInSchemaList(exampleTypeA.title, schemas), "Schema \"A\" must be in list");

	data.property("important_key").property("inner_key").setValue("B");
	schemas = data.schemas();
	this.assert(searchForTitleInSchemaList(exampleTypeB.title, schemas), "Schema \"B\" must be in list again");
	this.assert(!searchForTitleInSchemaList(exampleTypeA.title, schemas), "Schema \"A\" must no longer be in list");

	data.setValue("String value");
	schemas = data.schemas();
	this.assert(!searchForTitleInSchemaList(exampleTypeB.title, schemas), "Schema \"B\" must not be in the list after replacing with string");
	this.assert(!searchForTitleInSchemaList(exampleTypeA.title, schemas), "Schema \"A\" must not be in the list after replacing with string");

	data.setValue(exampleData);
	schemas = data.schemas();
	this.assert(searchForTitleInSchemaList(exampleTypeB.title, schemas), "Schema \"B\" must be in list after replacing value with example data");
	this.assert(!searchForTitleInSchemaList(exampleTypeA.title, schemas), "Schema \"A\" must not be in list after replacing value with example data");

	return true;
});
