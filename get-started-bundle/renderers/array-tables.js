// Generic renderer for arrays
// Requires "render.table" and "render.generator" plugins
Jsonary.render.register(Jsonary.plugins.Generator({
	rendererForData: function (data) {
		var renderer = new Jsonary.plugins.LinkTableRenderer();
		var columnsObj = {};
		function addColumnsFromSchemas(schemas, pathPrefix) {
			schemas = schemas.getFull();
			pathPrefix = pathPrefix || "";
			var basicTypes = schemas.basicTypes();
			
			if (basicTypes.length != 1 || basicTypes[0] != "object") {
				var column = pathPrefix;
				if (!columnsObj[column]) {
					columnsObj[column] = true;
					renderer.addColumn(column, schemas.title() || column, function (data, context) {
						if (data.basicType() == "object") {
							return '<td></td>';
						} else {
							return this.defaultCellRenderHtml(data, context);
						}
					});
				}
			}

			if (basicTypes.indexOf('object') != -1) {
				var knownProperties = schemas.knownProperties();
				for (var i = 0; i < knownProperties.length; i++) {
					var key = knownProperties[i];
					addColumnsFromSchemas(schemas.propertySchemas(key), pathPrefix + Jsonary.joinPointer([key]));
				}
			}
		}
		function addColumnsFromLink(linkDefinition, index) {
			var columnName = "link$" + index + "$" + linkDefinition.rel();
			
			var columnTitle = Jsonary.escapeHtml(linkDefinition.title || linkDefinition.rel());
			var linkText = columnTitle;
			var activeText = null, isConfirm = true;
			if (linkDefinition.rel() == 'edit') {
				activeText = 'save';
			}
			
			renderer.addLinkColumn(linkDefinition, columnTitle, linkText, activeText, isConfirm);
		}
		var itemSchemas = data.schemas().indexSchemas(0).getFull();
		if (data.readOnly()) {
			var links = itemSchemas.links();
			for (var i = 0; i < links.length; i++) {
				var link = links[i];
				addColumnsFromLink(link, i);
			}
		}
		addColumnsFromSchemas(itemSchemas);
		return renderer;
	},
	filter: function (data, schemas) {
		if (data.basicType() == "array") {
			if (data.readOnly()) {
				return true;
			}
			if (!schemas.tupleTyping()) {
				var indexSchemas = schemas.indexSchemas(0);
				var itemTypes = indexSchemas.basicTypes();
				if (itemTypes.length == 1 && itemTypes[0] == "object") {
					return true;
				}
			}
		}
		return false;
	}
}));