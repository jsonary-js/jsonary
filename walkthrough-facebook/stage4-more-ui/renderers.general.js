Jsonary.render.register({
	renderHtml: function (data, context) {
		var result = '<div class="facebook-array">';
		data.property("data").items(function (index, subData) {
			result += '<div class="facebook-array-item">' + context.renderHtml(subData) + '</div>';
		});
		var nextLink = data.property("paging").links('next')[0];
		if (nextLink != null) {
			if (!context.uiState.showNext) {
				var link = '<div class="facebook-array-next">view more</div>';
				result += context.actionHtml(link, "next");
			} else {
				nextLink.follow(function (link, submissionData, request) {
					result += context.renderHtml(request);
					return false;
				});
			}
		}
		result += '</div>';
		return result;
	},
	action: function (context, actionName) {
		if (actionName == "next") {
			context.uiState.showNext = true;
			return true;
		}
	},
	filter: function (data, schemas) {
		return schemas.containsUrl("array.php") && data.readOnly();
	}
});