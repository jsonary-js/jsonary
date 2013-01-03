(function () {
	function escapeHtml(text) {
		return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&#39;").replace('"', "&quot;");
	}
	if (window.escapeHtml == undefined) {
		window.escapeHtml = escapeHtml;
	}

	Jsonary.render.register({
		component: Jsonary.render.Components.ADD_REMOVE,
		renderHtml: function (data, context) {
			if (!data.defined()) {
				context.uiState.undefined = true;
				return context.actionHtml('<span class="json-undefined-create">+ create</span>', "create");
			}
			delete context.uiState.undefined;
			if (context.uiState.subState == undefined) {
				context.uiState.subState = {};
			}
			var showDelete = false;
			if (data.parent() != null) {
				var parent = data.parent();
				if (parent.basicType() == "object") {
					var required = parent.schemas().requiredProperties();
					showDelete = required.indexOf(data.parentKey()) == -1;
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
				result += context.actionHtml("<span class='json-object-delete'>X</span>", "remove") + " ";
			}
			result += context.renderHtml(data, context.uiState.subState);
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
			return context.uiState.undefined;
		},
		filter: function (data) {
			return !data.readOnly();
		}
	});
	
	Jsonary.render.register({
		component: Jsonary.render.Components.TYPE_SELECTOR,
		renderHtml: function (data, context) {
			if (context.uiState.subState == undefined) {
				context.uiState.subState = {};
			}
			var result = "";
			var basicTypes = data.schemas().basicTypes();
			var enums = data.schemas().enumValues();
			if (context.uiState.dialogOpen) {
				result += '<span class="json-select-type-dialog">';
				result += context.actionHtml('close', "closeDialog");
				if (basicTypes.length > 1) {
					result += '<br>Select basic type:<ul>';
					for (var i = 0; i < basicTypes.length; i++) {
						if (basicTypes[i] == "integer" && basicTypes.indexOf("number") != -1) {
							continue;
						}
						if (basicTypes[i] == data.basicType() || basicTypes[i] == "number" && data.basicType() == "integer") {
							result += '<li>' + basicTypes[i];
						} else {
							result += '<li>' + context.actionHtml(basicTypes[i], 'select-basic-type', basicTypes[i]);
						}
					}
					result += '</ul>';
				}
				result += '</span>';
			}
			if (basicTypes.length > 1 && enums == null) {
				result += context.actionHtml("<span class=\"json-select-type\">T</span>", "openDialog") + " ";
			}
			result += context.renderHtml(data, context.uiState.subState);
			return result;
		},
		action: function (context, actionName, basicType) {
			if (actionName == "closeDialog") {
				context.uiState.dialogOpen = false;
				return true;
			} else if (actionName == "openDialog") {
				context.uiState.dialogOpen = true;
				return true;
			} else if (actionName == "select-basic-type") {
				context.uiState.dialogOpen = false;
				var schemas = context.data.schemas().concat([Jsonary.createSchema({type: basicType})]);
				schemas.createValue(function (newValue) {
					context.data.setValue(newValue);
				});
			} else {
				alert("Unkown action: " + actionName);
			}
		},
		update: function (element, data, context, operation) {
			return false;
		},
		filter: function (data) {
			return !data.readOnly();
		}
	});

	// Display raw JSON
	Jsonary.render.register({
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
		renderHtml: function (data, context) {
			var uiState = context.uiState;
			var result = "{";
			data.properties(function (key, subData) {
				result += '<div class="json-object-pair">';
				result +=	'<span class="json-object-key">' + escapeHtml(key) + '</span>: ';
				result += '<span class="json-object-value">' + context.renderHtml(subData) + '</span>';
				result += '</div>';
			});
			if (!data.readOnly()) {
				var addLinkHtml = "";
				var schemas = data.schemas();
				var definedProperties = schemas.definedProperties();
				var keyFunction = function (index, key) {
					var addHtml = '<span class="json-object-add-key">' + escapeHtml(key) + '</span>';
					addLinkHtml += context.actionHtml(addHtml, "add-named", key);
				};
				for (var i = 0; i < definedProperties.length; i++) {
					if (!data.property(definedProperties[i]).defined()) {
						keyFunction(i, definedProperties[i]);
					}
				}
				if (schemas.allowedAdditionalProperties()) {
					var newHtml = '<span class="json-object-add-key-new">+ new</span>';
					addLinkHtml += context.actionHtml(newHtml, "add-new");
				}
				if (addLinkHtml != "") {
					result += '<span class="json-object-add">add: ' + addLinkHtml + '</span>';
				}
			}
			return result + "}";
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

	// Display/edit arrays
	Jsonary.render.register({
		renderHtml: function (data, context) {
			var tupleTypingLength = data.schemas().tupleTypingLength();
			var maxItems = data.schemas().maxItems();
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
		renderHtml: function (data, context) {
			return '<span class="json-string">' + escapeHtml(data.value()) + '</span>';
		},
		filter: function (data) {
			return data.basicType() == "string" && data.readOnly();
		}
	});

	// Display string
	Jsonary.render.register({
		renderHtml: function (data, context) {
			var date = new Date(data.value());
			return '<span class="json-string json-string-date">' + date.toLocaleString() + '</span>';
		},
		filter: function (data, schemas) {
			return data.basicType() == "string" && data.readOnly() && schemas.formats().indexOf("date-time") != -1;
		}
	});

	// Edit string
	Jsonary.render.register({
		renderHtml: function (data, context) {
			var maxLength = data.schemas().maxLength();
			var inputName = context.inputNameForAction('new-value');
			var valueHtml = escapeHtml(data.value()).replace('"', '&quot;');
			var style = "";
			if (maxLength != null && maxLength <= 100) {
				style += "maxWidth: " + (maxLength + 1) + "ex;";
				style += "height: 1.5em;";
			}
			return '<textarea class="json-string" name="' + inputName + '" style="' + style + '">'
				+ valueHtml
				+ '</textarea>';
		},
		action: function (context, actionName, arg1) {
			if (actionName == 'new-value') {
				context.data.setValue(arg1);
			}
		},
		render: function (element, data, context) {
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
			
			var textarea = null;
			for (var i = 0; i < element.childNodes.length; i++) {
				if (element.childNodes[i].nodeType == 1) {
					textarea = element.childNodes[i];
					break;
				}
			}
			
			textarea.value = data.value()
			textarea.onkeyup = function () {
				updateNoticeBox(this.value);
			};
			textarea.onfocus = function () {
				updateNoticeBox(data.value());
			};
			textarea.onblur = function () {
				data.setValue(this.value);
				noticeBox.innerHTML = "";
			};
			element.appendChild(noticeBox);
			textarea = null;
			element = null;
		},
		update: function (element, data, context, operation) {
			if (operation.action() == "replace") {
				var textarea = null;
				for (var i = 0; i < element.childNodes.length; i++) {
					if (element.childNodes[i].nodeType == 1) {
						textarea = element.childNodes[i];
						break;
					}
				}				
				textarea.value = data.value()
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
		render: function (element, data) {
			var valueSpan = document.createElement("a");
			if (data.value()) {
				valueSpan.setAttribute("class", "json-boolean-true");
				valueSpan.innerHTML = "true";
			} else {
				valueSpan.setAttribute("class", "json-boolean-false");
				valueSpan.innerHTML = "false";
			}
			element.appendChild(valueSpan);
			if (!data.readOnly()) {
				valueSpan.setAttribute("href", "#");
				valueSpan.onclick = function (event) {
					data.setValue(!data.value());
					return false;
				};
			}
			valueSpan = null;
			element = null;
		},
		filter: function (data) {
			return data.basicType() == "boolean";
		}
	});
	
	// Edit number
	Jsonary.render.register({
		renderHtml: function (data, context) {
			var result = context.actionHtml('<span class="json-number">' + data.value() + '</span>', "input");
			
			var interval = data.schemas().numberInterval();
			if (interval != undefined) {
				var minimum = data.schemas().minimum();
				if (minimum == null || data.value() > minimum + interval || data.value() == (minimum + interval) && !data.schemas().exclusiveMinimum()) {
					result = context.actionHtml('<span class="json-number-decrement">-</span>', 'decrement') + result;
				}
				
				var maximum = data.schemas().maximum();
				if (maximum == null || data.value() < maximum - interval || data.value() == (maximum - interval) && !data.schemas().exclusiveMaximum()) {
					result += context.actionHtml('<span class="json-number-increment">+</span>', 'increment');
				}
			}
			return result;
		},
		action: function (context, actionName) {
			var data = context.data;
			var interval = data.schemas().numberInterval();
			if (actionName == "increment") {
				data.setValue(data.value() + interval);
			} else if (actionName == "decrement") {
				data.setValue(data.value() - interval);
			} else if (actionName == "input") {
				var newValueString = prompt("Enter number: ", data.value());
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

	// Cover the screen with an overlay
	function linkPrompt(link, event) {
		if ((link.method == "GET" || link.method == "DELETE") && link.submissionSchemas.length == 0) {
			link.follow();
		} else {
			var overlay = document.createElement("div");
			overlay.setAttribute("class", "prompt-overlay");
			document.body.appendChild(overlay);
			
			var buttonBox = document.createElement("div");
			buttonBox.setAttribute("class", "prompt-buttons");
			overlay.appendChild(buttonBox);
			
			var submitButton = document.createElement("input");
			submitButton.setAttribute("type", "button");
			submitButton.setAttribute("value", "Submit");
			submitButton.setAttribute("disabled", "disabled");
			buttonBox.appendChild(submitButton);
			
			var cancelButton = document.createElement("input");
			cancelButton.setAttribute("type", "button");
			cancelButton.setAttribute("value", "cancel");
			buttonBox.appendChild(cancelButton);
			cancelButton.onclick = function () {
				var overlay = this.parentNode.parentNode;
				overlay.parentNode.removeChild(overlay);
				return false;
			};

			var renderBox = document.createElement("div");
			renderBox.setAttribute("class", "prompt-data loading");
			overlay.appendChild(renderBox);

			link.createSubmissionData(function(submissionData) {
				renderBox.setAttribute("class", "prompt-data");
				Jsonary.render(renderBox, submissionData);
				submitButton.removeAttribute("disabled");
				submitButton.onclick = function() {
					var overlay = this.parentNode.parentNode;
					overlay.parentNode.removeChild(overlay);
					link.follow(submissionData);
					return false;
				};
				overlay = null;
				buttonBox = null;
				submitButton = null;
				cancelButton = null;
				renderBox = null;
			});
		}
	};
	Jsonary.render.linkPrompt = linkPrompt;

})();
