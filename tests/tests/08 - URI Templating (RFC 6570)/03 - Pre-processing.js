tests.add("Bracket escaping", function () {
	var data = Jsonary.create({
		"a/b": "#",
		"(a/b)": "wrong"
	});
	var link = Jsonary.create({
		"rel": "test",
		"href": "prefix_{(a/b)}_suffix"
	}).asLink(data);
	var expected = "prefix_%23_suffix";
	this.assert(link.href == expected, JSON.stringify(link.href) + " != " + JSON.stringify(expected));
	return true;
});

tests.add("Bracket escaping with modifiers", function () {
	var data = Jsonary.create({
		"a/b": "#",
		"(a/b)": "wrong"
	});
	var link = Jsonary.create({
		"rel": "test",
		"href": "prefix_{+(a/b)}_suffix"
	}).asLink(data);
	var expected = "prefix_#_suffix";
	this.assert(link.href == expected, JSON.stringify(link.href) + " != " + JSON.stringify(expected));
	return true;
});

tests.add("$ == self", function () {
	var data = Jsonary.create("value#");
	var link = Jsonary.create({
		"rel": "test",
		"href": "prefix_{$}_suffix"
	}).asLink(data);
	var expected = "prefix_value%23_suffix";
	this.assert(link.href == expected, JSON.stringify(link.href) + " != " + JSON.stringify(expected));
	return true;
});

tests.add("$ == self", function () {
	var data = Jsonary.create("value#");
	var link = Jsonary.create({
		"rel": "test",
		"href": "prefix_{+$}_suffix"
	}).asLink(data);
	var expected = "prefix_value#_suffix";
	this.assert(link.href == expected, JSON.stringify(link.href) + " != " + JSON.stringify(expected));
	return true;
});

tests.add("$ escaped", function () {
	var data = Jsonary.create({
		"$": "value"
	});
	var link = Jsonary.create({
		"rel": "test",
		"href": "prefix_{($)}_suffix"
	}).asLink(data);
	var expected = "prefix_value_suffix";
	this.assert(link.href == expected, JSON.stringify(link.href) + " != " + JSON.stringify(expected));
	return true;
});
tests.add("() == empty", function () {
	var data = Jsonary.create({
		"empty": "wrong",
		"%65mpty": "wronger",
		"": "right"
	});
	var link = Jsonary.create({
		"rel": "test",
		"href": "prefix_{()}_suffix"
	}).asLink(data);
	var expected = "prefix_right_suffix";
	this.assert(link.href == expected, JSON.stringify(link.href) + " != " + JSON.stringify(expected));
	return true;
});