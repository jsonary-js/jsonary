var exampleData = {
    "title": "Example data",
    "link_url": "link",
    "other_key": 5
}

var exampleSchemaData = {
    links: [
        {
            href: "prefix_{link_url}_suffix",
            rel: "test"
        }
    ]
};

var inferralSchemaData = {
    links: [
        {
            href: "{+schema_url}",
            rel: "describedby"
        }
    ]
};

tests.add("Inserting link", function() {
    var i;

    var schemas, links;
    var data = Jsonary.create(exampleData);
    var link = {
        "href": "http://example.com/linktome",
        "rel": "test"
    };
    data.addLink(link);
    schemas = data.schemas();
    links = data.links();
    this.assert(schemas.length == 0, "No schemas should be present");    
    this.assert(links.length == 1, "There should be exactly one link: " + JSON.stringify(links.length));
    this.assert(links[0].href == link.href, "There should be exactly one link");
    this.assert(links[0] + "" == link.href, "link + \"\" == link.href");
    return true;
});

tests.add("asLink()", function() {
    var linkDefinition = Jsonary.create({
        "href": "http://example.com/linktome",
        "rel": "test"
    });
    var link = linkDefinition.asLink();
    this.assert(link.href == linkDefinition.propertyValue("href"), "hrefs should match");
    return true;
});

tests.add("Data-dependant link", function() {
    var values = [undefined, 5, [], "test", {}, null, undefined];
    var expectedLinks = [null, "prefix_5_suffix", "prefix__suffix", "prefix_test_suffix", "prefix__suffix", null, null];
    var schemas, links, link;
    var data = Jsonary.create(exampleData);

    data.addSchema(Jsonary.createSchema(exampleSchemaData));
    schemas = data.schemas();
    links = data.links();
    this.assert(schemas.length == 1, "Exactly one schema should be present");    
    this.assert(links.length == 1, "There should be exactly one link after the schema has been added");

    for (var i = 0; i < values.length; i++) {
        data.property("link_url").setValue(values[i]);
        schemas = data.schemas();
        links = data.links();
        if (expectedLinks[i] == null) {
            this.assert(links.length == 0, "There should be no links after link_url was changed to " + JSON.stringify(values[i]));
        } else {
            this.assert(links.length == 1, "There should be exactly one link after link_url was changed to " + JSON.stringify(values[i]));
            link = links[0];
            this.assert(link.href === expectedLinks[i], "Link from " + JSON.stringify(values[i]) + " should be " + JSON.stringify(expectedLinks[i]) + " not " + JSON.stringify(link.href));
        }
    }
    return true;
});

tests.add("Inferred schema", function() {
    var schema_url = "http://example.com/inferred-schema";
    Jsonary.addToCache(schema_url, exampleSchemaData);

    var schemas, links, link, potentialLinks;
    var data = Jsonary.create(exampleData);
    var schemaKey = Jsonary.getMonitorKey();
    data.addSchema(Jsonary.createSchema(inferralSchemaData), schemaKey);
    
    schemas = data.schemas();
    links = data.links();
    potentialLinks = schemas.potentialLinks();
    this.assert(potentialLinks.length == 1, "Exactly one potential link should be present");
    this.assert(potentialLinks[0].rel() === "describedby", "Link should have rel=\"describedby\"");
    this.assert(schemas.length == 1, "Exactly one schema should be present");    
    this.assert(links.length == 0, "There should no links after the schema has been added");

    data.property("schema_url").setValue(schema_url);
    schemas = data.schemas();
    links = data.links();
    this.assert(schemas.length == 2, "Once the schema_url property has been set, there should be two schemas");    
    this.assert(links.length == 2, "There should be two links after the schema_url property has been set, not " + links.length);

    data.removeProperty("schema_url");
    schemas = data.schemas();
    links = data.links();
    this.assert(schemas.length == 1, "Once the schema_url property has been removed, there should be only one schema");
    this.assert(links.length == 0, "There should be no links after the schema_url property has been removed");

    data.property("schema_url").setValue(schema_url);
    schemas = data.schemas();
    links = data.links();
    this.assert(schemas.length == 2, "Once the schema_url property has been set again, there should be two schemas");    
    this.assert(links.length == 2, "There should be two links after the schema_url property has been set again");
    
    data.removeSchema(schemaKey);
    schemas = data.schemas();
    links = data.links();
    this.assert(schemas.length == 0, "After the original schema was removed, there should be no schemas left");    
    this.assert(links.length == 0, "There should be no links after the original schema has been removed");

    return true;
});

tests.add("Self links", function () {
	var schema = Jsonary.createSchema({
		additionalProperties: {"$ref": "#"},
		items: {"$ref": "#"},
		links: [
			{
				"rel": "self",
				"href": "{+self}"
			},
			{
				"rel": "other",
				"href": "{+other}"
			}
		]
	});
	var data = Jsonary.create({
		other: "test1",
		subData: {
			"self": "test2/",
			"other": "test3"
		}
	}).addSchema(schema);
	
	this.assert(data.links().length == 1, "One link for root item");
	this.assert(data.links()[0].rel == "other", "One link for root item: other");
	this.assert(data.links()[0].href == "test1", "One link for root item: test1");

	var subData = data.property("subData");
	this.assert(subData.links().length == 2, "One link for subData item");
	this.assert(subData.links("self")[0].href == "test2/", "test2/");
	this.assert(subData.links("other")[0].href == "test2/test3", "test2/test3");
	
	data.property("self").setValue("prefix/");
	this.assert(data.links("other")[0].href == "prefix/test1", "prefix/test1");
	this.assert(subData.links("self")[0].href == "prefix/test2/", "prefix/test2/");
	this.assert(subData.links("other")[0].href == "prefix/test2/test3", "prefix/test2/test3");

	data.property("self").setValue("prefix2/");
	this.assert(data.links("other")[0].href == "prefix2/test1", "prefix2/test1");
	this.assert(subData.links("self")[0].href == "prefix2/test2/", "prefix2/test2/");
	this.assert(subData.links("other")[0].href == "prefix2/test2/test3", "prefix2/test2/test3");
	
	data.property("self").remove();
	this.assert(data.links()[0].href == "test1", "returns to: test1");
	this.assert(subData.links("self")[0].href == "test2/", "returns to: test2/");
	this.assert(subData.links("other")[0].href == "test2/test3", "returns to: test2/test3");
	
	return true;
});
