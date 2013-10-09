Jsonary.render.Components.add('EXCITEMENT', false);
Jsonary.render.register({
	component: Jsonary.render.Components.EXCITEMENT,
	renderHtml: function (data, context) {
		return "!" + context.renderHtml(data) + "!";
	}
});

Jsonary.render.register({
	renderHtml: function (data, context) {
		var result = '<div class="site">';
		// Render certain properties with class "site-????"
		data.properties(['title', 'topContent'], function (key, subData) {
			result += '<div class="site-' + Jsonary.escapeHtml(key) + '">';
			result += context.renderHtml(subData);
			result += '</div>';
		});
		// Render other documented properties with class "site-section site-section-????"
		data.properties(data.schemas().knownProperties(['title', 'topContent']), function (key, subData) {
			if (subData.defined() || !subData.readOnly()) {
				result += '<div class="site-section site-section-' + Jsonary.escapeHtml(key) + '">';
				result += context.renderHtml(subData);
				result += '</div>';
			}
		});
		return result + '</div>';
	},
	filter: {
		schema: '/json/schemas/site'
	}
});

Jsonary.plugins.FancyTableRenderer()
	.addColumn('/title', null)
	.addColumn('/tabs', null, function (data, context) {
		return '<td>' + context.withComponent('EXCITEMENT').withoutComponent('LIST_LINKS').renderHtml(data) + '</td>';
	})
	.register(function (data, schemas) {
		return data.basicType() == 'array';
	});
	
Jsonary.render.register({
	component: 'WHOLE_PAGE',
	renderHtml: function (data, context) {
		console.log(context.missingComponents);
		var title = "Page title";
		var result = '<h1>' + Jsonary.escapeHtml(title) + '</h1>';
		result += '<hr>';
		return result + context.renderHtml(data);
	}
});
