(function ($) {
	function renderObjectDetails(container, data, schema) {
		var basicTypes = schema.basicTypes();
		if (basicTypes.indexOf("object") >= 0) {
			$('<div class="schema-section-title">Object properties:</div>').appendTo(container);
			var propertyList = schema.definedProperties();
			var requiredList = schema.requiredProperties();
			var propertiesTable = $('<table class="schema-properties" cellpadding=0 cellspacing=0 />');
			var tableBody = $('<tbody></tbody>').appendTo(propertiesTable);
			$.each(propertyList, function (index, key) {
				var propertySchema = data.property("properties").property(key);
				var tableRow = $('<tr class="schema-property" />').appendTo(tableBody);
				if (!data.readOnly()) {
					$('<td class="schema-property-delete">[X Delete]</td>').appendTo(tableRow).click(function () {
						var index = requiredList.indexOf(key);
						if (index > -1) {
							data.property("required").removeIndex(index);
						}
						data.property("properties").property(key).remove();
					});
				}
				$('<td class="schema-property-key"></td>').text(key).appendTo(tableRow);
				var summaryCell = $('<td class="schema-property-summary"></td>').appendTo(tableRow);
				var displayed = false;
				var viewFullSchema = $('<div class="schema-property-view-full">view schema</div>').appendTo(summaryCell).click(function () {
					if (!displayed) {
						schemaContainer.renderJson(propertySchema);
					}
					schemaContainer.slideToggle();
					titleContainer.toggle();
					descriptionContainer.toggle();
				});
				var titleContainer = $('<span class="schema-property-title" />').renderJson(propertySchema.property("title")).appendTo(summaryCell);
				var descriptionContainer= $('<span class="schema-property-description" />').renderJson(propertySchema.property("description")).appendTo(summaryCell);
				var schemaContainer = $('<div class="schema-property-full" />').hide().appendTo(summaryCell);
				var required = requiredList.indexOf(key) > -1;
				var requiredBlock = $('<td class="schema-property-required"></td>').appendTo(tableRow);
				requiredBlock.html((required ? '<span class="json-boolean-true">required</span>' : '<span class="json-boolean-false">not required</span>'));
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
			});
			if (!data.readOnly()) {
				$('<tr><td colspan=4 class="schema-property-add">[+ Add]</td></span>').appendTo(tableBody).click(function () {
					var key = window.prompt("Property name:");
					if (key == null) {
						return;
					}
					if (!data.property("properties").defined()) {
						data.property("properties").setValue({});
					}
					if (!data.property("properties").property(key).defined()) {
						data.property("properties").property(key).setValue({"title": key.charAt(0).toUpperCase() + key.substring(1)});
					}
				});
			}
			propertiesTable.appendTo(container);
		
			var additionalProperties = data.property("additionalProperties");
			var tableRow = $('<tr class="schema-additional-properties" />').appendTo(tableBody);
			if (!data.readOnly()) {
				$('<td></td>').prependTo(tableRow);
			}
			$('<td class="schema-property-additional">other properties</td>').appendTo(tableRow);
			var summaryCell = $('<td class="schema-property-summary"></td>').appendTo(tableRow);
			var allowedBlock = $('<td class="schema-property-required"></td>').appendTo(tableRow);
			if (additionalProperties.value() == false) {
				allowedBlock.html('<span class="json-boolean-false">not allowed</span>');
				if (!data.readOnly()) {
					allowedBlock.click(function () {
						additionalProperties.setValue({});
					});
				}
			} else {
				var displayed = false;
				var viewFullSchema = $('<div class="schema-property-view-full">view schema</div>').appendTo(summaryCell).click(function () {
					if (!displayed) {
						schemaContainer.renderJson(additionalProperties);
					}
					schemaContainer.slideToggle();
					titleContainer.toggle();
					descriptionContainer.toggle();
				});
				var titleContainer = $('<span class="schema-property-title" />').renderJson(additionalProperties.property("title")).appendTo(summaryCell);
				var descriptionContainer = $('<span class="schema-property-description" />').renderJson(additionalProperties.property("description")).appendTo(summaryCell);
				var schemaContainer = $('<div class="schema-property-full" />').hide().appendTo(summaryCell);
				allowedBlock.html('<span class="json-boolean-true">allowed</span>');
				if (!data.readOnly()) {
					allowedBlock.click(function () {
						additionalProperties.setValue(false);
					});
				}
			}
		}
	}

	function renderArrayDetails(container, data, schema) {
		var basicTypes = schema.basicTypes();
		if (basicTypes.indexOf("array") >= 0) {
			$('<div class="schema-section-title">Array items:</div>').appendTo(container);
			
		}
	}
	
	function renderOneOfDetails(container, data, schema) {
		if (data.property("oneOf").defined()) {
			$('<div class="schema-section-title">Must be one of:</div>').appendTo(container);
			$('<div class="schema-section" />').renderJson(data.property("oneOf")).appendTo(container);
		}
	}

	function renderAnyOfDetails(container, data, schema) {
		if (data.property("anyOf").defined()) {
			$('<div class="schema-section-title">Must be at least one of:</div>').appendTo(container);
			$('<div class="schema-section" />').renderJson(data.property("anyOf")).appendTo(container);
		}
	}

	$.renderJson.register({
		render: function (query, data) {
			var schema = data.asSchema();
			var container = $('<div class="schema" />').appendTo(query);		
			$('<div class="schema-title" />').renderJson(data.property("title")).appendTo(container);
			$('<div class="schema-description" />').renderJson(data.property("description")).appendTo(container);
			
			$('<div class="schema-section-title">Basic types:</div>').appendTo(container);
			var basicTypes = schema.basicTypes();
			var typeList = $('<ul class="schema-types" />').appendTo(container);
			$.each(basicTypes, function (index, type) {
				var typeItem = $('<li />').text(type).appendTo(typeList);
				if (!data.readOnly()) {
					$('<span class="schema-type-delete">[X]<span>').prependTo(typeItem).click(function () {
						var index = basicTypes.indexOf(type);
						basicTypes.splice(index, 1);
						if (basicTypes.length > 0) {
							data.property("type").setValue(basicTypes);
						} else {
							data.removeProperty("type");
						}
					});
				}
			});
			
			renderOneOfDetails($('<div />').appendTo(container), data, schema);
			renderAnyOfDetails($('<div />').appendTo(container), data, schema);

			var tabControls = $('<div class="schema-detail-tabs" />').appendTo(container);
			var tabContent = $('<div class="schema-detail" />').appendTo(container);
			function selectOption(basicType) {
				tabContent.empty();
				switch (basicType) {
					case "object":
						renderObjectDetails(tabContent, data, schema);
						break;
					case "array":
						renderArrayDetails(tabContent, data, schema);
						break;
				}
			}
			var tabItems = [];
			$.each(basicTypes, function (index, type) {
				tabItems[index] = $('<a class="schema-detail-tab"></a>').text(type).appendTo(tabControls).click(function () {
					selectOption(type);
					for (var i = 0; i < basicTypes.length; i++) {
						tabItems[i].removeClass("tab-selected");
					}
					tabItems[index].addClass("tab-selected");
				});
			});
			if (tabItems.length > 0) {
				tabItems[0].addClass("tab-selected");
				selectOption(basicTypes[0]);
			}
		},
		filter: function (data, schemas) {
			return schemas.containsUrl("http://json-schema.org/hyper-schema") && !data.property("$ref").defined();
		},
		update: function (query, data, operation) {
			var path = data.pointerPath();
			if (operation.depthFrom(path) <= 2) {
				if (operation.hasPrefix(path + "/properties") || operation.hasPrefix(path + "/required") || operation.hasPrefix(path + "/type")) {
					this.render(query, data);
				}
			}
			this.defaultUpdate(query, data, operation);
		}
	});

	$.renderJson.register({
		render: function (query, data) {
			var refUrl = data.propertyValue("$ref");
			var container = $('<div class="schema-reference"></div>').appendTo(query);
			if (!data.readOnly()) {
				var editUrl = $('<span class="schema-reference-edit">edit URL</span>').appendTo(container).click(function () {
					var input = $('<input type="text"></input>').appendTo(editUrl.empty()).val(refUrl);
					input.focus().select();
					function confirmChange() {
						data.property("$ref").setValue(input.val());
					}
					input.blur(confirmChange).keydown(function (evenet) {
						if (event.which == 13) {
							confirmChange();
						}
					});
				});
			}
			var schemaTitle = $('<div class="schema-title" />').appendTo(container)
			$('<span>Reference:<span>').appendTo(container);
			var linkQuery = $('<a class="schema-reference-url" />').attr("href", refUrl).text(refUrl).appendTo(container).click(function () {
				data.getLink("full").follow();
				return false;
			});
			data.getLink("full").follow(function (link, submissionData, request) {
				request.getData(function (fullData) {
					if (fullData.property("title").defined()) {
						schemaTitle.text(fullData.propertyValue("title"));
					}
				});
				return false;
			});
			return;
		},
		filter: function (data, schemas) {
			return schemas.containsUrl("http://json-schema.org/hyper-schema") && data.property("$ref").defined();
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
			"description": {
				"title": "Schema description",
				"type": "string"
			},
			"oneOf": {
				"type": "array",
				"items": {"$ref": "#"}
			},
			"properties": {
				"title": "Object properties",
				"type": "object",
				"additionalProperties": {"$ref": "#"}
			},
			"additionalProperties": {"$ref": "#"},
			"items": {
				"title": "Array items",
				"oneOf": [
					{"$ref": "#"},
					{
						"title": "Tuple type",
						"type": "array",
						"minItems": 1,
						"items": {"$ref": "#"}
					}
				]
			}
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
