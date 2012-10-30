(function ($) {
	Jsonary.render.register({
		render: function (element, data) {
			var links = data.links();
			var linkContainer = document.createElement("div");
			element.insertBefore(linkContainer, element.childNodes[0]);
			for (var i = 0; i < links.length; i++) {
				(function (link) {
					var linkNode = document.createElement("a");
					linkNode.innerText = link.rel;
					linkNode.className = "json-link";
					linkNode.setAttribute("href", link.href);
					linkNode.onclick = function (e) {
						Jsonary.render.linkPrompt(link, e);
						return false;
					};
					linkContainer.appendChild(linkNode);
					linkNode = null;
				})(links[i]);
			}
			
		},
		renderHtml: function (data, context) {
			var result = '<h1 class="api-object-title">' + context.renderHtml(data.property("title")) + "</h1>";
			result += '<div class="api-object">';
			result += '<div class="api-description">' + context.renderHtml(data.property("description")) + "</div>"
			result += '<h2>Properties:</h2>';
			result += '<div class="api-section">' + context.renderHtml(data.property("properties"), {size: "small"}) + '</div>';
			result += '<h2>Methods:</h2>';
			result += '<div class="api-section">' + context.renderHtml(data.property("methods"), {size: "small"}) + '</div>';
			result += '</div>';
			return result;
		},
		filter: function (data, schemas) {
			return schemas.containsUrl("api-schema.json#/objectDefinition") && !data.property("$ref").defined() && (data.propertyValue("type") == "object");
		}
	});

	Jsonary.render.register({
		render: function (element, data) {
		},
		renderHtml: function (data, context) {
			result = "";
			result += '<div class="api-function">';
			result += '<div class="api-function-signature">' + data.parentKey() + '(<span class="api-function-argument">';
			data.property("arguments").items(function(index, subData) {
				if (index > 0) {
					result += '</span>, <span class="api-function-argument">';
				}
				if (subData.property("title").defined()) {
					result += subData.propertyValue("title");
				} else {
					result += "arg" + (index + 1);
				}
			});
			result += '</span>)</div>';
			result += '<div class="api-description">' + context.renderHtml(data.property("description")) + "</div>"
			result += '<h2>Arguments</h2>';
			result += '<div class="api-section">' + context.renderHtml(data.property("arguments"), {size:"small"}) + '</div>';
			result += '<h2>Return value</h2>';
			result += '<div class="api-section">' + context.renderHtml(data.property("return"), {size:"small"}) + '</div>';
			result += '</div>';
			return result;
		},
		update: function (element, data, operation) {
			var path = data.pointerPath();
			var depth = operation.depthFrom(path);
			if (depth <= 2 && operation.hasPrefix(path + "/arguments")) {
				this.render(element, data);
			}
			this.defaultUpdate(element, data, operation);
		},
		filter: function (data, schemas) {
			return schemas.containsUrl("api-schema.json#/functionDefinition");
		}
	});

	Jsonary.render.register({
		render: function (element, data) {
			var query = $(element);
			var expandBar = $(element.childNodes[0]);
			var container = $(element.childNodes[1]);
			var renderedFull = false;
			var displayingFull = false;
			var switchLink = expandBar.find("a").click(function () {
				if (!renderedFull) {
					fullContainer.renderJson(data);
					renderedFull = true;
				}
				if (displayingFull) {
					fullContainer.slideUp(function () {
						switchLink.text("show full schema");
						container.slideDown(100);
					});
				} else {
					container.slideUp(100, function () {
						switchLink.text("hide full schema");
						fullContainer.slideDown();
					});
				}
				displayingFull = !displayingFull;
			});
			var fullContainer = $('<div class="schema-expand-full"></div>').hide().appendTo(query);
		},
		renderHtml: function (data) {
			result = "";
			result += '<div class="schema-expand-bar"><a class="schema-expand">show full schema</a></div>';
			result += '<div class="api-function">';
			result += '<div class="api-function-signature">' + data.parentKey() + '(<span class="api-function-argument">';
			data.property("arguments").items(function(index, subData) {
				if (index > 0) {
					result += '</span>, <span class="api-function-argument">';
				}
				if (subData.property("title").defined()) {
					result += subData.propertyValue("title");
				} else {
					result += "arg" + (index + 1);
				}
			});
			result += '</span>)</div>';
			result += '</div>';
			return result;
		},
		update: function (element, data, operation) {
			var path = data.pointerPath();
			var depth = operation.depthFrom(path);
			if (depth <= 2 && operation.hasPrefix(path + "/arguments")) {
				this.render(element, data);
			}
			this.defaultUpdate(element, data, operation);
		},
		filter: function (data, schemas, uiState) {
			return uiState.size == "small" && schemas.containsUrl("api-schema.json#/functionDefinition");
		}
	});
	
	Jsonary.render.register({
		render: function (element, data) {
		},
		renderHtml: function (data) {
			var keys = data.keys();
			keys.sort();
			var result = "";
			for (var i = 0; i < keys.length; i++) {
				if (!data.readOnly()) {
					result += this.actionHtml("remove", data.property(keys[i]), '<div class="api-function-remove">[X]</div>');
				}
				result += Jsonary.renderHtml(data.property(keys[i]));
			}
			if (!data.readOnly()) {
				result += this.actionHtml("add", data, '<div class="api-function-add">+ add</div>');
			}
			return result;
		},
		action: function (actionName, data) {
			if (actionName == "add") {
				var newKey = prompt("New function name:");
				if (newKey != null && !data.property(newKey).defined()) {
					data.schemas().createValueForProperty(newKey, function (newValue) {
						data.property(newKey).setValue(newValue);
					});
				}
			} else if (actionName == "remove") {
				data.remove();
			}
		},
		update: function (element, data, operation) {
			this.defaultUpdate(element, data, operation);
		},
		filter: function (data, schemas) {
			return schemas.containsUrl("api-schema.json#/objectDefinition/properties/methods");
		}
	});
	
})(jQuery);
