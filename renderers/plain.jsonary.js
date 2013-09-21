(function (global) {
	var escapeHtml = Jsonary.escapeHtml;
	if (global.escapeHtml == undefined) {
		global.escapeHtml = escapeHtml;
	}

	Jsonary.render.register({
		name: "Jsonary plain add/remove",
		component: Jsonary.render.Components.ADD_REMOVE,
		renderHtml: function (data, context) {
			if (!data.defined()) {
				context.uiState.undefined = true;
				var title = "add";
				var parent = data.parent();
				if (parent && parent.basicType() == 'array') {
					var schemas = parent.schemas().indexSchemas(data.parentKey());
					schemas.getFull(function (s) {
						schemas = s;
					});
					title = schemas.title() || title;
				} else if (parent && parent.basicType() == 'object') {
					var schemas = parent.schemas().propertySchemas(data.parentKey());
					schemas.getFull(function (s) {
						schemas = s;
					});
					title = schemas.title() || data.parentKey() || title;
				}
				return context.actionHtml('<span class="json-undefined-create">+ ' + Jsonary.escapeHtml(title) + '</span>', "create");
			}
			delete context.uiState.undefined;
			var showDelete = false;
			if (data.parent() != null) {
				var parent = data.parent();
				if (parent.basicType() == "object") {
					var required = parent.schemas().requiredProperties();
					var minProperties = parent.schemas().minProperties();
					showDelete = required.indexOf(data.parentKey()) == -1 && parent.keys().length > minProperties;
				} else if (parent.basicType() == "array") {
					var tupleTypingLength = parent.schemas().tupleTypingLength();
					var minItems = parent.schemas().minItems();
					var index = parseInt(data.parentKey());
					if ((index >= tupleTypingLength || index == parent.length() - 1)
						&& parent.length() > minItems) {
						showDelete = true;
					}
				}
			}
			var result = "";
			if (showDelete) {
				var parentType = parent.basicType();
				result += "<div class='json-" + parentType + "-delete-container'>";
				result += context.actionHtml("<span class='json-" + parentType + "-delete'>X</span>", "remove") + " ";
				result += context.renderHtml(data, 'data');
				result += "</div>";
			} else {
				result += context.renderHtml(data, 'data');
			}
			return result;
		},
		action: function (context, actionName) {
			if (actionName == "create") {
				var data = context.data;
				var parent = data.parent();
				var finalComponent = data.parentKey();
				if (parent != undefined) {
					var parentSchemas = parent.schemas();
					if (parent.basicType() == "array") {
						parentSchemas.createValueForIndex(finalComponent, function (newValue) {
							parent.index(finalComponent).setValue(newValue);
						});
					} else {
						if (parent.basicType() != "object") {
							parent.setValue({});
						}
						parentSchemas.createValueForProperty(finalComponent, function (newValue) {
							parent.property(finalComponent).setValue(newValue);
						});
					}
				} else {
					data.schemas().createValue(function (newValue) {
						data.setValue(newValue);
					});
				}
			} else if (actionName == "remove") {
				context.data.remove();
			} else {
				alert("Unkown action: " + actionName);
			}
		},
		update: function (element, data, context, operation) {
			return data.defined() == !!context.uiState.undefined;
		},
		filter: function (data) {
			return !data.readOnly();
		},
		saveState: function (uiState, subStates) {
			return subStates.data || {};
		},
		loadState: function (savedState) {
			return [
				{},
				{data: savedState}
			];
		}
	});
	
	Jsonary.render.register({
		name: "Jsonary plain type-selector",
		component: Jsonary.render.Components.TYPE_SELECTOR,
		renderHtml: function (data, context) {
			var result = "";
			var enums = data.schemas().enumValues();
			var basicTypes = data.schemas().basicTypes();
			if (basicTypes.length > 1 && enums == null) {
				console.log(basicTypes);
				result += '<select name="' + context.inputNameForAction('select-basic-type') + '">';
				for (var i = 0; i < basicTypes.length; i++) {
					if (basicTypes[i] == "integer" && basicTypes.indexOf("number") != -1) {
						continue;
					}
					var typeHtml = Jsonary.escapeHtml(basicTypes[i]);
					if (basicTypes[i] == data.basicType() || basicTypes[i] == "number" && data.basicType() == "integer") {
						result += '<option value="' + typeHtml + '" selected>' + typeHtml +'</option>';
					} else {
						result += '<option value="' + typeHtml + '">' + typeHtml +'</option>';
					}
				}
				result += '</select> ';
			}
			result += context.renderHtml(data, 'data');
			return result;
		},
		action: function (context, actionName, basicType) {
			if (actionName == "select-basic-type") {
				context.uiState.dialogOpen = false;
				var schemas = context.data.schemas().concat([Jsonary.createSchema({type: basicType})]);
				schemas.createValue(function (newValue) {
					context.data.setValue(newValue);
				});
				return true;
			} else {
				alert("Unkown action: " + actionName);
			}
		},
		update: function (element, data, context, operation) {
			return false;
		},
		filter: function (data) {
			return !data.readOnly();
		},
		saveState: function (uiState, subStates) {
			var result = {};
			if (uiState.dialogOpen) {
				result.dialogOpen = true;
			}
			if (subStates.data && (subStates.data._ != undefined || subStates.data.dialogOpen != undefined)) {
				result._ = subStates['data'];
			} else {
				for (var key in subStates.data) {
					result[key] = subStates.data[key];
				}
			}
			return result;
		},
		loadState: function (savedState) {
			var uiState = savedState;
			var subState = {};
			if (savedState._ != undefined) {
				var subState = savedState._;
				delete savedState._;
			} else {
				var uiState = {};
				if (savedState.dialogOpen) {
					uiState.dialogOpen = true;
				}
				delete savedState.dialogOpen;
				subState = savedState;
			}
			return [
				uiState,
				{data: subState}
			];
		}
	});

	// Display schema switcher
	Jsonary.render.Components.add("SCHEMA_SWITCHER", Jsonary.render.Components.TYPE_SELECTOR);
	Jsonary.render.register({
		name: "Jsonary plain schema-switcher",
		component: Jsonary.render.Components.SCHEMA_SWITCHER,
		renderHtml: function (data, context) {
			var result = "";
			var fixedSchemas = data.schemas().fixed();

			var singleOption = false;
			var xorSchemas;
			var orSchemas = fixedSchemas.orSchemas();
			if (orSchemas.length == 0) {
				xorSchemas = fixedSchemas.xorSchemas();
				if (xorSchemas.length == 1) {
					singleOption = true;
				}
			}
			
			context.uiState.xorSelected = [];
			context.uiState.orSelected = [];
			if (singleOption) {
				for (var i = 0; i < xorSchemas.length; i++) {
					var options = xorSchemas[i];
					var inputName = context.inputNameForAction('selectXorSchema', i);
					result += '<select name="' + inputName + '">';
					for (var j = 0; j < options.length; j++) {
						var schema = options[j];
						schema.getFull(function (s) {schema = s;});
						var selected = "";
						if (data.schemas().indexOf(schema) != -1) {
							context.uiState.xorSelected[i] = j;
							selected = " selected";
						}
						result += '<option value="' + j + '"' + selected + '>' + schema.forceTitle() + '</option>'
					}
					result += '</select>';
				}
			}
			
			if (context.uiState.dialogOpen) {
				result += '<div class="json-select-type-dialog-outer"><span class="json-select-type-dialog">';
				result += context.actionHtml('close', "closeDialog");
				xorSchemas = xorSchemas || fixedSchemas.xorSchemas();
				for (var i = 0; i < xorSchemas.length; i++) {
					var options = xorSchemas[i];
					var inputName = context.inputNameForAction('selectXorSchema', i);
					result += '<br><select name="' + inputName + '">';
					for (var j = 0; j < options.length; j++) {
						var schema = options[j];
						schema.getFull(function (s) {schema = s;});
						var selected = "";
						if (data.schemas().indexOf(schema) != -1) {
							context.uiState.xorSelected[i] = j;
							selected = " selected";
						}
						result += '<option value="' + j + '"' + selected + '>' + schema.title() + '</option>'
					}
					result += '</select>';
				}
				for (var i = 0; i < orSchemas.length; i++) {
					var options = orSchemas[i];
					var inputName = context.inputNameForAction('selectOrSchema', i);
					result += '<br><select name="' + inputName + '" multiple size="' + options.length + '">';
					context.uiState.orSelected[i] = [];
					for (var j = 0; j < options.length; j++) {
						var schema = options[j];
						schema.getFull(function (s) {schema = s;});
						var selected = "";
						if (data.schemas().indexOf(schema) != -1) {
							context.uiState.orSelected[i][j] = true;
							selected = " selected";
						} else {
							context.uiState.orSelected[i][j] = false;
						}
						result += '<option value="' + j + '"' + selected + '>' + schema.title() + '</option>'
					}
					result += '</select>';
				}
				result += '</span></div>';
			}
			if (!singleOption && fixedSchemas.length < data.schemas().length) {
				result += context.actionHtml("<span class=\"json-select-type button\">Schemas</span>", "openDialog") + " ";
			}
			result += context.renderHtml(data, 'data');
			return result;
		},
		createValue: function (context) {
			var data = context.data;
			var newSchemas = context.data.schemas().fixed();
			var xorSchemas = context.data.schemas().fixed().xorSchemas();
			for (var i = 0; i < xorSchemas.length; i++) {
				newSchemas = newSchemas.concat([xorSchemas[i][context.uiState.xorSelected[i]].getFull()]);
			}
			var orSchemas = context.data.schemas().fixed().orSchemas();
			for (var i = 0; i < orSchemas.length; i++) {
				var options = orSchemas[i];
				for (var j = 0; j < options.length; j++) {
					if (context.uiState.orSelected[i][j]) {
						newSchemas = newSchemas.concat([options[j].getFull()]);
					}
				}
			}
			newSchemas = newSchemas.getFull();
			data.setValue(newSchemas.createValue());
			newSchemas.createValue(function (value) {
				data.setValue(value);
			})
		},
		action: function (context, actionName, value, arg1) {
			if (actionName == "closeDialog") {
				context.uiState.dialogOpen = false;
				return true;
			} else if (actionName == "openDialog") {
				context.uiState.dialogOpen = true;
				return true;
			} else if (actionName == "selectXorSchema") {
				context.uiState.xorSelected[arg1] = value;
				this.createValue(context);
				return true;
			} else if (actionName == "selectOrSchema") {
				context.uiState.orSelected[arg1] = [];
				for (var i = 0; i < value.length; i++) {
					context.uiState.orSelected[arg1][value[i]] = true;
				}
				this.createValue(context);
				return true;
			} else {
				alert("Unkown action: " + actionName);
			}
		},
		update: function (element, data, context, operation) {
			return false;
		},
		filter: function (data) {
			return !data.readOnly();
		},
		saveState: function (uiState, subStates) {
			var result = {};
			if (uiState.dialogOpen) {
				result.dialogOpen = true;
			}
			if (subStates.data._ != undefined || subStates.data.dialogOpen != undefined) {
				result._ = subStates['data'];
			} else {
				for (var key in subStates.data) {
					result[key] = subStates.data[key];
				}
			}
			return result;
		},
		loadState: function (savedState) {
			var uiState = savedState;
			var subState = {};
			if (savedState._ != undefined) {
				var subState = savedState._;
				delete savedState._;
			} else {
				var uiState = {};
				if (savedState.dialogOpen) {
					uiState.dialogOpen = true;
				}
				delete savedState.dialogOpen;
				subState = savedState;
			}
			return [
				uiState,
				{data: subState}
			];
		}
	});

	// Display raw JSON
	Jsonary.render.register({
		name: "Jsonary plain raw JSON display",
		renderHtml: function (data, context) {
			if (!data.defined()) {
				return "";
			}
			return '<span class="json-raw">' + escapeHtml(JSON.stringify(data.value())) + '</span>';
		},
		filter: function (data) {
			return true;
		}
	});
	
	// Display/edit null
	Jsonary.render.register({
		name: "Jsonary plain null",
		renderHtml: function (data, context) {
			return '<span class="json-null">null</span>';
		},
		filter: function (data) {
			return data.basicType() == "null";
		}
	});
	
	function updateTextAreaSize(textarea) {
		var lines = textarea.value.split("\n");
		var maxWidth = 4;
		for (var i = 0; i < lines.length; i++) {
			if (maxWidth < lines[i].length) {
				maxWidth = lines[i].length;
			}
		}
		textarea.setAttribute("cols", maxWidth + 1);
		textarea.setAttribute("rows", lines.length);
	}

	// Display/edit objects
	Jsonary.render.register({	
		name: "Jsonary plain objects",
		renderHtml: function (data, context) {
			var uiState = context.uiState;
			var result = "";
			result += '<fieldset class="json-object-outer">';
			var title = data.schemas().title();
			if (title) {
				result += '<legend class="json-object-title">' + Jsonary.escapeHtml(title) + '</legend>';
			}
			result += '<table class="json-object"><tbody>';
			var drawProperty = function (key, subData) {
				if (subData.defined()) {
					var title = subData.schemas().fixed().title();
				} else {
					var schemas = subData.parent().schemas().propertySchemas(subData.parentKey());
					if (schemas.readOnly()) {
						return;
					}
					var title = schemas.title();
				}
				result += '<tr class="json-object-pair">';
				if (title == "") {
					result +=	'<td class="json-object-key"><div class="json-object-key-title">' + escapeHtml(key) + '</div></td>';
				} else {
					result +=	'<td class="json-object-key"><div class="json-object-key-title">' + escapeHtml(key) + '</div><div class="json-object-key-text">' + escapeHtml(title) + '</div></td>';
				}
				result += '<td class="json-object-value">' + context.renderHtml(subData) + '</td>';
				result += '</tr>';
			}
			if (!data.readOnly()) {
				var schemas = data.schemas();
				var knownProperties = schemas.knownProperties();
				
				var shouldHideUndefined = knownProperties.length - schemas.requiredProperties().length > 5;
				
				var maxProperties = schemas.maxProperties();
				var canAdd = (maxProperties == null || maxProperties > schemas.keys().length);
				data.properties(knownProperties, function (key, subData) {
					if ((!shouldHideUndefined && canAdd) || subData.defined()) {
						drawProperty(key, subData);
					}
				}, drawProperty);

				if (canAdd && (schemas.allowedAdditionalProperties() || shouldHideUndefined)) {
					if (context.uiState.addInput) {
						result += '<tr class="json-object-pair"><td class="json-object-key"><div class="json-object-key-text">';
						result += context.actionHtml('<span class="button">add</span>', "add-confirm");
						result += '<br>';
						result += '</div></td><td>';
						if (shouldHideUndefined) {
							var missingKeys = [];
							data.properties(knownProperties, function (key, subData) {
								if (!subData.defined()) {
									missingKeys.push(key);
								}
							});
							result += '<select name="' + context.inputNameForAction('select-preset') + '">';
							if (schemas.allowedAdditionalProperties()) {
								result += '<option value="custom">Enter your own:</option>';
							}
							result += '<optgroup label="Known properties">';
							missingKeys.sort();
							for (var i = 0; i < missingKeys.length; i++) {
								var key = missingKeys[i];
								if (key == context.uiState.addInputSelect) {
									result += '<option value="key-' + Jsonary.escapeHtml(key) + '" selected>' + Jsonary.escapeHtml(key) + '</option>';
								} else {
									result += '<option value="key-' + Jsonary.escapeHtml(key) + '">' + Jsonary.escapeHtml(key) + '</option>';
								}
							}
							result += '</optgroup></select>';
						}
						if (schemas.allowedAdditionalProperties() && (!shouldHideUndefined || context.uiState.addInputSelect == null)) {
							result += '<input type="text" class="json-object-add-input" name="' + context.inputNameForAction("add-input") + '" value="' + Jsonary.escapeHtml(context.uiState.addInputValue) + '"></input>';
							result += context.actionHtml('<span class="button">cancel</span>', "add-cancel");
							if (data.property(context.uiState.addInputValue).defined()) {
								result += '<span class="warning"><code>' + Jsonary.escapeHtml(context.uiState.addInputValue) + '</code> already exists</span>';
							}
						} else {
							result += context.actionHtml('<span class="button">cancel</span>', "add-cancel");
						}
						result += '</td></tr>';
					} else {
						result += '<tr class="json-object-pair"><td class="json-object-key"><div class="json-object-key-text">';
						result += context.actionHtml('<span class="button">add</span>', "add-input");
						result += '</div></td><td></td></tr>';
					}
				}
			} else {
				var knownProperties = data.schemas().knownProperties();
				data.properties(knownProperties, function (key, subData) {
					if (subData.defined()) {
						drawProperty(key, subData);
					}
				}, true);
			}
			result += '</table>';
			result += '</fieldset>';
			return result;
		},
		action: function (context, actionName, arg1) {
			var data = context.data;
			if (actionName == "select-preset") {
				if (arg1 == 'custom') {
					delete context.uiState.addInputSelect;
				} else {
					var key = arg1;
					context.uiState.addInputSelect = key.substring(4);
				}
				return true;
			} else if (actionName == "add-input") {
				context.uiState.addInput = true;
				context.uiState.addInputValue = (arg1 == undefined) ? "key" : arg1;
				return true;
			} else if (actionName == "add-cancel") {
				delete context.uiState.addInput;
				delete context.uiState.addInputValue;
				delete context.uiState.addInputSelect;
				return true;
			} else if (actionName == "add-confirm") {
				var key = (context.uiState.addInputSelect != null) ? context.uiState.addInputSelect : context.uiState.addInputValue;
				if (key != null && !data.property(key).defined()) {
					delete context.uiState.addInput;
					delete context.uiState.addInputValue;
					delete context.uiState.addInputSelect;
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

	// Display/edit arrays
	Jsonary.render.register({
		name: "Jsonary plain arrays",
		renderHtml: function (data, context) {
			var tupleTypingLength = data.schemas().tupleTypingLength();
			var maxItems = data.schemas().maxItems();
			var result = "";
			data.indices(function (index, subData) {
				result += '<div class="json-array-item">';
				result += '<span class="json-array-value">' + context.renderHtml(subData) + '</span>';
				result += '</div>';
			});
			if (!data.readOnly()) {
				if (maxItems == null || data.length() < maxItems) {
					var addHtml = '<span class="json-array-add">+ add</span>';
					result += context.actionHtml(addHtml, "add");
				}
			}
			return result;
		},
		action: function (context, actionName) {
			var data = context.data;
			if (actionName == "add") {
				var index = data.length();
				data.schemas().createValueForIndex(index, function (newValue) {
					data.index(index).setValue(newValue);
				});
			}
		},
		filter: function (data) {
			return data.basicType() == "array";
		}
	});
	
	// Display string
	Jsonary.render.register({
		name: "Jsonary plain display string",
		renderHtml: function (data, context) {
			return '<span class="json-string">' + escapeHtml(data.value()) + '</span>';
		},
		filter: function (data) {
			return data.basicType() == "string" && data.readOnly();
		}
	});

	function copyTextStyle(source, target) {
		var style = getComputedStyle(source, null);
		for (var key in style) {
			if (key.substring(0, 4) == "font" || key.substring(0, 4) == "text") {
				target.style[key] = style[key];
			}
		}
	}
	function updateTextareaSize(textarea, sizeMatchBox, suffix) {
		sizeMatchBox.innerHTML = "";
		sizeMatchBox.appendChild(document.createTextNode(textarea.value + suffix));
		var style = getComputedStyle(sizeMatchBox, null);
		textarea.style.width = parseInt(style.width.substring(0, style.width.length - 2)) + 4 + "px";
		textarea.style.height = parseInt(style.height.substring(0, style.height.length - 2)) + 4 + "px";
	}
	
	function getText(element) {
		var result = "";
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType == 1) {
				var tagName = child.tagName.toLowerCase();
				if (tagName == "br") {
					result += "\n";
					continue;
				}
				if (child.tagName == "li") {
					result += "\n*\t";
				}
				if (tagName == "p"
					|| /^h[0-6]$/.test(tagName)
					|| tagName == "header"
					|| tagName == "aside"
					|| tagName == "blockquote"
					|| tagName == "footer"
					|| tagName == "div"
					|| tagName == "table"
					|| tagName == "hr") {
					if (result != "") {
						result += "\n";
					}
				}
				if (tagName == "td" || tagName == "th") {
					result += "\t";
				}
				
				result += getText(child);
				
				if (tagName == "tr") {
					result += "\n";
				}
			} else if (child.nodeType == 3) {
				result += child.nodeValue;
			}
		}
		result = result.replace("\r\n", "\n");
		result = result.replace(/\n$/, "");
		return result;
	}

	// Edit string
	Jsonary.render.register({
		name: "Jsonary plain edit string",
		renderHtml: function (data, context) {
			var maxLength = data.schemas().maxLength();
			var inputName = context.inputNameForAction('new-value');
			var valueHtml = escapeHtml(data.value());
			return '<textarea class="json-string" name="' + inputName + '">'
				+ valueHtml
				+ '</textarea>';
		},
		action: function (context, actionName, arg1) {
			if (actionName == 'new-value') {
				context.data.setValue(arg1);
			}
		},
		render: function (element, data, context) {
			//Use contentEditable
			if (element.contentEditable !== null) {
				element.innerHTML = '<div class="json-string json-string-content-editable">' + escapeHtml(data.value()).replace(/\n/g, "<br>") + '</div>';
				var valueSpan = element.childNodes[0];
				valueSpan.contentEditable = "true";
				valueSpan.onblur = function () {
					var newString = getText(valueSpan);
					data.setValue(newString);
				};
				return;
			}
			
			if (typeof window.getComputedStyle != "function") {
				return;
			}
			// min/max length
			var minLength = data.schemas().minLength();
			var maxLength = data.schemas().maxLength();
			var noticeBox = document.createElement("span");
			noticeBox.className="json-string-notice";
			function updateNoticeBox(stringValue) {
				if (stringValue.length < minLength) {
					noticeBox.innerHTML = 'Too short (minimum ' + minLength + ' characters)';
				} else if (maxLength != null && stringValue.length > maxLength) {
					noticeBox.innerHTML = 'Too long (+' + (stringValue.length - maxLength) + ' characters)';
				} else if (maxLength != null) {
					noticeBox.innerHTML = (maxLength - stringValue.length) + ' characters left';
				} else {
					noticeBox.innerHTML = "";
				}
			}
			
			// size match
			var sizeMatchBox = document.createElement("div");
			
			var textarea = null;
			for (var i = 0; i < element.childNodes.length; i++) {
				if (element.childNodes[i].nodeType == 1) {
					textarea = element.childNodes[i];
					break;
				}
			}
			element.insertBefore(sizeMatchBox, textarea);
			copyTextStyle(textarea, sizeMatchBox);
			sizeMatchBox.style.display = "inline";
			sizeMatchBox.style.position = "absolute";
			sizeMatchBox.style.width = "auto";
			sizeMatchBox.style.height = "auto";
			sizeMatchBox.style.left = "-100000px";
			sizeMatchBox.style.top = "0px";
			sizeMatchBox.style.whiteSpace = "pre";
			sizeMatchBox.style.zIndex = -10000;
			var suffix = "MMMMM";
			updateTextareaSize(textarea, sizeMatchBox, suffix);		
			
			textarea.value = data.value();
			textarea.onkeyup = function () {
				updateNoticeBox(this.value);
				updateTextareaSize(this, sizeMatchBox, suffix);
			};
			textarea.onfocus = function () {
				updateNoticeBox(data.value());
				suffix = "MMMMM\nMMM";
				updateTextareaSize(this, sizeMatchBox, suffix);
			};
			textarea.onblur = function () {
				data.setValue(this.value);
				noticeBox.innerHTML = "";
				suffix = "MMMMM";
				updateTextareaSize(this, sizeMatchBox, suffix);
			};
			element.appendChild(noticeBox);
			textarea = null;
			element = null;
		},
		update: function (element, data, context, operation) {
			if (element.contentEditable !== null) {
				var valueSpan = element.childNodes[0];
				valueSpan.innerHTML = escapeHtml(data.value()).replace(/\n/g, "<br>");
				return false;
			};
			if (operation.action() == "replace") {
				var textarea = null;
				for (var i = 0; i < element.childNodes.length; i++) {
					if (element.childNodes[i].tagName.toLowerCase() == "textarea") {
						textarea = element.childNodes[i];
						break;
					}
				}				
				textarea.value = data.value();
				textarea.onkeyup();
				return false;
			} else {
				return true;
			}
		},
		filter: function (data) {
			return data.basicType() == "string" && !data.readOnly();
		}
	});

	// Display/edit boolean	
	Jsonary.render.register({
		name: "Jsonary plain booleans",
		renderHtml: function (data, context) {
			if (data.readOnly()) {
				if (data.value()) {
					return '<span class="json-boolean-true">yes</span>';
				} else {
					return '<span class="json-boolean-false">no</span>';
				}
			}
			var result = "";
			var inputName = context.inputNameForAction('switch');
			return '<input type="checkbox" class="json-boolean" name="' + inputName + '" value="1" ' + (data.value() ? 'checked' : '' ) + '></input>';
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
	
	// Edit number
	Jsonary.render.register({
		name: "Jsonary plain edit number",
		renderHtml: function (data, context) {
			var style = "";
			if (data.value().toString().length > 3) {
				var width = data.value().toString().length;
				style = 'style="width: ' + width + 'em;"';
			}
			var result = '<input class="json-number-input" type="text" value="' + data.value() + '" name="' + context.inputNameForAction('input') + '" ' + style + '></input>';
			
			var interval = data.schemas().numberInterval();
			if (interval != undefined) {
				var minimum = data.schemas().minimum();
				if (minimum == null || data.value() > minimum + interval || data.value() == (minimum + interval) && !data.schemas().exclusiveMinimum()) {
					result = context.actionHtml('<span class="json-number-decrement button">-</span>', 'decrement') + result;
				} else {
					result = '<span class="json-number-decrement button disabled" onmousedown="event.preventDefault();">-</span>' + result;
				}
				
				var maximum = data.schemas().maximum();
				if (maximum == null || data.value() < maximum - interval || data.value() == (maximum - interval) && !data.schemas().exclusiveMaximum()) {
					result += context.actionHtml('<span class="json-number-increment button">+</span>', 'increment');
				} else {
					result += '<span class="json-number-increment button disabled" onmousedown="event.preventDefault;">+</span>';
				}
			}
			return '<span class="json-number">' + result + '</span>';
		},
		action: function (context, actionName, arg1) {
			var data = context.data;
			var interval = data.schemas().numberInterval();
			if (actionName == "increment") {
				var value = data.value() + interval;
				var valid = true;
				var maximum = data.schemas().maximum();
				if (maximum != undefined) {
					if (value > maximum || (value == maximum && data.schemas().exclusiveMaximum())) {
						valid = false;
					}
				}
				if (valid) {
					data.setValue(value);
				}
			} else if (actionName == "decrement") {
				var value = data.value() - interval;
				var valid = true;
				var minimum = data.schemas().minimum();
				if (minimum != undefined) {
					if (value < minimum || (value == minimum && data.schemas().exclusiveMinimum())) {
						valid = false;
					}
				}
				if (valid) {
					data.setValue(value);
				}
			} else if (actionName == "input") {
				var newValueString = arg1
				var value = parseFloat(newValueString);
				if (!isNaN(value)) {
					if (interval != undefined) {
						value = Math.round(value/interval)*interval;
					}
					var valid = true;
					var minimum = data.schemas().minimum();
					if (minimum != undefined) {
						if (value < minimum || (value == minimum && data.schemas().exclusiveMinimum())) {
							valid = false;
						}
					}
					var maximum = data.schemas().maximum();
					if (maximum != undefined) {
						if (value > maximum || (value == maximum && data.schemas().exclusiveMaximum())) {
							valid = false;
						}
					}
					if (!valid) {
						value = data.schemas().createValueNumber();
					}
					data.setValue(value);
				}
			}
		},
		filter: function (data) {
			return (data.basicType() == "number" || data.basicType() == "integer") && !data.readOnly();
		}
	});

	// Edit enums
	Jsonary.render.register({
		name: "Jsonary plain enums",
		render: function (element, data, context) {
			var enumValues = data.schemas().enumValues();
			if (enumValues.length == 0) {
				element.innerHTML = '<span class="json-enum-invalid">invalid</span>';
				return;
			} else if (enumValues.length == 1) {
				if (typeof enumValues[0] == "string") {
					element.innerHTML = '<span class="json-string">' + escapeHtml(enumValues[0]) + '</span>';
				} else if (typeof enumValues[0] == "number") {
					element.innerHTML = '<span class="json-number">' + enumValues[0] + '</span>';
				} else if (typeof enumValues[0] == "boolean") {
					var text = (enumValues[0] ? "true" : "false");
					element.innerHTML = '<span class="json-boolean-' + text + '">' + text + '</span>';
				} else {
					element.innerHTML = '<span class="json-raw">' + escapeHtml(JSON.stringify(enumValues[0])) + '</span>';
				}
				return;
			}
			var select = document.createElement("select");
			for (var i = 0; i < enumValues.length; i++) {
				var option = document.createElement("option");
				option.setAttribute("value", i);
				if (data.equals(Jsonary.create(enumValues[i]))) {
					option.selected = true;
				}
				option.appendChild(document.createTextNode(enumValues[i]));
				select.appendChild(option);
			}
			select.onchange = function () {
				var index = this.value;
				data.setValue(enumValues[index]);
			}
			element.appendChild(select);
			element = select = option = null;
		},
		filter: function (data) {
			return !data.readOnly() && data.schemas().enumValues() != null;
		}
	});

})(this);
