Jsonary.render.register({
	name: "JSON-style booleans",
	renderHtml: function (data, context) {
		if (data.readOnly()) {
			if (data.value()) {
				return '<span class="json-boolean-true">true</span>';
			} else {
				return '<span class="json-boolean-false">false</span>';
			}
		}
		if (data.value()) {
			return context.actionHtml('<span class="json-boolean-true">true</span>', "switch", false);
		} else {
			return context.actionHtml('<span class="json-boolean-false">false</span>', "switch", true);
		}
	},
	action: function (context, actionName, arg1) {
		if (actionName == "switch") {
			context.data.setValue(!!arg1);
		}
	},
	filter: function (data) {
		return data.basicType() == "boolean";
	}
});

Jsonary.render.register({
	name: "JSON-style strings",
	renderHtml: function (data, context) {
		return '<span class="json-string">' + Jsonary.escapeHtml(JSON.stringify(data.value())) + '</span>';
	},
	filter: function (data) {
		return data.basicType() == "string" && data.readOnly();
	}
});

Jsonary.render.register({
	name: "JSON-style arrays",
	renderHtml: function (data, context) {
		var result = '[';
		if (data.length()) {
			result += '<div style="padding-left: 2em">';
			data.items(function (index, subData) {
				if (index > 0) {
					result += ',<br>';
				}
				result += context.renderHtml(subData);
			});
			result += '</div>';
		}
		return result + ']';
	},
	filter: function (data) {
		return data.basicType() == "array" && data.readOnly();
	}
});

Jsonary.render.register({
	name: "JSON-style objects",
	renderHtml: function (data, context) {
		var result = '{';
		if (data.keys().length || !data.readOnly()) {
			result += '<table style="margin-left: 2em">';
			var first = true;
			data.properties(data.schemas().knownProperties(), function (key, subData) {
				if (data.readOnly()) {
					if (!subData.defined()) {
						return;
					}
					if (!first) {
						result += ',';
					}
				}
				if (!first && data.readOnly()) {
					result += '</td></tr>';
				}
				first = false;
				result += '<tr><td>'
				result += '<span style="color: #666; font-style: italic">' + Jsonary.escapeHtml(JSON.stringify(key)) + '</span>: ';
				result += '</td><td>';
				result += context.renderHtml(subData);
			}, true);
			if (!data.readOnly() && data.schemas().allowedAdditionalProperties()) {
				if (!first) {
					result += '</td></tr>';
				}
				first = false;
				result += '<tr><td>';
				if (context.uiState.newEdit) {
					result += context.actionHtml('(cancel)', 'new-cancel');
					result += '</td><td>';
					result += '<input type="text" value="' + Jsonary.escapeHtml(context.uiState.newEditValue) + '" name="' + context.inputNameForAction('new-update') + '"></input>';
					result += context.actionHtml('<span class="button">add</span>', 'new-confirm');
				} else {
					result += context.actionHtml('+ new', 'new-edit');
					result += '</td><td>';
				}
			}
			if (!first) {
				result += '</td></tr>';
			}
			result += '</table>';
		}
		return result + '}';
	},
	action: function (context, actionName, arg1) {
		if (actionName == "new-edit") {
			context.uiState.newEdit = true;
			context.uiState.newEditValue = "key";
		} else if (actionName == "new-update") {
			context.uiState.newEditValue = arg1;
			return false;
		} else if (actionName == "new-cancel") {
			delete context.uiState.newEdit;
			delete context.uiState.newEditValue;
		} else if (actionName == "new-confirm") {
			var data = context.data;
			var key = context.uiState.newEditValue;
			if (!data.property(key).defined()) {
				data.schemas().propertySchemas(key).createValue(function (newValue) {
					data.property(key).setValue(newValue);
				});
				delete context.uiState.newEdit;
				delete context.uiState.newEditValue;
			}
		}
		return true;
	},
	filter: function (data) {
		return data.basicType() == "object";
	}
});

Jsonary.render.register({
	component: Jsonary.render.Components.LIST_LINKS,
	renderHtml: function (data, context) {
		var fullLink = data.getLink('full');
		return context.actionHtml(Jsonary.escapeHtml(data.json()), true, fullLink.href, 'follow');
	},
	action: function (context, actionName) {
		if (actionName == "follow") {
			var fullLink = context.data.getLink('full');
			if (fullLink) {
				fullLink.follow();
			}
		}
	},
	filter: function (data) {
		return data.readOnly() && data.getLink('full');
	}
});