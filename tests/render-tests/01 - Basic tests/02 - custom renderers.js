tests.add("Custom renderer (for specific value)", function() {
	var thisTest = this;
	// Simple read-only boolean
	var value = "foo bar baz";
	var data = Jsonary.create(value, null, true);

	Jsonary.render.register({
		renderHtml: function (data, context) {
			return Jsonary.escapeHtml(data.value().toUpperCase());
		},
		filter: {
			type: 'string',
			filter: function (data, schemas) {
				return data.value() === value;
			}
		}
	});
	
	var expectedContains = "FOO BAR BAZ";
	
	Jsonary.asyncRenderHtml(data, null, function (error, html) {
		thisTest.assert(error == null, 'No error');
		thisTest.assert(html.indexOf(expectedContains) !== -1, "Contains expected string");
		thisTest.pass();
	});
});