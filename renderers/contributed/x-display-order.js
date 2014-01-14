// Display-order extension
Jsonary.extendSchema({
	displayOrder: function () {
		return this.data.propertyValue("displayOrder");
	}
});
Jsonary.extendSchemaList({
	displayOrder: function () {
		var displayOrder = null;
		this.each(function (index, schema) {
			var value = schema.displayOrder();
			if (value != null && (displayOrder == null || value < displayOrder)) {
				displayOrder = value;
			}
		});
		return displayOrder;
	}
});

// hidden extension (non-standard keyword, suggested by Ognian)
Jsonary.extendSchema({
    hidden: function () {
        return !!this.data.propertyValue("hidden");
    }
});
Jsonary.extendSchemaList({
    hidden: function () {
        var hidden = false;
        this.each(function (index, schema) {
            hidden = hidden || schema.hidden();
        });
        return hidden;
    }
});

// Display/edit objects, using displayOrder for ordering
Jsonary.render.register({	
	renderHtml: function (data, context) {
		var uiState = context.uiState;
		var schemas = data.schemas();

		var keysList = [];
		var keysDisplayOrder = {};
		var guaranteedKeys = data.readOnly() ? [] : schemas.definedProperties();			
		data.properties(guaranteedKeys, function (key, subData) {
                if(!(subData.schemas().hidden() || schemas.propertySchemas(key).hidden())){
                    keysList.push(key);
        			keysDisplayOrder[key] = (subData.schemas().displayOrder() || schemas.propertySchemas(key).displayOrder());
                }
		}, true);
		keysList.sort(function (keyA, keyB) {
			if (keysDisplayOrder[keyA] == null) {
				if (keysDisplayOrder[keyB] == null) {
					return 0;
				}
				return 1;
			} else if (keysDisplayOrder[keyB] == null) {
				return -1;
			}
			return keysDisplayOrder[keyA] - keysDisplayOrder[keyB];
		});
		
		var result = "";
		result += '<fieldset class="json-object-outer">';
		var title = data.schemas().title();
		if (title) {
			result += '<legend class="json-object-title">' + Jsonary.escapeHtml(title) + '</legend>';
		}
		result += '<table class="json-object"><tbody>';
		var drawProperty = function (key, subData) {
            if(!subData.schemas().hidden()){
	    		result += '<tr class="json-object-pair">';
	    		if (subData.defined()) {
	    			var title = subData.schemas().title();
	    		} else {
	    			var title = subData.parent().schemas().propertySchemas(subData.parentKey()).title();
	    		}
	    		if (title == "") {
	    			result +=	'<td class="json-object-key"><div class="json-object-key-title">' + escapeHtml(key) + '</div></td>';
	    		} else {
	    			result +=	'<td class="json-object-key"><div class="json-object-key-title">' + escapeHtml(key) + '</div><div class="json-object-key-text">' + escapeHtml(title) + '</div></td>';
	    		}
	    		result += '<td class="json-object-value">' + context.renderHtml(subData) + '</td>';
	    		result += '</tr>';
            }
		}
		if (!data.readOnly()) {
			var maxProperties = schemas.maxProperties();
			var canAdd = (maxProperties == null || maxProperties > schemas.keys().length);
			data.properties(keysList, function (key, subData) {
				if (canAdd || subData.defined()) {
					drawProperty(key, subData);
				}
			}, drawProperty);
            // There are 2 callbacks the first one is called for the properties of the object defined in the schema or provided as the very first argumen
            // the second one is called for properties in the data NOT defined in the schema
            // so if we want to exclude a property only if it is defined as hidden in the schema we have to change the draw property function to try to see if this item is hidden and only if it is hidden to disable it otherwise it has to be displayed.

			if (canAdd && schemas.allowedAdditionalProperties()) {
				result += '<tr class="json-object-pair"><td class="json-object-key"><div class="json-object-key-text">';
				result += context.actionHtml('+ new', "add-new");
				result += '</div></td><td></td></tr>';
			}
		} else {
			data.properties(keysList, drawProperty);
		}
		result += '</tbody></table>';
		result += '</fieldset>';
		return result;
	},
	action: function (context, actionName, arg1) {
		var data = context.data;
		if (actionName == "add-named") {
			var key = arg1;
			data.schemas().createValueForProperty(key, function (newValue) {
				data.property(key).setValue(newValue);
			});
		} else if (actionName == "add-new") {
			var key = window.prompt("New key:", "key");
			if (key != null && !data.property(key).defined()) {
				data.schemas().createValueForProperty(key, function (newValue) {
					data.property(key).setValue(newValue);
				});
			}
		}
	},
	filter: function (data) {
		return data.basicType() == "object";
	}
});