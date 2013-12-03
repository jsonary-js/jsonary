tests.add("can specify baseUri", function () {
	var schema1 = Jsonary.createSchema({
		"type": "string",
		"default": ":)"
	});
	var createdData = schema1.createData(5, "http://example.com/");
	
	this.assert(createdData.resolveUrl('') == 'http://example.com/', "base URI matches");
	return true;
});

tests.add("take baseUri from data", function () {
	var data1 = Jsonary.create(":)", "http://example.com/");

	var schema1 = Jsonary.createSchema({
		"type": "string",
		"default": ":)"
	});
	var createdData = schema1.createData(data1);
	
	this.assert(createdData.value() === ":)", "value matches");
	this.assert(createdData.resolveUrl('') == 'http://example.com/', "base URI matches: " + createdData.resolveUrl(''));
	return true;
});


tests.add("submission data has baseUri", function () {
	var data1 = Jsonary.create(":)", "http://example.com/");
	data1.addLink({
		rel: 'test',
		href: 'blah',
		schema: {
			type: 'string',
			links: [{
				rel: 'self',
				href: 'foo/bar'
			}]
		}
	});

	var createdData = data1.getLink('test').createSubmissionData();
	
	this.assert(createdData.resolveUrl('') == 'http://example.com/foo/bar', "base URI matches: " + createdData.resolveUrl(''));
	return true;
});