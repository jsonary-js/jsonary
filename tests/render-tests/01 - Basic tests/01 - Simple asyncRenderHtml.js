tests.add("Jsonary.asyncRenderHtml read-only boolean", function() {
	var thisTest = this;
	// Simple read-only boolean
	var data = Jsonary.create(true, null, true);
	
	var expected = '<span class="jsonary"><span class="json-boolean-true">yes</span></span>';
	
	Jsonary.asyncRenderHtml(data, null, function (error, html) {
		thisTest.assert(error == null, 'No error');
		thisTest.assert(html === expected, "html should be expected");
		thisTest.pass();
	});
});