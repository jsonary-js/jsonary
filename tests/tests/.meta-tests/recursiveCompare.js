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
    return recursiveCompare(arrayData, arrayData) == true;
});

tests.add("Array changed", function() {
    return recursiveCompare(arrayData, arrayChanged) == false;
});

tests.add("Array missing index", function() {
    return recursiveCompare(arrayData, arrayMissing) == false;
});

tests.add("Array sub-data changed", function() {
    return recursiveCompare(arrayData, arraySubDataChanged) == false;
});

tests.add("Object identical", function() {
    return recursiveCompare(objectData, objectData) == true;
});

tests.add("Object added key", function() {
    return recursiveCompare(objectData, objectDataAdded) == false;
});

tests.add("Object missing key", function() {
    return recursiveCompare(objectData, objectDataMissing) == false;
});

tests.add("Object sub-data changed", function() {
    return recursiveCompare(objectData, objectSubDataChanged) == false;
});
