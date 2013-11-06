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

Jsonary.render.register({
	component: 'WHOLE_PAGE',
	renderHtml: function (data, context) {
		var title = "Page title";
		var result = '<h1>' + Jsonary.escapeHtml(title) + '</h1>';
		result += '<hr>';
		var page = data;
		data.property('sections').items(function (index, subData) {
			if (subData.get('/tabs') == context.uiState.viewPage) {
				page = subData.property('tabs').getLink('full').href;
			}
		});
		return result + context.renderHtml(page, 'page');
	},
	linkHandler: function (data, context, link, submissionData, request) {
		var found = null;
		data.property('sections').items(function (index, subData) {
			if (subData.property('tabs').getLink('full') == link) {
				found = subData.get('/tabs');
			}
		});
		if (found) {
			context.uiState.viewPage = found;
			context.rerender();
			return false;
		}
	}
});
