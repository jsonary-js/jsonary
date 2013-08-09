tests.add("Basic string value", function () {
	var link = Jsonary.create({
		"rel": "test",
		"href": "/prefix/{exampleVar}/suffix"
	}).asLink();
	var url = "/prefix/exampleValue/suffix";
	var expected = {
		exampleVar: "exampleValue"
	};
	
	var value = link.valueForUrl(url);
	var reconstructed = link.definition.linkForData(Jsonary.create(value));
	this.assert(recursiveCompare(value, expected), JSON.stringify(value) + " != " + JSON.stringify(expected));
	this.assert(reconstructed.href == url, JSON.stringify(reconstructed.href) + " != " + JSON.stringify(url));
	return true;
});

tests.add("Percent-decoding", function () {
	var link = Jsonary.create({
		"rel": "test",
		"href": "/prefix/{exampleVar}/suffix"
	}).asLink();
	var url = "/prefix/example%20value%23%2525/suffix";
	var expected = {
		exampleVar: "example value#%25"
	};
	
	var value = link.valueForUrl(url);
	var reconstructed = link.definition.linkForData(Jsonary.create(value));
	this.assert(recursiveCompare(value, expected), JSON.stringify(value) + " != " + JSON.stringify(expected));
	this.assert(reconstructed.href == url, JSON.stringify(reconstructed.href) + " != " + JSON.stringify(url));
	return true;
});

tests.add("Without percent-decoding", function () {
	var link = Jsonary.create({
		"rel": "test",
		"href": "/prefix/{+exampleVar}/suffix"
	}).asLink();
	var url = "/prefix/example+value%23%2525/suffix";
	var expected = {
		exampleVar: "example+value%23%2525"
	};
	
	var value = link.valueForUrl(url);
	var reconstructed = link.definition.linkForData(Jsonary.create(value));
	this.assert(recursiveCompare(value, expected), JSON.stringify(value) + " != " + JSON.stringify(expected));
	this.assert(reconstructed.href == url, JSON.stringify(reconstructed.href) + " != " + JSON.stringify(url));
	return true;
});

tests.add("Variable extraction with / and plain array", function () {
	var link = Jsonary.create({
		"rel": "test",
		"href": "/prefix{/exampleVar}/suffix"
	}).asLink();
	var url = "/prefix/a,b,c/suffix";
	var expected = {
		exampleVar: ["a", "b", "c"]
	};
	
	var value = link.valueForUrl(url);
	var reconstructed = link.definition.linkForData(Jsonary.create(value));
	this.assert(recursiveCompare(value, expected), JSON.stringify(value) + " != " + JSON.stringify(expected));
	this.assert(reconstructed.href == url, JSON.stringify(reconstructed.href) + " != " + JSON.stringify(url));
	return true;
});

tests.add("Variable extraction with / and incorrectly unescaped slashes", function () {
	var link = Jsonary.create({
		"rel": "test",
		"href": "/prefix{/exampleVar}/suffix"
	}).asLink();
	var url = "/prefix/a/b/c/suffix";
	var expected = {
		exampleVar: "a/b/c"
	};
	
	var value = link.valueForUrl(url);
	var reconstructed = link.definition.linkForData(Jsonary.create(value));
	this.assert(recursiveCompare(value, expected), JSON.stringify(value) + " != " + JSON.stringify(expected));
	// Reconstruction doesn't work here, because actually the slashes should be escaped
	//this.assert(reconstructed.href == url, JSON.stringify(reconstructed.href) + " != " + JSON.stringify(url));
	return true;
});

tests.add("Array extraction with *", function () {
	var link = Jsonary.create({
		"rel": "test",
		"href": "/prefix{/exampleVar*}/suffix"
	}).asLink();
	var url = "/prefix/a/b/c/suffix";
	var expected = {
		exampleVar: ["a", "b", "c"]
	};
	
	var value = link.valueForUrl(url);
	var reconstructed = link.definition.linkForData(Jsonary.create(value));
	this.assert(recursiveCompare(value, expected), JSON.stringify(value) + " != " + JSON.stringify(expected));
	this.assert(reconstructed.href == url, JSON.stringify(reconstructed.href) + " != " + JSON.stringify(url));
	return true;
});

tests.add("Array extraction with percent-encoding", function () {
	var link = Jsonary.create({
		"rel": "test",
		"href": "/prefix{/exampleVar*}/suffix"
	}).asLink();
	var url = "/prefix/%25/%23/%2525/suffix";
	var expected = {
		exampleVar: ["%", "#", "%25"]
	};
	
	var value = link.valueForUrl(url);
	var reconstructed = link.definition.linkForData(Jsonary.create(value));
	this.assert(recursiveCompare(value, expected), JSON.stringify(value) + " != " + JSON.stringify(expected));
	this.assert(reconstructed.href == url, JSON.stringify(reconstructed.href) + " != " + JSON.stringify(url));
	return true;
});

tests.add("Multi-variable extraction from list", function () {
	var link = Jsonary.create({
		"rel": "test",
		"href": "/prefix{/a,b,c}/suffix"
	}).asLink();
	var url = "/prefix/A/B/C/suffix";
	var expected = {
		a: "A",
		b: "B",
		c: "C"
	};
	
	var value = link.valueForUrl(url);
	var reconstructed = link.definition.linkForData(Jsonary.create(value));
	this.assert(recursiveCompare(value, expected), JSON.stringify(value) + " != " + JSON.stringify(expected));
	this.assert(reconstructed.href == url, JSON.stringify(reconstructed.href) + " != " + JSON.stringify(url));
	return true;
});

tests.add("Multi-variable extraction from named map", function () {
	var link = Jsonary.create({
		"rel": "test",
		"href": "/prefix/{?a,b,c}"
	}).asLink();
	var url = "/prefix/?a=A&b=B&c=C";
	var expected = {
		a: "A",
		b: "B",
		c: "C"
	};
	
	var value = link.valueForUrl(url);
	var reconstructed = link.definition.linkForData(Jsonary.create(value));
	this.assert(recursiveCompare(value, expected), JSON.stringify(value) + " != " + JSON.stringify(expected));
	this.assert(reconstructed.href == url, JSON.stringify(reconstructed.href) + " != " + JSON.stringify(url));
	return true;
});

tests.add("Multi-variable extraction from object", function () {
	var link = Jsonary.create({
		"rel": "test",
		"href": "/prefix/{?obj*}"
	}).asLink();
	var url = "/prefix/?a=A&b=B&c=C";
	var expected = {
		obj: {
			a: "A",
			b: "B",
			c: "C"
		}
	};
	
	var value = link.valueForUrl(url);
	var reconstructed = link.definition.linkForData(Jsonary.create(value));
	this.assert(recursiveCompare(value, expected), JSON.stringify(value) + " != " + JSON.stringify(expected));
	this.assert(reconstructed.href == url, JSON.stringify(reconstructed.href) + " != " + JSON.stringify(url));
	return true;
});