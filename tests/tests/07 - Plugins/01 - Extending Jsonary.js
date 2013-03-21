tests.add("Adding nothing", function () {
	Jsonary.extend({});
	return true;
});

tests.add("Adding function to main object", function () {
	Jsonary.extend({
		extendingJsonaryTest1: function() {return "test string"}
	});
	return Jsonary.extendingJsonaryTest1() == "test string";
});

tests.add("Adding function to data objects", function () {
	var data = Jsonary.create("test");
	Jsonary.extendData({
		annotatedValue: function() {
			return this.value() + " (" + this.basicType() + ")";
		}
	});
	return data.annotatedValue() == "test (string)";
});

tests.add("Adding function to schema objects", function () {
	var schema = Jsonary.createSchema({"title": "Test Schema"});
	Jsonary.extendSchema({
		annotatedTitle: function() {
			return this.title() + " (schema)";
		}
	});
	return schema.annotatedTitle() == "Test Schema (schema)";
});


tests.add("Adding function to schema-set objects", function () {
	var schemas = Jsonary.createSchemaList([
		Jsonary.createSchema({"title": "Title 1"}),
		Jsonary.createSchema({"title": "Title 2"})
	]);
	Jsonary.extendSchemaList({
		combinedTitle: function() {
			var titles = [];
			this.each(function (index, schema) {
				if (schema.title()) {
					titles.push(schema.title());
				}
			});
			return titles.join(",");
		}
	});
	this.assert(schemas.combinedTitle() == "Title 1,Title 2", "value not correct: " + schemas.combinedTitle());
	return true;
});
