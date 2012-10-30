(function () {
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
			listLinks(element, data.links());
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
			listLinks(element, data.links());
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
		render: function (element, data, context, uiState) {
			element.appendChild(document.createTextNode("{"));
			listLinks(element, data.links());
			data.properties(function (key, subData) {
				var rowElement = document.createElement("div");
				rowElement.setAttribute('class', "json-object-pair");

				var keyElement = document.createElement("span");
				keyElement.setAttribute('class', "json-object-key");
				keyElement.appendChild(document.createTextNode(key));
				rowElement.appendChild(keyElement);
				rowElement.appendChild(document.createTextNode(": "));
			
				var valueElement = document.createElement("span");
				valueElement['class'] = "json-object-value";
				rowElement.appendChild(valueElement);
				context.render(valueElement, subData, uiState);
			
				element.appendChild(rowElement);
				
				if (!data.readOnly()) {
					var deleteLink = document.createElement("a");
					deleteLink.setAttribute("href", "#");
					deleteLink.setAttribute("class", "json-object-delete");
					deleteLink.appendChild(document.createTextNode("X"));
					deleteLink.onclick = function () {
						data.removeProperty(key);
						return false;
					}
					rowElement.insertBefore(deleteLink, keyElement);
					deleteLink = null;
				}
				rowElement = null;
				keyElement = null;
				valueElement = null;
			});
			if (!data.readOnly()) {
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
						}
					})(i, definedProperties[i]);
				}
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
				element.appendChild(addLink);
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
		render: function (element, data, context, uiState) {
			listLinks(element, data.links());
			data.indices(function (index, subData) {
				var rowElement = document.createElement("div");
				rowElement.setAttribute('class', "json-array-item");

				var valueElement = document.createElement("span");
				valueElement['class'] = "json-array-value";
				rowElement.appendChild(valueElement);
				context.render(valueElement, subData, uiState);
			
				element.appendChild(rowElement);
				
				if (!data.readOnly()) {
					var deleteLink = document.createElement("a");
					deleteLink.setAttribute("href", "#");
					deleteLink.setAttribute("class", "json-object-delete");
					deleteLink.appendChild(document.createTextNode("X"));
					deleteLink.onclick = function () {
						data.removeIndex(index);
						return false;
					}
					rowElement.insertBefore(deleteLink, valueElement);
					deleteLink = null;
				}
				rowElement = null;
				valueElement = null;
			});

			if (!data.readOnly()) {
				var addLink = document.createElement("span");
				addLink.setAttribute("class", "json-array-add");
				addLink.innerHTML = "+ add";
				addLink.onclick = function () {
					var index = data.length();
					data.schemas().createValueForIndex(index, function (newValue) {
						data.index(data.length()).setValue(newValue);
					});
					return false;
				};
				element.appendChild(addLink);
				addLink = null;
			}
			
			element = null;
		},
		filter: function (data) {
			return data.basicType() == "array";
		}
	});
	
	// Display string
	Jsonary.render.register({
		render: function (element, data) {
			listLinks(element, data.links());
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
		render: function (element, data) {
			listLinks(element, data.links());
			var textarea = document.createElement("textarea");
			textarea.setAttribute("class", "json-string");
			textarea.value = data.value()
			updateTextAreaSize(textarea);
			textarea.onkeyup = function () {
				updateTextAreaSize(this);
			};
			textarea.onblur = function () {
				data.setValue(this.value);
			};
			element.appendChild(textarea);
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
			listLinks(element, data.links());
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
			listLinks(element, data.links());
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

	// Display undefined JSON
	Jsonary.render.register({
		render: function (element, data) {
			if (!data.readOnly()) {
				var parent = data.parent();
				var pointerComponent = Jsonary.splitPointer(data.pointerPath());
				var finalComponent = pointerComponent.pop();
				if (parent != null) {
					var addLink = document.createElement("a");
					addLink.href = "#";
					addLink.className = "json-undefined-create";
					addLink.innerHTML = "+" + finalComponent;
					addLink.onclick = function () {
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
						return false;
					};
					element.appendChild(addLink);
					addLink = null;
				}
			}
		},
		filter: function (data) {
			return !data.defined();
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
