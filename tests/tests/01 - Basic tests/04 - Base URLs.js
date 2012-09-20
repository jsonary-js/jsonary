var exampleData = [0,{"test":2},2,3,4];

tests.add("Base url", function() {
    var baseUrl = "http://example.com/test.json";
    var data = Jsonary.create(exampleData, baseUrl);
    var data2 = Jsonary.create(exampleData, baseUrl + "#");

    var expectedUrl = baseUrl + "#";
    this.assert(data.referenceUrl() === expectedUrl, "data.referenceUrl(): " + JSON.stringify(data.referenceUrl()) + " does not match " + JSON.stringify(expectedUrl));
    this.assert(data2.referenceUrl() === expectedUrl, "data2.referenceUrl(): " + JSON.stringify(data2.referenceUrl()) + " does not match " + JSON.stringify(expectedUrl));
    return true;
});

tests.add("Sub-data fragments", function() {
    var expectedUrl, actual;
    var baseUrl = "http://example.com/test.json";
    var data = Jsonary.create(exampleData, baseUrl);
    var data2 = Jsonary.create(exampleData, baseUrl + "#not_a_pointer");

    expectedUrl = baseUrl + "#/0";
    actual = data.index(0).referenceUrl();
    this.assert(actual === expectedUrl, "data.index(0).referenceUrl(): " + JSON.stringify(actual) + " does not match " + JSON.stringify(expectedUrl));

    expectedUrl = baseUrl + "#/1/test";
    actual = data.index(1).property("test").referenceUrl();
    this.assert(actual === expectedUrl, "data.index(1).property(\"test\").referenceUrl(): " + JSON.stringify(actual) + " does not match " + JSON.stringify(expectedUrl));

    actual = data2.index(0).referenceUrl();
    this.assert(actual === undefined, "data2.index(0).referenceUrl() should be undefined, not " + actual);
    return true;
});


tests.add("Shifting fragments with removeIndex()", function() {
    var expectedUrl, actual;
    var baseUrl = "http://example.com/test.json";
    var data = Jsonary.create(exampleData, baseUrl);
    var data2 = Jsonary.create(exampleData, baseUrl + "#not_a_pointer");

    expectedUrl = baseUrl + "#/0";
    actual = data.index(0).referenceUrl();
    this.assert(actual === expectedUrl, "data.index(0).referenceUrl(): " + JSON.stringify(actual) + " does not match " + JSON.stringify(expectedUrl));

    expectedUrl = baseUrl + "#/1/test";
    actual = data.index(1).property("test").referenceUrl();
    this.assert(actual === expectedUrl, "data.index(1).property(\"test\").referenceUrl(): " + JSON.stringify(actual) + " does not match " + JSON.stringify(expectedUrl));

    data.removeIndex(0);
    expectedUrl = baseUrl + "#/0/test";
    actual = data.index(0).property("test").referenceUrl();
    this.assert(actual === expectedUrl, "after removIndex(0), data.index(0).property(\"test\").referenceUrl(): " + JSON.stringify(actual) + " does not match " + JSON.stringify(expectedUrl));

    actual = data2.index(0).referenceUrl();
    this.assert(actual === undefined, "data2.index(0).referenceUrl() should be undefined");
    return true;
    
});


