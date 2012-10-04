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
