(function (Jsonary) {
	Jsonary.render.register({
		renderHtml: function (data, context) {
			return "function";
		},
		action: function (context, actionName, tabKey) {
			if (actionName == "select-tab") {
				context.uiState.currentTab = tabKey;
			} else if (actionName == "expand") {
				context.uiState.expanded = true;
			} else {
				context.uiState.expanded = false;
			}
			return true;
		},
		filter: function (data, schemas) {
			return schemas.containsUrl('api-schema.json#/functionDefinition');
		},
		update: function (element, data, context, operation) {
			window.operation = operation;
			if (operation.hasPrefix(data.property("type").pointerPath())) {
				return true;
			}
			return this.defaultUpdate(element, data, context, operation);
		}
	});
})(Jsonary);
