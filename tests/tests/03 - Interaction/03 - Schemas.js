tests.add("links()", function () {
	var schema = Jsonary.createSchema({
		links: [
			{href:"http://example.com/link-rel1", rel:"rel1"},
			{href:"http://example.com/link-rel2", rel:"rel2"}
		]
	});
	
	this.assert(schema.links().length == 2, "schema.links().length == 2");

	var link = schema.getLink("rel1");
	this.assert(link.href = "http://example.com/link-rel1", "link.href");
	
	return true;
});
