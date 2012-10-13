(function ($) {
	function renderObjectDetails(container, data, schema) {
		var basicTypes = schema.basicTypes();
		if (basicTypes.indexOf("object") >= 0) {
			$('<div class="schema-section-title">Properties:</div>').appendTo(container);
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
				var keyCell = $('<td class="schema-property-key"></td>').text(key).appendTo(tableRow);
				if (!data.readOnly()) {
					keyCell.click(function () {
						var input = $('<input type="text" />').val(key).appendTo(keyCell.empty());
						input.blur(function () {
							var newKey = input.val();
							if (newKey == key) {
								keyCell.text(key);
								return;
							}
							var properties = data.property("properties");
							while (properties.property(newKey).defined()) {
								newKey = "_" + newKey;
							}
							properties.property(key).moveTo(properties.property(newKey));
						}).focus().select();
					});
				}
				var summaryCell = $('<td class="schema-property-summary"></td>').appendTo(tableRow);
				var displayed = false;
				var viewFullSchema = $('<div class="schema-property-view-full">view schema</div>').appendTo(summaryCell).click(function () {
					if (!displayed) {
						schemaContainer.renderJson(propertySchema);
					}
					schemaContainer.slideToggle();
					titleContainer.toggle();
				});
				var titleContainer = $('<span class="schema-property-title" />').renderJson(propertySchema.property("title")).appendTo(summaryCell);
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

			$('<div class="schema-section-title">Dependencies:</div>').appendTo(container);
			var dependencyTable = $('<table class="schema-properties" cellpadding=0 cellspacing=0 />');
			var tableBody = $('<tbody></tbody>').appendTo(dependencyTable);
			data.property("dependencies").properties(function (key, subData) {
				var tableRow = $('<tr class="schema-property" />').appendTo(tableBody);
				if (!data.readOnly()) {
					$('<td class="schema-property-delete">[X Delete]</td>').appendTo(tableRow).click(function () {
						subData.remove();
					});
				}
				var keyCell = $('<td class="schema-property-key"></td>').text(key).appendTo(tableRow);
				if (!data.readOnly()) {
					keyCell.click(function () {
						var input = $('<input type="text" />').val(key).appendTo(keyCell.empty());
						input.blur(function () {
							var newKey = input.val();
							if (newKey == key) {
								keyCell.text(key);
								return;
							}
							var properties = data.property("properties");
							while (properties.property(newKey).defined()) {
								newKey = "_" + newKey;
							}
							properties.property(key).moveTo(properties.property(newKey));
						}).focus().select();
					});
				}
				var summaryCell = $('<td class="schema-property-summary"></td>').appendTo(tableRow);
				var displayed = false;
				var viewFullSchema = $('<div class="schema-property-view-full">view schema</div>').appendTo(summaryCell).click(function () {
					if (!displayed) {
						schemaContainer.renderJson(subData);
					}
					schemaContainer.slideToggle();
					titleContainer.toggle();
				});
				var titleContainer = $('<span class="schema-property-title" />').renderJson(subData.property("title")).appendTo(summaryCell);
				var schemaContainer = $('<div class="schema-property-full" />').hide().appendTo(summaryCell);
			});
			if (!data.readOnly()) {
				$('<tr><td colspan=4 class="schema-property-add">[+ Add]</td></span>').appendTo(tableBody).click(function () {
					var key = window.prompt("Property name:");
					if (key == null) {
						return;
					}
					if (!data.property("dependencies").defined()) {
						data.property("dependencies").setValue({});
					}
					if (!data.property("dependencies").property(key).defined()) {
						data.property("dependencies").property(key).setValue({"title": "Dependency for \"" + key + "\""});
					}
				});
			}
			dependencyTable.appendTo(container);
		}
	}

	function renderArrayDetails(container, data, schema) {
		var basicTypes = schema.basicTypes();
		if (basicTypes.indexOf("array") >= 0) {
			if (data.property("items").basicType() == "object") {
				$('<div class="schema-section-title">Items in the array must be:</div>').appendTo(container);
				$('<div class="schema-section" />').renderJson(data.property("items")).appendTo(container);
			} else if (data.property("items").basicType() == "array") {
				$('<div class="schema-section-title">Array must contain items in this order:</div>').appendTo(container);
				$('<div class="schema-section" />').renderJson(data.property("items")).appendTo(container);
				$('<div class="schema-section-title">Additional items:</div>').appendTo(container);
				$('<div class="schema-section" />').renderJson(data.property("additionalItems")).appendTo(container);
			}
		}
		if (data.property("minItems").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Minimum length:</div>').appendTo(container);
		}
		$('<div class="schema-section" />').renderJson(data.property("minItems")).appendTo(container);
		if (data.property("maxItems").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Maximum length:</div>').appendTo(container);
		}
		$('<div class="schema-section" />').renderJson(data.property("maxItems")).appendTo(container);
		if (data.property("uniqueItems").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Items must be unique:</div>').appendTo(container);
		}
		$('<div class="schema-section" />').renderJson(data.property("uniqueItems")).appendTo(container);
	}
	
	function renderNumberDetails(container, data, schema) {
		if (data.property("minimum").defined() || !data.readOnly()) {
			var conditions = $('<div class="schema-section-title">Value must be </div>').appendTo(container);
			var exclusiveSpan = $('<span></span>').appendTo(conditions).text(data.get("/exclusiveMinimum") ? "greater than" : "greater than or equal to");
			if (!data.readOnly()) {
				exclusiveSpan.addClass("schema-switch").click(function () {
					data.set("/exclusiveMinimum", !data.get("/exclusiveMinimum"));
				});
			}
			conditions.append(":");
		}
		$('<div class="schema-section" />').renderJson(data.property("minimum")).appendTo(container);

		if (data.property("maximum").defined() || !data.readOnly()) {
			var conditions = $('<div class="schema-section-title">Value must be </div>').appendTo(container);
			var exclusiveSpan = $('<span></span>').appendTo(conditions).text(data.get("/exclusiveMaximum") ? "less than" : "less than or equal to");
			if (!data.readOnly()) {
				exclusiveSpan.addClass("schema-switch").click(function () {
					data.set("/exclusiveMaximum", !data.get("/exclusiveMaximum"));
				});
			}
			conditions.append(":");
		}
		$('<div class="schema-section" />').renderJson(data.property("maximum")).appendTo(container);

		if (data.property("divisibleBy").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Value must be a multiple of:</div>').appendTo(container);
		}
		$('<div class="schema-section" />').renderJson(data.property("divisibleBy")).appendTo(container);
	}

	function renderStringDetails(container, data, schema) {
		if (data.property("pattern").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Regular expression:</div>').appendTo(container);
		}
		$('<div class="schema-section schema-regex" />').renderJson(data.property("pattern")).appendTo(container);

		if (data.property("minLength").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Minimum length:</div>').appendTo(container);
		}
		$('<div class="schema-section" />').renderJson(data.property("minLength")).appendTo(container);

		if (data.property("maxLength").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Maximum length:</div>').appendTo(container);
		}
		$('<div class="schema-section" />').renderJson(data.property("maxLength")).appendTo(container);
	}

	function renderOneOfDetails(container, data, schema) {
		if (data.property("oneOf").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Must be exactly one of:</div>').appendTo(container);
		}
		$('<div class="schema-section" />').renderJson(data.property("oneOf")).appendTo(container);
	}

	function renderAnyOfDetails(container, data, schema) {
		if (data.property("anyOf").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Must be at least one of:</div>').appendTo(container);
		}
		$('<div class="schema-section" />').renderJson(data.property("anyOf")).appendTo(container);
	}

	function renderAllDetails(container, data, schema) {
		if (data.property("allOf").defined() || data.property("extends").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Must also match all of:</div>').appendTo(container);
		}
		if (data.property("extends").defined()) {
			$('<div class="schema-section" />').renderJson(data.property("extends")).appendTo(container);
		}
		$('<div class="schema-section" />').renderJson(data.property("allOf")).appendTo(container);
	}

	function renderEnumDetails(container, data, schema) {
		if (data.property("enum").defined() || !data.readOnly()) {
			$('<div class="schema-section-title">Must be exactly equal to one of:</div>').appendTo(container);
		}
		$('<div class="schema-section" />').renderJson(data.property("enum")).appendTo(container);
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
			renderAllDetails($('<div />').appendTo(container), data, schema);
			renderEnumDetails($('<div />').appendTo(container), data, schema);

			var tabControls = $('<div class="schema-detail-tabs"></div>').appendTo(container);
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
					case "string":
						renderStringDetails(tabContent, data, schema);
						break;
					case "number":
					case "integer":
						renderNumberDetails(tabContent, data, schema);
						break;
					default:
						tabContent.text("There are no " + basicType + " constraints");
						break;
				}
			}
			var tabItems = [];
			$.each(basicTypes, function (index, type) {
				index = tabItems.length;
				tabItems[index] = $('<a class="schema-detail-tab"></a>').text(type).appendTo(tabControls).click(function () {
					selectOption(type);
					for (var i = 0; i < tabItems.length; i++) {
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
			return schemas.containsUrl("http://json-schema.org/schema") && !data.property("$ref").defined();
		},
		update: function (query, data, operation) {
			var path = data.pointerPath();
			var depth = operation.depthFrom(path)
			if (depth <= 1) {
				if (data.readOnly()
					|| operation.hasPrefix(path + "/exclusiveMinimum")
					|| operation.hasPrefix(path + "/exclusiveMaximum")) {
					return this.render(query, data);
				}
				return this.render(query, data);
			} else if (depth <= 2) {
				if (operation.hasPrefix(path + "/properties")
					|| operation.hasPrefix(path + "/required")
					|| operation.hasPrefix(path + "/dependencies")
					|| operation.hasPrefix(path + "/type")) {
					return this.render(query, data);
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
			return schemas.containsUrl("http://json-schema.org/schema") && data.property("$ref").defined();
		}
	});
	
	Jsonary.addToCache("http://json-schema.org/schema", {
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
				"title": "One-Of",
				"description": "Instances must match exactly one of the schemas in this property",
				"type": "array",
				"items": {"$ref": "#"}
			},
			"anyOf": {
				"title": "Any-Of",
				"description": "Instances must match at least one of the schemas in this property",
				"type": "array",
				"items": {"$ref": "#"}
			},
			"allOf": {
				"title": "All-Of",
				"description": "Instances must match all of the schemas in this property",
				"type": "array",
				"items": {"$ref": "#"}
			},
			"extends": {
				"title": "Extends (DEPRECATED)",
				"description": "Instances must match all of the schemas in this property",
				"type": "array",
				"items": {"$ref": "#"}
			},
			"enum": {
				"title": "Enum values",
				"description": "If defined, then the value must be equal to one of the items in this array",
				"type": "array"
			},
			"default": {
				"title": "Default value",
				"type": "any"
			},
			"properties": {
				"title": "Object properties",
				"type": "object",
				"additionalProperties": {"$ref": "#"}
			},
			"required": {
				"title": "Required properties",
				"description": "If the instance is an object, these properties must be present",
				"type": "array",
				"items": {
					"title": "Property name",
					"type": "string"
				}
			},
			"dependencies": {
				"title": "Dependencies",
				"description": "If the instance is an object, and contains a property matching one of those here, then it must also follow the corresponding schema",
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
			},
			"additionalItems": {"$ref": "#"},
			"minItems": {
				"title": "Minimum array length",
				"type": "integer",
				"minimum": 0
			},
			"maxItems": {
				"title": "Maximum array length",
				"type": "integer",
				"minimum": 0
			},
			"uniqueItems": {
				"title": "Unique items",
				"description": "If set to true, and the value is an array, then no two items in the array should be equal.",
				"type": "boolean",
				"default": false
			},
			"pattern": {
				"title": "Regular expression",
				"description": "An regular expression (ECMA 262) which the value must match if it's a string",
				"type": "string",
				"format": "regex"
			},
			"minLength": {
				"title": "Minimum string length",
				"type": "integer",
				"minimum": 0,
				"default": 0
			},
			"maxLength": {
				"title": "Maximum string length",
				"type": "integer",
				"minimum": 0
			},
			"minimum": {
				"title": "Minimum value",
				"type": "number"
			},
			"maximum": {
				"title": "Maximum value",
				"type": "number"
			},
			"exclusiveMinimum": {
				"title": "Exclusive Minimum",
				"description": "If the value is a number and this is set to true, then the value cannot be equal to the value specified in \"minimum\"",
				"type": "boolean",
				"default": false
			},
			"exclusiveMaximum": {
				"title": "Exclusive Maximum",
				"description": "If the value is a number and this is set to true, then the value cannot be equal to the value specified in \"maximum\"",
				"type": "boolean",
				"default": false
			},
			"divisibleBy": {
				"title": "Divisible by",
				"description": "If the value is a number, then it must be an integer multiple of the value of this property",
				"type": "number",
				"minimum": 0,
				"exclusiveMinimum": true
			},
			"$ref": {
				"title": "Reference URI",
				"description": "This contains the URI of a schema, which should be used to replace the containing schema.",
				"type": "string",
				"format": "uri"
			}
		},
		"additionalProperties": {},
		"links": [
			{
				"href": "{$ref}",
				"rel": "full"
			}
		]
	}, "http://json-schema.org/schema");

	Jsonary.addToCache("http://json-schema.org/hyper-schema", {
		"allOf": [
			{"$ref": "http://json-schema.org/schema"}
		]
	}, "http://json-schema.org/hyper-schema");	
})(jQuery);
