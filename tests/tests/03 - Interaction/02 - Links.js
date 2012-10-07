tests.add("asLink()", function () {
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example"
	}, "http://example.com/data");
	var link = data.asLink();
	
	this.assert(link.href == "http://example.com/linkTarget", "link href incorrect: " + link.href);
	this.assert(link.hrefFragment == "", "href fragment should be empty");
	this.assert(link.rel == "example", "link rel incorrect: " + link.rel);
	
	return true;
});

tests.add("submissionSchema()", function () {
	var thisTest = this;
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example",
		"schema": {
			"type": "integer",
			"default": 1
		}
	}, "http://example.com/data");
	var link = data.asLink();

	var submissionSchemas = link.submissionSchemas;
	this.assert(submissionSchemas.length == 1, "submissionSchemas.length == 1");
	
	link.createSubmissionData(function(submissionData) {
		var schemas = submissionData.schemas();
		thisTest.assert(schemas.length == 1, "submissionData.schemas().length == 1");
		thisTest.assert(submissionData.value() == 1, "submissionData.value() == 1");
		thisTest.pass();
	});
	
	setTimeout(function() {
		thisTest.fail("timeout");
	}, 50);
});

tests.add("submissionSchema() with remote schema", function () {
	var thisTest = this;
	Jsonary.addToCache("http://example.com/schema", {
		"title": "Remote schema"
	});
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example",
		"schema": {
			"type": "integer",
			"default": 1,
			"extends": {"$ref": "http://example.com/schema"}
		}
	}, "http://example.com/data");
	var link = data.asLink();

	var submissionSchemas = link.submissionSchemas;
	this.assert(submissionSchemas.length == 1, "submissionSchemas.length == 1");
	
	link.createSubmissionData(function(submissionData) {
		var schemas = submissionData.schemas();
		thisTest.assert(schemas.length == 2, "submissionData.schemas().length == 2");
		thisTest.assert(submissionData.value() == 1, "submissionData.value() == 1");
		thisTest.pass();
	});
	
	setTimeout(function() {
		thisTest.fail("timeout");
	}, 10);
});

tests.add("Jsonary.addLinkHandler()", function () {
	var thisTest = this;
	var submissionData = Jsonary.create({"testKey": "value"});	
	Jsonary.addLinkHandler(function(argLink, argData, argRequest) {
		thisTest.assert(this == link, "this == link");
		thisTest.assert(argLink == link, "argLink == link");
		thisTest.assert(argData.equals(submissionData), "argData.equals(submissionData)");
		thisTest.assert(argRequest != undefined, "argRequest defined");
		thisTest.pass();
	});
	setTimeout(function() {
		thisTest.fail("timeout");
	}, 200);
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example",
		"schema": {
			"type": "integer",
			"default": 1
		}
	}, "http://example.com/data");
	var link = data.asLink();
	
	link.follow(submissionData);	
});

tests.add("Jsonary.addLinkPreHandler()", function () {
	var thisTest = this;
	var submissionData = Jsonary.create({"testKey": "value"});	
	Jsonary.addLinkPreHandler(function(argLink, argData) {
		thisTest.assert(this == link, "this == link");
		thisTest.assert(argLink == link, "argLink == link");
		thisTest.assert(argData == submissionData, "argData == submissionData");
		thisTest.pass();
	});
	setTimeout(function() {
		thisTest.fail("timeout");
	}, 200);
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example",
		"schema": {
			"type": "integer",
			"default": 1
		}
	}, "http://example.com/data");
	var link = data.asLink();
	
	link.follow(submissionData);	
});

tests.add("link.definition.addHandler()", function () {
	var thisTest = this;
	var submissionData = Jsonary.create({"testKey": "value"});	
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example",
		"schema": {
			"type": "integer",
			"default": 1
		}
	}, "http://example.com/data");
	var link = data.asLink();
	
	link.definition.addHandler(function(argLink, argData, argRequest) {
		thisTest.assert(this == link, "this == link");
		thisTest.assert(argLink == link, "argLink == link");
		thisTest.assert(argData.equals(submissionData), "argData.equals(submissionData)");
		thisTest.pass();
	});

	link.follow(submissionData);	

	setTimeout(function() {
		thisTest.fail("timeout");
	}, 200);
});

tests.add("link.follow(submissionData, handler)", function () {
	var thisTest = this;
	var submissionData = Jsonary.create({"testKey": "value"});	
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example",
		"schema": {
			"type": "integer",
			"default": 1
		}
	}, "http://example.com/data");
	var link = data.asLink();
	
	var handler = function(argLink, argData, argRequest) {
		thisTest.assert(this == link, "this == link");
		thisTest.assert(argLink == link, "argLink == link");
		thisTest.assert(argData.equals(submissionData), "argData.equals(submissionData)");
		thisTest.pass();
	};

	link.follow(submissionData, handler);	

	setTimeout(function() {
		thisTest.fail("timeout");
	}, 200);
});

tests.add("link.follow(handler)", function () {
	var thisTest = this;
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example",
		"schema": {
			"type": "integer",
			"default": 1
		}
	}, "http://example.com/data");
	var link = data.asLink();
	
	var handler = function(argLink, argData, argRequest) {
		thisTest.assert(this == link, "this == link");
		thisTest.assert(argLink == link, "argLink == link");
		thisTest.assert(argData.value() == undefined, "argData == undefined");
		thisTest.pass();
	};

	link.follow(handler);	

	setTimeout(function() {
		thisTest.fail("timeout");
	}, 200);
});

tests.add("link.definition.addHandler() multiple", function () {
	var thisTest = this;
	var submissionData = Jsonary.create({"testKey": "value"});	
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example",
		"schema": {
			"type": "integer",
			"default": 1
		}
	}, "http://example.com/data");
	var link = data.asLink();
	
	var counter = 0;
	link.definition.addHandler(function(argLink, argRequest, argData) {
		counter++;
		thisTest.fail();
	});
	link.definition.addHandler(function(argLink, argRequest, argData) {
		counter++;
		return false;
	});
	link.definition.addHandler(function(argLink, argRequest, argData) {
		counter++;
		return true;
	});

	link.follow();
	
	this.assert(counter == 2, "Two callbacks should have happened, not " + counter);
	
	return true;
});

tests.add("link.definition.addPreHandler()", function () {
	var thisTest = this;
	var submissionData = Jsonary.create({"testKey": "value"});	
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example",
		"schema": {
			"type": "integer",
			"default": 1
		}
	}, "http://example.com/data");
	var link = data.asLink();
	
	link.definition.addPreHandler(function(argLink, argData) {
		thisTest.assert(this == link, "this == link");
		thisTest.assert(argLink == link, "argLink == link");
		thisTest.assert(argData == submissionData, "argData == submissionData");
		thisTest.pass();
	});

	link.follow(submissionData);	

	setTimeout(function() {
		thisTest.fail("timeout");
	}, 200);
});

tests.add("link.definition.addPreHandler() multiple", function () {
	var thisTest = this;
	var submissionData = Jsonary.create({"testKey": "value"});	
	var data = Jsonary.create({
		"href": "linkTarget",
		"rel": "example",
		"schema": {
			"type": "integer",
			"default": 1
		}
	}, "http://example.com/data");
	var link = data.asLink();
	
	var counter = 0;
	link.definition.addPreHandler(function(argLink, argRequest, argData) {
		counter++;
		return true;
	});
	link.definition.addPreHandler(function(argLink, argRequest, argData) {
		counter++;
		return false;
	});
	link.definition.addPreHandler(function(argLink, argRequest, argData) {
		counter++;
		thisTest.fail("This handler should never be called");
	});

	link.follow();

	this.assert(counter == 2, "Two callbacks should have happened, not " + counter);
	
	return true;
});

tests.add("fetching schema", function() {
	var thisTest = this;
	var exampleSchemaData = {
		"title": "Test schema",
		"links": [
			{
				"href": "http://example.com/test",
				"rel": "test"
			}
		]
	};
	Jsonary.addToCache("http://example.com/schema", exampleSchemaData);
	
	var data = Jsonary.create("test data");
	var data2 = Jsonary.create("test data 2");
	data.addSchema("http://example.com/schema");
	data2.addSchema("http://example.com/schema");
	
	this.assert(data.schemas().length == 1, "data.schemas().length == 1, not: " + data.schemas().length);
	this.assert(data2.schemas().length == 1, "data2.schemas().length == 1");
	var foundSchema = data.schemas()[0];
	var foundSchema2 = data2.schemas()[0];
	
	this.assert(foundSchema === foundSchema2, "found schemas should be identical (only one schema object per reference URL)");

	var gotSchema;
	Jsonary.getSchema("http://example.com/schema", function(schema, request) {
		gotSchema = schema;
		thisTest.assert(foundSchema === gotSchema, "found schema should be identical to getSchema() result");
		thisTest.pass();
	});

	setTimeout(function() {
		thisTest.fail("timeout");
	}, 50);
});

