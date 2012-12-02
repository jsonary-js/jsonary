Jsonary.render.register({
	renderHtml: function (data, context) {
		// Render header
		var result = '<div class="facebook-user">';
		var pictureLink = data.links("picture")[0];
		result += '<img class="facebook-user-picture" src="' + pictureLink.href + '">';
		result += '<div class="facebook-user-name">' + context.renderHtml(data.property("name")) + '</div>';
		result += '<div class="facebook-user-update-time">last updated ' + context.renderHtml(data.property("updated_time")) + '</div>';
		return result;
	},
	filter: function (data, schemas, uiState) {
		return schemas.containsUrl("user.json");
	}
});

