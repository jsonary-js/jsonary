Jsonary.render.register({
	renderHtml: function (data, context) {
		var enums = data.schemas().enumDataList();
		var result = '<div class="json-tag-list">';
		result += '<div class="json-tag-list-current">';
		data.items(function (index, item) {
			result += '<span class="json-tag-list-entry">';
			result += '<span class="json-array-delete-container">';
			result += context.actionHtml('<span class="json-array-delete">X</span>', 'remove', index);
			result += '</span>';
			result += context.renderHtml(item.readOnlyCopy(), 'current' + index) + '</span>';
		});
		result += '</div>';
		result += '<div class="json-tag-list-add">';
		result += context.actionHtml('<span class="button">add</span>', 'add');
		if (!context.uiState.addData) {
			var itemSchema = data.item(data.length()).schemas(true);
			context.uiState.addData = itemSchema.createData();
		}
		result += context.renderHtml(context.uiState.addData);
		result += '</div>';
		return result + '</div>';
	},
	action: {
		add: function (data, context) {
			var addData = context.uiState.addData;
			if (data.schemas().uniqueItems()) {
				for (var i = 0; i < data.length(); i++) {
					if (data.item(i).equals(addData)) {
						return false;
					}
				}
			}
			data.item(data.length()).setValue(addData.value());
		},
		remove: function (data, context, index) {
			data.item(index).remove();
		}
	},
	filter: {
		type: 'array',
		filter: function (data, schemas) {
			return schemas.unordered();
		}
	}
});