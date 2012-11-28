(function () {
	function escapeHtml(text) {
		return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
	}

	Jsonary.render.register({
		component: Jsonary.render.Components.ADD_REMOVE,
		renderHtml: function (data, context) {
			if (!data.defined()) {
				if (!data.readOnly()) {
					return context.actionHtml('<span class="json-undefined-create">+ create</span>', "create");
				}
				return "";
			}
			if (context.uiState.subState == undefined) {
				context.uiState.subState = {};
			}
			var showDelete = false;
			if (!data.readOnly() && data.parent() != null) {
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
			} else if (actionName == "remove") {
				context.data.remove();
			} else {
				alert("Unkown action: " + actionName);
			}
		},
		update: function () {
		},
		filter: function (data) {
			return true;
		}
	});

	Jsonary.render.register({
		component: Jsonary.render.Components.TYPE_SELECTOR,
		render: function (element, data, context) {
			var container = document.createElement("span");
			listSchemas(container, data.schemas());
			listLinks(container, data.links());
			element.insertBefore(container, element.childNodes[0]);
		},
		renderHtml: function (data, context) {
			if (context.uiState.subState == undefined) {
				context.uiState.subState = {};
			}
			if (data.readOnly()) {
				return context.renderHtml(data, context.uiState.subState);
			}
			var result = "";
			var decisionSchemas = data.schemas().decisionSchemas();
			var basicTypes = data.schemas().basicTypes();
			if (context.uiState.dialogOpen) {
				result += '<span class="json-select-type-dialog">';
				result += context.actionHtml('close', "closeDialog");
				decisionSchemas.each(function (index, schema) {
				});
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
			//if (decisionSchemas.length > 0 || basicTypes.length > 1) {
			// Only select basic types for now
			if (basicTypes.length > 1) {
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
			var pointerPath = data.pointerPath();
			return operation.subjectEquals(pointerPath) || operation.targetEquals(pointerPath);
		},
		filter: function (data) {
			return true;
		}
	});

	function listSchemas(element, schemaList) {
		var linkElement = null;
		schemaList.each(function (index, schema) {
			if (schema.title() == null) {
				return;
			}
			linkElement = document.createElement("a");
			linkElement.setAttribute("href", schema.referenceUrl());
			linkElement.setAttribute("class", "json-schema");
			linkElement.appendChild(document.createTextNode(schema.title()));
			element.appendChild(linkElement);
			linkElement.onclick = function () {
				alert(schema.referenceUrl() + "\n" + JSON.stringify(schema.data.value(), null, 4));
				return false;
			};
		});
		element = null;
		linkElement = null;
	}

	function listLinks(element, links) {
		var linkElement = null;
		for (var i = 0; i < links.length; i++) {
			(function (index, link) {
				linkElement = document.createElement("a");
				linkElement.setAttribute("href", link.href);
				linkElement.setAttribute("class", "json-link");
				linkElement.appendChild(document.createTextNode(link.rel));
				element.appendChild(linkElement);
				linkElement.onclick = function (event) {
					linkPrompt(link, event);
					return false;
				};
			})(i, links[i]);
		}
		element = null;
		linkElement = null;
	}
	
	// Display raw JSON
	Jsonary.render.register({
		render: function (element, data) {
			var spanElement = document.createElement("span");
			spanElement.setAttribute("class", "json-raw");
			spanElement.appendChild(document.createTextNode(JSON.stringify(data.value())));
			element.appendChild(spanElement);
			spanElement = null;
			element = null;
		},
		filter: function (data) {
			return data.readOnly();
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

	// Edit raw JSON
	Jsonary.render.register({
		render: function (element, data) {
			var textarea = document.createElement("textarea");
			textarea.setAttribute("class", "json-raw");
			textarea.value = JSON.stringify(data.value(), null, 4);
			updateTextAreaSize(textarea);
			textarea.setAttribute("class", "valid");
			textarea.onkeyup = function () {
				updateTextAreaSize(this);
				try {
					var jsonString = this.value;
					var value = JSON.parse(jsonString);
					this.setAttribute("class", "valid");
				} catch (e) {
					this.setAttribute("class", "invalid");
				}
			};
			textarea.onblur = function () {
				try {
					var jsonString = this.value;
					var value = JSON.parse(jsonString);
					data.setValue(value);
					this.setAttribute("class", "valid");
				} catch (e) {
					this.setAttribute("class", "invalid");
				}
			};
			element.appendChild(textarea);
			textarea = null;
			element = null;
		},
		filter: function (data) {
			return !data.readOnly();
		}
	});
	
	// Display/edit objects
	Jsonary.render.register({
		render: function (element, data) {
			element.appendChild(document.createTextNode("{"));
			var lastRow = null;
			data.properties(function (key, subData) {
				if (lastRow != null) {
					lastRow.appendChild(document.createTextNode(","));
				}
				var rowElement = document.createElement("div");
				rowElement.setAttribute('class', "json-object-pair");
				lastRow = rowElement;

				var keyElement = document.createElement("span");
				keyElement.setAttribute('class', "json-object-key");
				keyElement.appendChild(document.createTextNode(key));
				rowElement.appendChild(keyElement);
				rowElement.appendChild(document.createTextNode(": "));
			
				var valueElement = document.createElement("span");
				valueElement['class'] = "json-object-value";
				rowElement.appendChild(valueElement);
				Jsonary.render(valueElement, subData);
			
				element.appendChild(rowElement);
				
				rowElement = null;
				keyElement = null;
				valueElement = null;
			});
			if (!data.readOnly()) {
				var addLinkUsed = false;
				var addLink = document.createElement("span");
				addLink.setAttribute("class", "json-object-add");
				addLink.innerHTML = "add: ";
				var schemas = data.schemas();
				var definedProperties = schemas.definedProperties();
				for (var i = 0; i < definedProperties.length; i++) {
					(function (index, key) {
						if (!data.property(key).defined()) {
							var keyLink = document.createElement("a");
							keyLink.setAttribute("href", "#");
							keyLink.setAttribute("class", "json-object-add-key");
							keyLink.appendChild(document.createTextNode(key));
							addLink.appendChild(keyLink);
							keyLink.onclick = function () {
								data.schemas().createValueForProperty(key, function (newValue) {
									data.property(key).setValue(newValue);
								});
								return false;
							};
							keyLink = null;
							addLinkUsed = true;
						}
					})(i, definedProperties[i]);
				}
				if (schemas.allowedAdditionalProperties()) {
					var newKeyLink = document.createElement("a");
					newKeyLink.setAttribute("href", "#");
					newKeyLink.setAttribute("class", "json-object-add-key-new");
					newKeyLink.appendChild(document.createTextNode("+ new"));
					newKeyLink.onclick = function () {
						var newKey = prompt("New key:", "key");
						if (newKey !== null && !data.property(newKey).defined()) {
							data.schemas().createValueForProperty(newKey, function (newValue) {
								data.property(newKey).setValue(newValue);
							});
						}
						return false;
					};
					addLink.appendChild(newKeyLink);				
					addLinkUsed = true;
				}	
				if (addLinkUsed) {
					element.appendChild(addLink);
				}
				newKeyLink = null;
				addLink = null;
			}
			element.appendChild(document.createTextNode("}"));
			
			element = null;
		},
		filter: function (data) {
			return data.basicType() == "object";
		}
	});

	// Display/edit arrays
	Jsonary.render.register({
		render: function (element, data) {
			element.appendChild(document.createTextNode("["));
			var lastRow = null;
			var tupleTypingLength = data.schemas().tupleTypingLength();
			var minItems = data.schemas().minItems();
			var maxItems = data.schemas().maxItems();
			data.indices(function (index, subData) {
				if (lastRow != null) {
					lastRow.appendChild(document.createTextNode(","));
				}
				var rowElement = document.createElement("div");
				rowElement.setAttribute('class', "json-array-item");
				lastRow = rowElement;

				var valueElement = document.createElement("span");
				valueElement['class'] = "json-array-value";
				rowElement.appendChild(valueElement);
				Jsonary.render(valueElement, subData);
			
				element.appendChild(rowElement);
				
				rowElement = null;
				valueElement = null;
			});

			if (!data.readOnly()) {
				if (maxItems == null || data.length() < maxItems) {
					var addLink = document.createElement("span");
					addLink.setAttribute("class", "json-array-add");
					addLink.innerHTML = "+ add";
					addLink.onclick = function () {
						var index = data.length();
						data.schemas().createValueForIndex(index, function (newValue) {
							data.index(index).setValue(newValue);
						});
						return false;
					};
					element.appendChild(addLink);
					addLink = null;
				}
			}
			
			element.appendChild(document.createTextNode("]"));
			element = null;
		},
		filter: function (data) {
			return data.basicType() == "array";
		}
	});
	
	// Display string
	Jsonary.render.register({
		render: function (element, data) {
			var textspan = document.createElement("span");
			textspan.setAttribute("class", "json-string");
			textspan.appendChild(document.createTextNode(data.value()));
			element.appendChild(textspan);
		},
		filter: function (data) {
			return data.basicType() == "string" && data.readOnly();
		}
	});

	// Edit string
	Jsonary.render.register({
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
			var textarea = document.createElement("textarea");
			textarea.setAttribute("class", "json-string");
			textarea.value = data.value()
			updateTextAreaSize(textarea);
			textarea.onkeyup = function () {
				updateTextAreaSize(this);
				updateNoticeBox(this.value);
			};
			textarea.onfocus = function () {
				updateNoticeBox(data.value());
			};
			textarea.onblur = function () {
				data.setValue(this.value);
				noticeBox.innerHTML = "";
			};
			element.appendChild(textarea);
			element.appendChild(noticeBox);
			textarea = null;
			element = null;
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
		render: function (element, data) {
			var valueSpan = document.createElement("a");
			valueSpan.setAttribute("href", "#");
			valueSpan.setAttribute("class", "json-number");
			valueSpan.appendChild(document.createTextNode(data.value()));
			var interval = data.schemas().numberInterval();
			valueSpan.onclick = function () {
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
				return false;
			};
			element.appendChild(valueSpan);
			if (interval != undefined) {
				var increment = document.createElement("a");
				increment.appendChild(document.createTextNode("+"));
				increment.setAttribute("class", "json-number-increment");
				increment.setAttribute("href", "#");
				increment.onclick = function () {
					data.setValue(data.value() + interval);
					return false;
				};
				element.appendChild(increment);
				
				var decrement = document.createElement("a");
				decrement.appendChild(document.createTextNode("-"));
				decrement.setAttribute("class", "json-number-decrement");
				decrement.setAttribute("href", "#");
				decrement.onclick = function () {
					data.setValue(data.value() - interval);
					return false;
				};
				element.insertBefore(decrement, valueSpan);
				decrement = null;
			}
			valueSpan = null;
			element = null;
		},
		filter: function (data) {
			return (data.basicType() == "number" || data.basicType() == "integer") && !data.readOnly();
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
