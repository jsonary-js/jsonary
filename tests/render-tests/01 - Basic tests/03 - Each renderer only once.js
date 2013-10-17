tests.add("Each renderer only once", function() {
	var thisTest = this;
	var value = "foo bar baz";
	var data = Jsonary.create(value, null, true);
	
	var calledCount = 0;

	var renderer = Jsonary.render.register({
		component: Jsonary.render.Components.LIST_LINKS,
		renderHtml: function (data, context) {
			calledCount++;
			if (calledCount == 1) {
				return context.withComponent('LIST_LINKS').renderHtml(data);
			} else {
				thisTest.fail("Called back recursively");
				return ":(";
			}
			return Jsonary.escapeHtml(data.value().toUpperCase());
		},
		filter: {
			type: 'string',
			filter: function (d) {
				return d === data;
			}
		}
	});
	
	Jsonary.asyncRenderHtml(data, null, function (error, html) {
		Jsonary.render.deregister(renderer);
		thisTest.assert(calledCount === 1, 'calledCount === 1');
		thisTest.pass();
	});
});

tests.add("Same renderer is used with children", function() {
	var thisTest = this;
	var value = {"foo": "bar"};
	var data = Jsonary.create(value, null, true);
	
	var calledCount = 0;

	var renderer = Jsonary.render.register({
		component: Jsonary.render.Components.LIST_LINKS,
		renderHtml: function (data, context) {
			calledCount++;
			if (calledCount <= 2) {
				return context.withComponent('LIST_LINKS').renderHtml(data);
			} else {
				thisTest.fail("Called back recursively");
				return ":(";
			}
			return Jsonary.escapeHtml(data.value().toUpperCase());
		},
		filter: {
			filter: function (d) {
				return d === data || d === data.property('foo');
			}
		}
	});
	
	Jsonary.asyncRenderHtml(data, null, function (error, html) {
		Jsonary.render.deregister(renderer);
		thisTest.assert(calledCount === 2, 'calledCount === 2');
		thisTest.pass();
	});
});