(function () {
	Jsonary.render.register({
		render: function (element, data) {
			var schema = data.asSchema();
			var container = document.createElement("div");
			container.className = "schema";
			element.appendChild(container);
			
			var titleSpan = document.createElement("div");
			titleSpan.className = "schema-title";
			Jsonary.render(titleSpan, data.property("title"));
			container.appendChild(titleSpan);
			
			var propertiesTitle = document.createElement("div");
			propertiesTitle.className = "schema-section-title";
			propertiesTitle.appendChild(document.createTextNode("Properties:"));
			container.appendChild(propertiesTitle);
			var propertiesDiv = document.createElement("div");
			propertiesDiv.className = "schema-section";
			Jsonary.render(propertiesDiv, data.property("properties"));
			container.appendChild(propertiesDiv);
			
			var additionalPropertiesTitle = document.createElement("div");
			additionalPropertiesTitle.className = "schema-section-title";
			additionalPropertiesTitle.appendChild(document.createTextNode("Additional properties:"));
			container.appendChild(additionalPropertiesTitle);
			var additionalPropertiesDiv = document.createElement("div");
			additionalPropertiesDiv.className = "schema-section";
			Jsonary.render(additionalPropertiesDiv, data.property("additionalProperties"));
			container.appendChild(additionalPropertiesDiv);
			
			element = null;
			container = null;
		},
		filter: function (data, schemas) {
			return schemas.containsUrl("http://json-schema.org/hyper-schema");
		},
		update: function (element, data, operation) {
			if (operation.depthFrom(data.pointerPath()) <= 2) {
				this.render(element, data);
			}
		}
	});
	
	Jsonary.addToCache("http://json-schema.org/hyper-schema", {
		"title": "JSON Schema",
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
})();
