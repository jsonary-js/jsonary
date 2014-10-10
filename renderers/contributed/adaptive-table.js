// Generic renderer for arrays
// Requires "render.table" and "render.generator" plugins
Jsonary.render.register(Jsonary.plugins.Generator({
    name: "Adaptive table",
    // Part of the generator plugin - this function returns a renderer based on the data/schema requirements
    rendererForData: function (data) {
        var FancyTableRenderer = Jsonary.plugins.FancyTableRenderer;

        var detectedPagingLinks = !!(data.getLink('next') || data.getLink('prev'));
        var isShort = data.readOnly() && data.length() < (Jsonary && Jsonary.options && Jsonary.options.adaptive_table && Jsonary.options.adaptive_table.pagingRows ? Jsonary.options.adaptive_table.pagingRows : 15);

        var renderer = new FancyTableRenderer({
            sort: {},
            rowsPerPage: (isShort || detectedPagingLinks) ? null : [15, 5, 30, 100]
        });
        var columnsObj = {};

        function addColumnsFromSchemas(schemas, pathPrefix, depthRemaining) {
            schemas = schemas.getFull();

            pathPrefix = pathPrefix || "";
            var basicTypes = schemas.basicTypes();

            // If the data might not be an object, add a column for it
            if ((basicTypes.length != 1 || basicTypes[0] != "object" || depthRemaining <= 0) && !schemas.hidden()) {
                var column = pathPrefix;
                if (!columnsObj[column]) {
                    columnsObj[column] = true;
                    renderer.addColumn(column, schemas.title() || column, function (data, context) {
                        if (data.basicType() == "object" && depthRemaining < 0) {
                            return '<td class="jsonary-recursion-limit-reached">...</td>';
                        } else {
                            return this.defaultCellRenderHtml(data, context, column);
                        }
                    });
                    var isScalar = basicTypes.length == 1 && basicTypes[0] !== 'object' && basicTypes[0] !== 'array';
                    if (!detectedPagingLinks && isScalar) {
                        // add sorting
                        renderer.config.sort[column] = true;
                    }
                }
            }

            // If the data might be an object, add columns for its links/properties
            if (basicTypes.indexOf('object') != -1 && depthRemaining > 0) {
                if (data.readOnly()) {
                    var links = schemas.links();
                    for (var i = 0; i < links.length; i++) {
                        var link = links[i];
                        addColumnsFromLink(link, i);
                    }
                }
                var knownProperties = schemas.knownProperties();
                var knownPropertyIndices = [];
                // Sort object properties by displayOrder
                var knownPropertyOrder = {};
                for (var i = 0; i < knownProperties.length; i++) {
                    knownPropertyIndices.push(i);
                    var key = knownProperties[i];
                    knownPropertyOrder[key] = schemas.propertySchemas(key).displayOrder();
                }
                knownPropertyIndices.sort(function (indexA, indexB) {
                    var keyA = knownProperties[indexA];
                    var keyB = knownProperties[indexB];
                    if (knownPropertyOrder[keyA] == null) {
                        if (knownPropertyOrder[keyB] == null) {
                            return indexA - indexB;
                        }
                        return 1;
                    } else if (knownPropertyOrder[keyB] == null) {
                        return -1;
                    }
                    return knownPropertyOrder[keyA] - knownPropertyOrder[keyB];
                });
                // Iterate over the potential properties
                for (var i = 0; i < knownPropertyIndices.length; i++) {
                    var key = knownProperties[knownPropertyIndices[i]];
                    if (!schemas.propertySchemas(key).hidden()) {
                        addColumnsFromSchemas(schemas.propertySchemas(key), pathPrefix + Jsonary.joinPointer([key]), depthRemaining - 1);
                    }
                }
            }
        }

        function addColumnsFromLink(linkDefinition, index) {
            var columnName = "link$" + index + "$" + linkDefinition.rel();

            var columnTitle = Jsonary.escapeHtml(linkDefinition.data.property("title").value() || linkDefinition.rel());
            var linkText = columnTitle;
            var activeText = null, isConfirm = true;
            if (linkDefinition.rel() == 'edit') {
                activeText = 'save';
            }

            renderer.addLinkColumn(linkDefinition, linkDefinition.rel(), columnTitle, linkText, activeText, isConfirm);
        }

        var itemSchemas = data.schemas().indexSchemas(0).getFull();
        var recursionLimit = (itemSchemas.knownProperties().length >= 8) ? 0 : 1;
        if (data.schemas().displayAsTable()) {
            recursionLimit = 2;
        }
        addColumnsFromSchemas(itemSchemas, '', recursionLimit);
        return renderer;
    },
    filter: function (data, schemas) {
        if (data.basicType() == "array") {
            if (schemas.displayAsTable()) {
                return true;
            }
            // Array full of objects
            if (!schemas.tupleTyping()) {
                var indexSchemas = schemas.indexSchemas(0).getFull();
                var itemTypes = indexSchemas.basicTypes();
                if (itemTypes.length == 1 && itemTypes[0] == "object") {
                    if (indexSchemas.additionalPropertySchemas().length > 0) {
                        return false;
                    }
                    if (indexSchemas.knownProperties().length < 20) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}));

// Display-order extension (non-standard keyword)
Jsonary.extendSchema({
    displayOrder: function () {
        return this.data.propertyValue("displayOrder");
    }
});
Jsonary.extendSchemaList({
    displayOrder: function () {
        var displayOrder = null;
        this.each(function (index, schema) {
            var value = schema.displayOrder();
            if (value != null && (displayOrder == null || value < displayOrder)) {
                displayOrder = value;
            }
        });
        return displayOrder;
    }
});

// displayAsTable extension (non-standard keyword, suggested by Ognian)
Jsonary.extendSchema({
    displayAsTable: function () {
        return !!this.data.propertyValue("displayAsTable");
    }
});
Jsonary.extendSchemaList({
    displayAsTable: function () {
        var displayAsTable = false;
        this.each(function (index, schema) {
            displayAsTable = displayAsTable || schema.displayAsTable();
        });
        return displayAsTable;
    }
});

// hidden extension (non-standard keyword, suggested by Ognian)
Jsonary.extendSchema({
    hidden: function () {
        return !!this.data.propertyValue("hidden");
    }
});
Jsonary.extendSchemaList({
    hidden: function () {
        var hidden = false;
        this.each(function (index, schema) {
            hidden = hidden || schema.hidden();
        });
        return hidden;
    }
});
