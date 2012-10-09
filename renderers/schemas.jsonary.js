(function ($) {
	$.renderJson.register({
		render: function (query, data) {
			var schema = data.asSchema();
			var container = $('<div class="schema" />').appendTo(query);		
			$('<div class="schema-title" />').renderJson(data.property("title")).appendTo(container);
			
			$('<div class="schema-section-title">Properties:</div>').appendTo(container);
			var propertiesSection = $('<div class="schema-section" />');
			var propertyList = schema.definedProperties();
			var requiredList = schema.requiredProperties();
			$.each(propertyList, function (index, key) {
				var propertyBox = $('<div class="schema-property" />').appendTo(propertiesSection);
				if (!data.readOnly()) {
					$('<span class="schema-property-delete">[X Delete]</span>').appendTo(propertyBox).click(function () {
						var index = requiredList.indexOf(key);
						if (index > -1) {
							data.property("required").removeIndex(index);
						}
						data.property("properties").property(key).remove();
					});
				}
				$('<div class="schema-property-name"></div>').text(key).appendTo(propertyBox).append();
				var required = requiredList.indexOf(key) > -1;
				var requiredBlock = $('<div class="schema-property-required"></div>').appendTo(propertyBox);
				requiredBlock.html("required: " + (required ? '<span class="json-boolean-true">true</span>' : '<span class="json-boolean-false">false</span>'));
				if (!data.readOnly()) {
					requiredBlock.click(function () {
						if (required) {
							var index = requiredList.indexOf(key);
							data.property("required").removeIndex(index);
						} else {
							if (data.property("required").basicType() == "array") {
								data.property("required").push(key);
							} else {
								data.property("required").setValue([key]);
							}
						}
					});
				}
				$('<div class="schema-property-schema">Schema</div>').renderJson(data.property("properties").property(key)).appendTo(propertyBox);
			});
			if (!data.readOnly()) {
				$('<span class="schema-property-add">[+ Add]</span>').appendTo(propertiesSection).click(function () {
					var key = window.prompt("Property name:");
					if (!data.property("properties").property(key).defined()) {
						data.property("properties").property(key).setValue({"title": key.charAt(0).toUpperCase() + key.substring(1)});
					}
				});
			}
			propertiesSection.appendTo(container);
			
			$('<div class="schema-section-title">Default property schema:</div>').appendTo(container);
			var additionalPropertiesSection = $('<div class="schema-section" />');
			var additionalProperties = data.property("additionalProperties");
			if (additionalProperties.value() == "false") {
				var q = $('<div class="schema-additionalProperties-allow">Not allowed</div>');
				if (!data.readOnly()) {
					q.click(function () {
						additionalProperties.remove();
					});
				}
			} else {
				var q = $('<div class="schema-additionalProperties-allow">Allowed</div>');
				if (!data.readOnly()) {
					q.click(function () {
						additionalProperties.setValue(false);
					});
				}
				$('<div />').renderJson(additionalProperties).appendTo(additionalPropertiesSection);
			}
			additionalPropertiesSection.appendTo(container);
		},
		filter: function (data, schemas) {
			return schemas.containsUrl("http://json-schema.org/hyper-schema");
		},
		update: function (query, data, operation) {
			if (operation.depthFrom(data.pointerPath()) <= 2) {
				this.render(query, data);
			}
		}
	});
	
	Jsonary.addToCache("http://json-schema.org/hyper-schema", {
		"title": "JSON Schema",
		"type": "object",
		"properties": {
			"title": {
				"title": "Schema title",
				"type": "string"
			},
			"properties": {
				"title": "Defined properties",
				"type": "object",
				"additionalProperties": {"$ref": "#"}
			},
			"additionalProperties": {"$ref": "#"}
		},
		"additionalProperties": {},
		"links": [
			{
				"href": "{$ref}",
				"rel": "full"
			}
		]
	}, "http://json-schema.org/hyper-schema");
})(jQuery);
