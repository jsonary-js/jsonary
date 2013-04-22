var testRenderer = new Jsonary.TableRenderer();
testRenderer.addColumn("number", "Number", true);
testRenderer.addColumn("text", "Text", true);
testRenderer.addColumn("alt", "");
testRenderer.filter = function (data, schemas) {
	return schemas.containsUrl("test-table.json");
};

testRenderer.config.addClass = "test-table-add";
testRenderer.config.addHtml = "+ add row";

var renderer = Jsonary.render.register(testRenderer);

Jsonary.render.deregister(renderer);