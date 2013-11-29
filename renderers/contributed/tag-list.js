Jsonary.render.register({
	renderHtml: function (data, context) {
		var enums = data.schemas().enumDataList();
		var result = '<div class="json-tag-list">';
		result += '<div class="json-tag-list-current">';
		data.items(function (index, item) {
			result += '<span class="json-tag-list-entry">';
			if (!data.readOnly()) {
				result += '<span class="json-array-delete-container">';
				result += context.actionHtml('<span class="json-array-delete">X</span>', 'remove', index);
				result += context.renderHtml(item.readOnlyCopy(), 'current' + index) + '</span>';
				result += '</span>';
			} else {
				result += context.renderHtml(item.readOnlyCopy(), 'current' + index) + '</span>';
			}
		});
		result += '</div>';
		if (!data.readOnly()) {
			result += '<div class="json-tag-list-add">';
			result += context.actionHtml('<span class="button">add</span>', 'add');
			if (!context.uiState.addData) {
				var undefinedItem = data.item(data.length());
				var itemSchema = undefinedItem.schemas(true);
				context.uiState.addData = itemSchema.createData(undefinedItem, true);
			}
			result += context.withoutComponent('LIST_LINKS').renderHtml(context.uiState.addData, 'add');
			result += '</div>';
		}
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