Jsonary.render.register({
	renderHtml: function (data, context) {
		var result = '<div class="site">';
		// Render certain properties with class "site-????"
		data.properties(['title', 'topContent'], function (key, subData) {
			result += '<div class="site-' + Jsonary.escapeHtml(key) + '">';
			result += context.renderHtml(subData);
			result += '</div>';
		});
		// Render other properties with class "site-section site-section-????"
		data.properties(data.schemas().knownProperties(['title', 'topContent']), function (key, subData) {
			result += '<div class="site-section site-section-' + Jsonary.escapeHtml(key) + '">';
			result += context.renderHtml(subData);
			result += '</div>';
		});
		return result + '</div>';
	},
	filter: {
		filter: function (data, schemas) {
			return schemas.containsUrl('/json/schemas/site');
		}
	}
});