var arrayData = [1, "b", false, null, {1:2}, [5]];
var arrayChanged = [1, "b", true, null, {1:2}, [5]];
var arrayMissing = [1, "b", false, null, [5]];
var arraySubDataChanged = [1, "b", false, null, {1:3}, [5]];

var objectData = {
    "null key": null,
    "boolean key": true,
    "number key": 4,
    "string key": "string",
    "array key": [0, 1, 2, 3, 4],
    "object key": {
        "key": "value"
    }
};
var objectDataAdded = {
    "ADDED": "ADDED",
    "null key": null,
    "boolean key": true,
    "number key": 4,
    "string key": "string",
    "array key": [0, 1, 2, 3, 4],
    "object key": {
        "key": "value"
    }
};
var objectDataMissing = {
    "null key": null,
    "boolean key": true,
    "number key": 4,
    "string key": "string",
    "array key": [0, 1, 2, 3, 4],
};

var objectSubDataChanged = {
    "null key": null,
    "boolean key": true,
    "number key": 4,
    "string key": "string",
    "array key": [0, 1, 2, false, 4],
    "object key": {
        "key": "value"
    }
};

tests.add("Array identical", function() {
    var data1 = Jsonary.create(arrayData);
    var data2 = Jsonary.create(arrayData);
    return data1.equals(data2) == true;
});

tests.add("Array changed", function() {
    var data1 = Jsonary.create(arrayData);
    var data2 = Jsonary.create(arrayChanged);
    return data1.equals(data2) == false;
});

tests.add("Array missing index", function() {
    var data1 = Jsonary.create(arrayData);
    var data2 = Jsonary.create(arrayMissing);
    return data1.equals(data2) == false;
});

tests.add("Array sub-data changed", function() {
    var data1 = Jsonary.create(arrayData);
    var data2 = Jsonary.create(arraySubDataChanged);
    return data1.equals(data2) == false;
});

tests.add("Object identical", function() {
    var data1 = Jsonary.create(objectData);
    var data2 = Jsonary.create(objectData);
    return data1.equals(data2) == true;
});

tests.add("Object added key", function() {
    var data1 = Jsonary.create(objectData);
    var data2 = Jsonary.create(objectDataAdded);
    return data1.equals(data2) == false;
});

tests.add("Object missing key", function() {
    var data1 = Jsonary.create(objectData);
    var data2 = Jsonary.create(objectDataMissing);
    return data1.equals(data2) == false;
});

tests.add("Object sub-data changed", function() {
    var data1 = Jsonary.create(objectData);
    var data2 = Jsonary.create(objectSubDataChanged);
    return data1.equals(data2) == false;
});
