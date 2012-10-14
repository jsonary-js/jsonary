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
		renderHtml: function (data) {
			var result = '<h1 class="api-object-title">' + Jsonary.renderHtml(data.property("title")) + "</h1>";
			result += '<div class="api-object">';
			result += '<div class="api-description">' + Jsonary.renderHtml(data.property("description")) + "</div>"
			result += '<h2>Properties:</h2>';
			result += '<div class="api-section">' + Jsonary.renderHtml(data.property("properties")) + '</div>';
			result += '<h2>Methods:</h2>';
			result += '<div class="api-section">' + Jsonary.renderHtml(data.property("methods")) + '</div>';
			result += '</div>';
			return result;
		},
		filter: function (data, schemas) {
			return schemas.containsUrl("api-schema.json#/objectDefinition") && !data.property("$ref").defined();
		}
	});

	Jsonary.render.register({
		render: function (element, data) {
		},
		renderHtml: function (data) {
			var result = '<h1 class="api-function-title">' + Jsonary.renderHtml(data.property("title")) + "</h1>";
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
			result += '<h2>Arguments</h2>';
			result += '<div class="api-section">' + Jsonary.renderHtml(data.property("arguments"), "small") + '</div>';
			result += '<h2>Return value</h2>';
			result += '<div class="api-section">' + Jsonary.renderHtml(data.property("return"), "small") + '</div>';
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
	
})(jQuery);
