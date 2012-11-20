var testRenderer = new Jsonary.TableRenderer();
testRenderer.addColumn("number", "Number");
testRenderer.addColumn("text", "Text");
testRenderer.addColumn("alt", "");
testRenderer.filter = function (data, schemas) {
	return schemas.containsUrl("test-table.json");
};

testRenderer.style.addClass = "test-table-add";
testRenderer.style.addHtml = "+ add row";

Jsonary.render.register(testRenderer);
