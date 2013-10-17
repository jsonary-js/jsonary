tests.add("Link handler called", function() {
	var thisTest = this;
	// Simple read-only boolean
	var data = Jsonary.create(true, null, true);
	var linkRel = "whatever" + Math.random();
	data.addLink({href: "wherever", rel: linkRel});
	
	var savedContext = null;
	var actionCalled = false;
	var handlerCalled = false;
	
	var renderer = Jsonary.render.register({
		name: "Test renderer",
		renderHtml: function (data, context) {
			savedContext = context;
			return ":)";
		},
		action: {
			"follow-link": function (data, context, param1) {
				actionCalled = true;
				thisTest.assert(Jsonary.isData(data));
				thisTest.assert(param1 === "test", "param1 === test");
				var link = data.getLink(linkRel);
				link.follow();
			}
		},
		linkHandler: function (data, context, link, submissionData, request) {
			thisTest.assert(this === renderer, "this === renderer");
			thisTest.assert(Jsonary.isData(data), "data is data");
			handlerCalled = true;
		},
		filter: function (d) {
			return d === data;
		}
	});
	
	Jsonary.asyncRenderHtml(data, null, function (error, html) {
		thisTest.assert(savedContext, "savedContext not empty");
		savedContext.action('follow-link', 'test');
		thisTest.assert(actionCalled, "action called");
		thisTest.assert(handlerCalled, "handler called");
		thisTest.pass();
	});
});