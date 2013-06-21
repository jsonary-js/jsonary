var schemaChangeListeners = [];
publicApi.registerSchemaChangeListener = function (listener) {
	schemaChangeListeners.push(listener);
};
var schemaChanges = {
};
var schemaNotifyPending = false;
function notifyAllSchemaChanges() {
	schemaNotifyPending = false;
	var dataEntries = [];
	for (var uniqueId in schemaChanges) {
		var data = schemaChanges[uniqueId];
		dataEntries.push({
			data: data,
			pointerPath: data.pointerPath()
		});
	}
	schemaChanges = {};
	dataEntries.sort(function (a, b) {
		return a.pointerPath.length - b.pointerPath.length;
	});
	var dataObjects = [];
	for (var i = 0; i < dataEntries.length; i++) {
		dataObjects[i] = dataEntries[i].data;
	}
	for (var i = 0; i < schemaChangeListeners.length; i++) {
		schemaChangeListeners[i].call(null, dataObjects);
	}
}
function notifySchemaChangeListeners(data) {
	schemaChanges[data.uniqueId] = data;
	if (!schemaNotifyPending) {
		schemaNotifyPending = true;
		DelayedCallbacks.add(notifyAllSchemaChanges);
	}
}

function LinkList(linkList) {
	for (var i = 0; i < linkList.length; i++) {
		this[i] = linkList[i];
	}
	this.length = linkList.length;
}
LinkList.prototype = {
	rel: function(rel) {
		if (rel == undefined) {
			return this;
		}
		var result = [];
		var i;
		for (i = 0; i < this.length; i++) {
			if (this[i].rel === rel) {
				result[result.length] = this[i];
			}
		}
		return new LinkList(result);
	}
};

// TODO: see how many calls to dataObj can be changed to just use this object
function SchemaList(schemaList, fixedList) {
	if (schemaList == undefined) {
		this.length = 0;
		return;
	}
	if (fixedList == undefined) {
		fixedList = schemaList;
	}
	this.fixed = function () {
		var fixedSchemaList = (fixedList.length < schemaList.length) ? new SchemaList(fixedList) : this;
		this.fixed = function () {
			return fixedSchemaList;
		};
		return fixedSchemaList;
	};
	var i;
	for (i = 0; i < schemaList.length; i++) {
		this[i] = schemaList[i];
	}
	this.length = schemaList.length;
}
var ALL_TYPES_DICT = {
	"null": true,
	"boolean": true,
	"integer": true,
	"number": true,
	"string": true,
	"array": true,
	"object": true
};
SchemaList.prototype = {
	indexOf: function (schema, resolveRef) {
		var i = this.length - 1;
		while (i >= 0) {
			if (schema.equals(this[i], resolveRef)) {
				return i;
			}
			i--;
		}
		return i;
	},
	containsUrl: function(url) {
		if (url instanceof RegExp) {
			for (var i = 0; i < this.length; i++) {
				var schema = this[i];
				if (url.test(schema.referenceUrl())) {
					return true;
				}
			}
		} else {
			if (url.indexOf('#') < 0) {
				url += "#";
			}
			for (var i = 0; i < this.length; i++) {
				var schema = this[i];
				var referenceUrl = schema.referenceUrl();
				if (referenceUrl != null && referenceUrl.substring(referenceUrl.length - url.length) == url) {
					return true;
				}
			}
		}
		return false;
	},
	links: function () {
		var result = [];
		var i, schema;
		for (i = 0; i < this.length; i++) {
			schema = this[i];
			result = result.concat(schema.links());
		}
		return result;
	},
	each: function (callback) {
		for (var i = 0; i < this.length; i++) {
			callback.call(this, i, this[i]);
		}
		return this;
	},
	concat: function(other) {
		var newList = [];
		for (var i = 0; i < this.length; i++) {
			newList.push(this[i]);
		}
		for (var i = 0; i < other.length; i++) {
			newList.push(other[i]);
		}
		return new SchemaList(newList);
	},
	title: function () {
		var titles = [];
		for (var i = 0; i < this.length; i++) {
			var title = this[i].title();
			if (title) {
				titles.push(title);
			}
		}
		return titles.join(' - ');
	},
	definedProperties: function (ignoreList) {
		if (ignoreList) {
			this.definedProperties(); // create cached function
			return this.definedProperties(ignoreList);
		}
		var additionalProperties = true;
		var definedKeys = {};
		this.each(function (index, schema) {
			if (additionalProperties) {
				if (!schema.allowedAdditionalProperties()) {
					additionalProperties = false;
					definedKeys = {};
				}
				var definedProperties = schema.definedProperties();
				for (var i = 0; i < definedProperties.length; i++) {
					definedKeys[definedProperties[i]] = true;
				}
			} else {
				if (!schema.allowedAdditionalProperties()) {
					additionalProperties = false;
					var newKeys = {};
					var definedProperties = schema.definedProperties();
					for (var i = 0; i < definedProperties.length; i++) {
						if (definedKeys[definedProperties[i]]) {
							newKeys[definedProperties[i]] = true;
						}
					}
					definedKeys = newKeys;
				}
			}
		});
		var result = Object.keys(definedKeys);
		cacheResult(this, {
			allowedAdditionalProperties: additionalProperties
		});
		this.definedProperties = function (ignoreList) {
			ignoreList = ignoreList || [];
			var newList = [];
			for (var i = 0; i < result.length; i++) {
				if (ignoreList.indexOf(result[i]) == -1) {
					newList.push(result[i]);
				}
			}
			return newList;
		};
		return result;
	},
	knownProperties: function (ignoreList) {
		if (ignoreList) {
			this.knownProperties(); // create cached function
			return this.knownProperties(ignoreList);
		}
		var result;
		if (this.allowedAdditionalProperties()) {
			result = this.definedProperties().slice(0);
			var requiredProperties = this.requiredProperties();
			for (var i = 0; i < requiredProperties.length; i++) {
				if (result.indexOf(requiredProperties[i]) == -1) {
					result.push(requiredProperties[i]);
				}
			}
		} else {
			var result = this.definedProperties();
		}
		this.knownProperties = function (ignoreList) {
			ignoreList = ignoreList || [];
			var newList = [];
			for (var i = 0; i < result.length; i++) {
				if (ignoreList.indexOf(result[i]) == -1) {
					newList.push(result[i]);
				}
			}
			return newList;
		};
		return result.slice(0);
	},
	allowedAdditionalProperties: function () {
		var additionalProperties = true;
		this.each(function (index, schema) {
			additionalProperties = (additionalProperties && schema.allowedAdditionalProperties());
		});
		cacheResult(this, {
			additionalProperties: additionalProperties
		});
		return additionalProperties;
	},
	minProperties: function () {
		var minProperties = 0;
		for (var i = 0; i < this.length; i++) {
			var otherMinProperties = this[i].minProperties();
			if (otherMinProperties > minProperties) {
				minProperties = otherMinProperties;
			}
		}
		return minProperties;
	},
	maxProperties: function () {
		var maxProperties = undefined;
		for (var i = 0; i < this.length; i++) {
			var otherMaxProperties = this[i].maxProperties();
			if (!(otherMaxProperties > maxProperties)) {
				maxProperties = otherMaxProperties;
			}
		}
		return maxProperties;
	},
	types: function () {
		var basicTypes = ALL_TYPES_DICT;
		for (var i = 0; i < this.length; i++) {
			var otherBasicTypes = this[i].basicTypes();
			var newBasicTypes = {};
			for (var j = 0; j < otherBasicTypes.length; j++) {
				var type = otherBasicTypes[j];
				if (basicTypes[type]) {
					newBasicTypes[type] = true;
				}
			}
			basicTypes = newBasicTypes;
		}
		return Object.keys(basicTypes);
	},
	numberInterval: function() {
		var candidate = undefined;
		for (var i = 0; i < this.length; i++) {
			var interval = this[i].numberInterval();
			if (interval == undefined) {
				continue;
			}
			if (candidate == undefined) {
				candidate = interval;
			} else {
				candidate = Utils.lcm(candidate, interval);
			}
		}
		for (var i = 0; i < this.length; i++) {
			var basicTypes = this[i].basicTypes();
			var hasInteger = false;
			for (var j = 0; j < basicTypes.length; j++) {
				if (basicTypes[j] == "number") {
					hasInteger = false;
					break;
				} else if (basicTypes[j] == "integer") {
					hasInteger = true;
				}
			}
			if (hasInteger) {
				if (candidate == undefined) {
					return 1;
				} else {
					return Utils.lcm(candidate, 1);
				}
			}
		}
		cacheResult(this, {
			numberInterval: candidate
		});
		return candidate;
	},
	minimum: function () {
		var minimum = undefined;
		var exclusive = false;
		for (var i = 0; i < this.length; i++) {
			var otherMinimum = this[i].minimum();
			if (otherMinimum != undefined) {
				if (minimum == undefined || minimum < otherMinimum) {
					minimum = otherMinimum;
					exclusive = this[i].exclusiveMinimum();
				}
			}
		}
		cacheResult(this, {
			minimum: minimum,
			exclusiveMinimum: exclusive
		});
		return minimum;
	},
	exclusiveMinimum: function () {
		this.minimum();
		return this.exclusiveMinimum();
	},
	maximum: function () {
		var maximum = undefined;
		var exclusive = false;
		for (var i = 0; i < this.length; i++) {
			var otherMaximum = this[i].maximum();
			if (otherMaximum != undefined) {
				if (maximum == undefined || maximum > otherMaximum) {
					maximum = otherMaximum;
					exclusive = this[i].exclusiveMaximum();
				}
			}
		}
		cacheResult(this, {
			maximum: maximum,
			exclusiveMaximum: exclusive
		});
		return maximum;
	},
	exclusiveMaximum: function () {
		this.minimum();
		return this.exclusiveMinimum();
	},
	minLength: function () {
		var minLength = 0;
		for (var i = 0; i < this.length; i++) {
			var otherMinLength = this[i].minLength();
			if (otherMinLength > minLength) {
				minLength = otherMinLength;
			}
		}
		cacheResult(this, {
			minLength: minLength
		});
		return minLength;
	},
	maxLength: function () {
		var maxLength = undefined;
		for (var i = 0; i < this.length; i++) {
			var otherMaxLength = this[i].maxLength();
			if (!(otherMaxLength > maxLength)) {
				maxLength = otherMaxLength;
			}
		}
		cacheResult(this, {
			maxLength: maxLength
		});
		return maxLength;
	},
	minItems: function () {
		var minItems = 0;
		for (var i = 0; i < this.length; i++) {
			var otherMinItems = this[i].minItems();
			if (otherMinItems > minItems) {
				minItems = otherMinItems;
			}
		}
		cacheResult(this, {
			minItems: minItems
		});
		return minItems;
	},
	maxItems: function () {
		var maxItems = undefined;
		for (var i = 0; i < this.length; i++) {
			var otherMaxItems = this[i].maxItems();
			if (!(otherMaxItems > maxItems)) {
				maxItems = otherMaxItems;
			}
		}
		cacheResult(this, {
			maxItems: maxItems
		});
		return maxItems;
	},
	tupleTypingLength: function () {
		var maxTuple = 0;
		for (var i = 0; i < this.length; i++) {
			var otherTuple = this[i].tupleTypingLength();
			if (otherTuple > maxTuple) {
				maxTuple = otherTuple;
			}
		}
		return maxTuple;
	},
	requiredProperties: function () {
		var required = {};
		var requiredList = [];
		for (var i = 0; i < this.length; i++) {
			var requiredProperties = this[i].requiredProperties();
			for (var j = 0; j < requiredProperties.length; j++) {
				var key = requiredProperties[j];
				if (!required[key]) {
					required[key] = true;
					requiredList.push(key);
				}
			}
		}
		return requiredList;
	},
	readOnly: function () {
		var readOnly = false;
		for (var i = 0; i < this.length; i++) {
			if (this[i].readOnly()) {
				readOnly = true;
				break;
			}
		}
		this.readOnly = function () {
			return readOnly;
		}
		return readOnly;
	},
	enumValues: function () {
		var enums = undefined;
		for (var i = 0; i < this.length; i++) {
			var enumData = this[i].enumData();
			if (enumData.defined()) {
				if (enums == undefined) {
					enums = [];
					enumData.indices(function (index, subData) {
						enums[index] = subData;
					});
				} else {
					var newEnums = [];
					enumData.indices(function (index, subData) {
						for (var i = 0; i < enums.length; i++) {
							if (enums[i].equals(subData)) {
								newEnums.push(subData);
							}
						}
					});
					enums = newEnums;
				}
			}
		}
		if (enums != undefined) {
			var values = [];
			for (var i = 0; i < enums.length; i++) {
				values[i] = enums[i].value();
			}
			return values;
		}
	},
	allCombinations: function (callback) {
		if (callback && !this.isFull()) {
			this.getFull(function (full) {
				full.allCombinations(callback);
			});
			return [];
		}
		var thisSchemaSet = this;
		// This is a little inefficient
		var xorSchemas = this.xorSchemas();
		for (var i = 0; i < xorSchemas.length; i++) {
			var found = false;
			for (var optionNum = 0; optionNum < xorSchemas[i].length; optionNum++) {
				var option = xorSchemas[i][optionNum];
				if (this.indexOf(option, !!callback) >= 0) {
					found = true;
					break;
				}
			}
			if (!found) {
				var result = [];
				var pending = 1;
				var gotResult = function() {
					pending--;
					if (pending <= 0) {
						callback(result);
					}
				};
				for (var optionNum = 0; optionNum < xorSchemas[i].length; optionNum++) {
					var option = xorSchemas[i][optionNum];
					if (callback) {
						pending++;
						this.concat([option]).allCombinations(function (subCombos) {
							result = result.concat(subCombos);
							gotResult();
						});
					} else {
						var subCombos = this.concat([option]).allCombinations();
						result = result.concat(subCombos);
					}
				}
				if (callback) {
					gotResult();
				}
				return result;
			}
		}
		
		var orSchemas = this.orSchemas();
		var totalCombos = null;
		var orSelectionOptionSets = [];
		var orPending = 1;
		function gotOrResult() {
			orPending--;
			if (orPending <= 0) {
				var totalCombos = [new SchemaList([])];
				for (var optionSetIndex = 0; optionSetIndex < orSelectionOptionSets.length; optionSetIndex++) {
					var optionSet = orSelectionOptionSets[optionSetIndex];
					var newTotalCombos = [];
					for (var optionIndex = 0; optionIndex < optionSet.length; optionIndex++) {
						for (var comboIndex = 0; comboIndex < totalCombos.length; comboIndex++) {
							newTotalCombos.push(totalCombos[comboIndex].concat(optionSet[optionIndex]));
						}
					}
					totalCombos = newTotalCombos;
				}
				for (var i = 0; i < totalCombos.length; i++) {
					totalCombos[i] = thisSchemaSet.concat(totalCombos[i]);
				}
				
				callback(totalCombos);
			}
		};
		for (var i = 0; i < orSchemas.length; i++) {
			(function (i) {
				var remaining = [];
				var found = false;
				for (var optionNum = 0; optionNum < orSchemas[i].length; optionNum++) {
					var option = orSchemas[i][optionNum];
					if (thisSchemaSet.indexOf(option, !!callback) == -1) {
						remaining.push(option);
					} else {
						found = true;
					}
				}
				if (remaining.length > 0) {
					var orSelections = [[]];
					for (var remNum = 0; remNum < remaining.length; remNum++) {
						var newCombos = [];
						for (var combNum = 0; combNum < orSelections.length; combNum++) {
							newCombos.push(orSelections[combNum]);
							newCombos.push(orSelections[combNum].concat([remaining[remNum]]));
						}
						orSelections = newCombos;
					} 
					if (!found) {
						orSelections.shift();
					}
					if (callback) {
						orSelectionOptionSets[i] = [];
						for (var j = 0; j < orSelections.length; j++) {
							var orSelectionSet = new SchemaList(orSelections[j]);
							orPending++;
							orSelectionSet.allCombinations(function (subCombos) {
								orSelectionOptionSets[i] = orSelectionOptionSets[i].concat(subCombos);
								gotOrResult();
							});
						}
					} else {
						orSelectionOptionSets[i] = orSelections;
					}
				}
			})(i);
		}
		
		var totalCombos = [new SchemaList([])];
		for (var optionSetIndex = 0; optionSetIndex < orSelectionOptionSets.length; optionSetIndex++) {
			var optionSet = orSelectionOptionSets[optionSetIndex];
			var newTotalCombos = [];
			for (var optionIndex = 0; optionIndex < optionSet.length; optionIndex++) {
				for (var comboIndex = 0; comboIndex < totalCombos.length; comboIndex++) {
					newTotalCombos.push(totalCombos[comboIndex].concat(optionSet[optionIndex]));
				}
			}
			totalCombos = newTotalCombos;
		}
		for (var i = 0; i < totalCombos.length; i++) {
			totalCombos[i] = this.concat(totalCombos[i]);
		}
		
		if (callback) {
			gotOrResult();
		}
		return totalCombos;
	},
	createValue: function(callback, ignoreChoices) {
		if (!ignoreChoices) {
			if (callback != null) {
				this.allCombinations(function (allCombinations) {
					function nextOption(index) {
						if (index >= allCombinations.length) {
							return callback(undefined);
						}
						allCombinations[index].createValue(function (value) {
							if (value !== undefined) {
								callback(value);
							} else {
								nextOption(index + 1);
							}
						}, true);
					}
					nextOption(0);
				});
				return;
			}
			// Synchronous version
			var allCombinations = this.allCombinations();
			for (var i = 0; i < allCombinations.length; i++) {
				var value = allCombinations[i].createValue(null, true);
				if (value !== undefined) {
					return value;
				}
			}
			return;
		}

		var basicTypes = this.basicTypes();
		var pending = 1;
		var chosenCandidate = undefined;
		function gotCandidate(candidate) {
			if (candidate !== undefined) {
				var newBasicType = Utils.guessBasicType(candidate);
				if (basicTypes.indexOf(newBasicType) == -1 && (newBasicType != "integer" || basicTypes.indexOf("number") == -1)) {
					candidate = undefined;
				}
			}
			if (candidate !== undefined && chosenCandidate === undefined) {
				chosenCandidate = candidate;
			}
			pending--;
			if (callback && pending <= 0) {
				callback(chosenCandidate);
			}
			if (pending <= 0) {
				return chosenCandidate;
			}
		}

		for (var i = 0; i < this.length; i++) {
			if (this[i].hasDefault()) {
				pending++;
				if (gotCandidate(this[i].defaultValue())) {
					return chosenCandidate;
				}
			}
		}
		
		var enumValues = this.enumValues();
		if (enumValues != undefined) {
			pending += enumValues.length;
			for (var i = 0; i < enumValues.length; i++) {
				if (gotCandidate(enumValues[i])) {
					return chosenCandidate;
				}
			}
		} else {
			pending += basicTypes.length;
			for (var i = 0; i < basicTypes.length; i++) {
				var basicType = basicTypes[i];
				if (basicType == "null") {
					if (gotCandidate(null)) {
						return chosenCandidate;
					}
				} else if (basicType == "boolean") {
					if (gotCandidate(true)) {
						return true;
					}
				} else if (basicType == "integer" || basicType == "number") {
					var candidate = this.createValueNumber();
					if (gotCandidate(candidate)) {
						return chosenCandidate;
					}
				} else if (basicType == "string") {
					var candidate = this.createValueString();
					if (gotCandidate(candidate)) {
						return chosenCandidate;
					}
				} else if (basicType == "array") {
					if (callback) {
						this.createValueArray(function (candidate) {
							gotCandidate(candidate);
						});
					} else {
						var candidate = this.createValueArray();
						if (gotCandidate(candidate)) {
							return chosenCandidate;
						}
					}
				} else if (basicType == "object") {
					if (callback) {
						var candidate = this.createValueObject(function (candidate) {
							gotCandidate(candidate);
						});
					} else {
						var candidate = this.createValueObject();
						if (gotCandidate(candidate)) {
							return chosenCandidate;
						}
					}
				}
			}
		}
		return gotCandidate(chosenCandidate);
	},
	createValueNumber: function () {
		var exclusiveMinimum = this.exclusiveMinimum();
		var minimum = this.minimum();
		var maximum = this.maximum();
		var exclusiveMaximum = this.exclusiveMaximum();
		var interval = this.numberInterval();
		var candidate = undefined;
		if (minimum != undefined && maximum != undefined) {
			if (minimum > maximum || (minimum == maximum && (exclusiveMinimum || exclusiveMaximum))) {
				return;
			}
			if (interval != undefined) {
				candidate = Math.ceil(minimum/interval)*interval;
				if (exclusiveMinimum && candidate == minimum) {
					candidate += interval;
				}
				if (candidate > maximum || (candidate == maximum && exclusiveMaximum)) {
					return;
				}
			} else {
				candidate = (minimum + maximum)*0.5;
			}
		} else if (minimum != undefined) {
			candidate = minimum;
			if (interval != undefined) {
				candidate = Math.ceil(candidate/interval)*interval;
			}
			if (exclusiveMinimum && candidate == minimum) {
				if (interval != undefined) {
					candidate += interval;
				} else {
					candidate++;
				}
			}
		} else if (maximum != undefined) {
			candidate = maximum;
			if (interval != undefined) {
				candidate = Math.floor(candidate/interval)*interval;
			}
			if (exclusiveMaximum && candidate == maximum) {
				if (interval != undefined) {
					candidate -= interval;
				} else {
					candidate--;
				}
			}
		} else {
			candidate = 0;
		}
		return candidate;
	},
	createValueString: function () {
		var candidate = "";
		return candidate;
	},
	createValueArray: function (callback) {
		var thisSchemaSet = this;
		var candidate = [];
		var minItems = this.minItems();
		if (!minItems) {
			if (callback) {
				callback(candidate);
			}
			return candidate;
		}
		var pending = minItems;
		for (var i = 0; i < minItems; i++) {
			(function (i) {
				if (callback) {
					thisSchemaSet.createValueForIndex(i, function (value) {
						candidate[i] = value;
						pending--;
						if (pending == 0) {
							callback(candidate);
						}
					});
				} else {
					candidate[i] = thisSchemaSet.createValueForIndex(i);
				}
			})(i);
		}
		return candidate;
	},
	createValueObject: function (callback) {
		var thisSchemaSet = this;
		var candidate = {};
		var requiredProperties = this.requiredProperties();
		if (requiredProperties.length == 0) {
			if (callback) {
				callback(candidate);
			}
			return candidate;
		}
		var pending = requiredProperties.length;
		for (var i = 0; i < requiredProperties.length; i++) {
			(function (key) {
				if (callback) {
					thisSchemaSet.createValueForProperty(key, function (value) {
						candidate[key] = value;
						pending--;
						if (pending == 0) {
							callback(candidate);
						}
					});
				} else {
					candidate[key] = thisSchemaSet.createValueForProperty(key);
				}
			})(requiredProperties[i]);
		}
		return candidate;
	},
	createValueForIndex: function(index, callback) {
		var indexSchemas = this.indexSchemas(index);
		return indexSchemas.createValue(callback);
	},
	indexSchemas: function(index) {
		var result = new SchemaList();
		for (var i = 0; i < this.length; i++) {
			result = result.concat(this[i].indexSchemas(index));
		}
		return result;
	},
	createValueForProperty: function(key, callback) {
		var propertySchemas = this.propertySchemas(key);
		return propertySchemas.createValue(callback);
	},
	propertySchemas: function(key) {
		var result = new SchemaList();
		for (var i = 0; i < this.length; i++) {
			result = result.concat(this[i].propertySchemas(key));
		}
		return result;
	},
	propertyDependencies: function(key) {
		var result = [];
		var stringDeps = {};
		for (var i = 0; i < this.length; i++) {
			var deps = this[i].propertyDependencies(key);
			for (var j = 0; j < deps.length; j++) {
				if (typeof deps[j] == "string") {
					if (!stringDeps[deps[j]]) {
						stringDeps[deps[j]] = true;
						result.push(deps[j]);
					}
				} else {
					result.push(deps[j]);
				}
			}
		}
		return result;
	},
	isFull: function () {
		for (var i = 0; i < this.length; i++) {
			if (!this[i].isFull()) {
				return false;
			}
			var andSchemas = this[i].andSchemas();
			for (var j = 0; j < andSchemas.length; j++) {
				if (this.indexOf(andSchemas[j], true) == -1) {
					return false;
				}
			}
		}
		return true;
	},
	getFull: function(callback) {
		if (this.length == 0) {
			callback.call(this, this);
			return this;
		}
		var pending = 0;
		var result = [];
		var fixedList = this.fixed();
		function addAll(list) {
			pending += list.length;
			for (var i = 0; i < list.length; i++) {
				list[i].getFull(function(schema) {
					for (var i = 0; i < result.length; i++) {
						if (schema.equals(result[i])) {
							pending--;
							if (pending == 0) {
								var fullList = new SchemaList(result, fixedList);
								callback.call(fullList, fullList);
							}
							return;
						}
					}
					result.push(schema);
					var extendSchemas = schema.extendSchemas();
					addAll(extendSchemas);
					pending--;
					if (pending == 0) {
						var fullList = new SchemaList(result, fixedList);
						callback.call(fullList, fullList);
					}
				});
			}
		}
		addAll(this);
		return this;
	},
	formats: function () {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			var format = this[i].format();
			if (format != null) {
				result.push(format);
			}
		}
		return result;
	},
	xorSchemas: function () {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			result = result.concat(this[i].xorSchemas());
		}
		return result;
	},
	orSchemas: function () {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			result = result.concat(this[i].orSchemas());
		}
		return result;
	}
};
SchemaList.prototype.basicTypes = SchemaList.prototype.types;
SchemaList.prototype.potentialLinks = SchemaList.prototype.links;

publicApi.extendSchemaList = function (obj) {
	for (var key in obj) {
		if (SchemaList.prototype[key] == undefined) {
			SchemaList.prototype[key] = obj[key];
		}
	}
};

publicApi.createSchemaList = function (schemas) {
	if (!Array.isArray(schemas)) {
		schemas = [schemas];
	}
	return new SchemaList(schemas);
};

var SCHEMA_SET_UPDATE_KEY = Utils.getUniqueKey();

function SchemaSet(dataObj) {
	var thisSchemaSet = this;
	this.dataObj = dataObj;

	this.schemas = {};
	this.schemasFixed = {};
	this.links = {};
	this.matches = {};
	this.xorSelectors = {};
	this.orSelectors = {};
	this.dependencySelectors = {};
	this.schemaFlux = 0;
	this.schemasStable = true;

	this.schemasStableListeners = new ListenerSet(dataObj);
	this.pendingNotify = false;

	this.cachedSchemaList = null;
	this.cachedLinkList = null;
}
var counter = 0;
SchemaSet.prototype = {
	update: function (key) {
		this.updateLinksWithKey(key);
		this.updateDependenciesWithKey(key);
		this.updateMatchesWithKey(key);
	},
	updateFromSelfLink: function () {
		this.cachedLinkList = null;
		var activeSelfLinks = [];
		// Disable all "self" links
		for (var schemaKey in this.links) {
			var linkList = this.links[schemaKey];
			for (i = 0; i < linkList.length; i++) {
				var linkInstance = linkList[i];
				if (linkInstance.rel() == "self") {
					linkInstance.active = false;
				}
			}
		}
		// Recalculate all "self" links, keeping them disabled
		for (var schemaKey in this.links) {
			var linkList = this.links[schemaKey];
			for (i = 0; i < linkList.length; i++) {
				var linkInstance = linkList[i];
				if (linkInstance.rel() == "self") {
					linkInstance.update();
					if (linkInstance.active) {
						activeSelfLinks.push(linkInstance);
						linkInstance.active = false;
						// Reset cache again
						this.cachedLinkList = null;
					}
				}
			}
		}
		// Re-enable all self links that should be active
		for (var i = 0; i < activeSelfLinks.length; i++) {
			activeSelfLinks[i].active = true;
		}

		// Update everything except the self links
		for (var schemaKey in this.links) {
			var linkList = this.links[schemaKey];
			for (i = 0; i < linkList.length; i++) {
				var linkInstance = linkList[i];
				if (linkInstance.rel() != "self") {
					linkInstance.update();
				}
			}
		}
		this.dataObj.properties(function (key, child) {
			child.addLink(null);
		});
		this.dataObj.items(function (index, child) {
			child.addLink(null);
		});
	},
	updateLinksWithKey: function (key) {
		var schemaKey, i, linkList, linkInstance;
		var linksToUpdate = [];
		for (schemaKey in this.links) {
			linkList = this.links[schemaKey];
			for (i = 0; i < linkList.length; i++) {
				linkInstance = linkList[i];
				if (linkInstance.usesKey(key) || key == null) {
					linksToUpdate.push(linkInstance);
				}
			}
		}
		if (linksToUpdate.length > 0) {
			var updatedSelfLink = null;
			for (i = 0; i < linksToUpdate.length; i++) {
				linkInstance = linksToUpdate[i];
				var oldHref = linkInstance.active ? linkInstance.rawLink.rawLink.href : null;
				linkInstance.update();
				var newHref = linkInstance.active ? linkInstance.rawLink.rawLink.href : null;
				if (newHref != oldHref && linkInstance.rel() == "self") {
					updatedSelfLink = linkInstance;
					break;
				}
			}
			if (updatedSelfLink != null) {
				this.updateFromSelfLink(updatedSelfLink);
			}
			// TODO: have separate "link" listeners?
			this.invalidateSchemaState();
		}
	},
	updateMatchesWithKey: function (key) {
		// TODO: maintain a list of sorted keys, instead of sorting them each time
		var schemaKeys = [];
		for (schemaKey in this.matches) {
			schemaKeys.push(schemaKey);
		}
		schemaKeys.sort();
		schemaKeys.reverse();
		for (var j = 0; j < schemaKeys.length; j++) {
			var matchList = this.matches[schemaKeys[j]];
			if (matchList != undefined) {
				for (var i = 0; i < matchList.length; i++) {
					matchList[i].dataUpdated(key);
				}
			}
		}
	},
	updateDependenciesWithKey: function (key) {
		// TODO: maintain a list of sorted keys, instead of sorting them each time
		var schemaKeys = [];		
		for (schemaKey in this.dependencySelectors) {
			schemaKeys.push(schemaKey);
		}
		schemaKeys.sort();
		schemaKeys.reverse();
		for (var j = 0; j < schemaKeys.length; j++) {
			var dependencyList = this.dependencySelectors[schemaKeys[j]];
			for (var i = 0; i < dependencyList.length; i++) {
				dependencyList[i].dataUpdated(key);
			}
		}
	},
	alreadyContainsSchema: function (schema, schemaKeyHistory) {
		for (var j = 0; j < schemaKeyHistory.length; j++) {
			var schemaKeyItem = schemaKeyHistory[j];
			if (this.schemas[schemaKeyItem] == undefined) {
				continue;
			}
			for (var i = 0; i < this.schemas[schemaKeyItem].length; i++) {
				var s = this.schemas[schemaKeyItem][i];
				if (schema.equals(s)) {
					return true;
				}
			}
		}
		return false;
	},
	addSchema: function (schema, schemaKey, schemaKeyHistory, fixed) {
		var thisSchemaSet = this;
		if (schemaKey == undefined) {
			schemaKey = Utils.getUniqueKey();
			counter = 0;
		}
		if (fixed == undefined) {
			fixed = true;
		}
		if (schemaKeyHistory == undefined) {
			schemaKeyHistory = [schemaKey];
		} else {
			schemaKeyHistory[schemaKeyHistory.length] = schemaKey;
		}
		if (this.schemas[schemaKey] == undefined) {
			this.schemas[schemaKey] = [];
		}
		this.schemaFlux++;
		if (typeof schema == "string") {
			schema = publicApi.createSchema({"$ref": schema});
		}
		schema.getFull(function (schema, req) {
			if (thisSchemaSet.alreadyContainsSchema(schema, schemaKeyHistory)) {
				thisSchemaSet.schemaFlux--;
				thisSchemaSet.checkForSchemasStable();
				return;
			}
			DelayedCallbacks.increment();

			thisSchemaSet.schemas[schemaKey].push(schema);
			thisSchemaSet.schemasFixed[schemaKey] = thisSchemaSet.schemasFixed[schemaKey] || fixed;

			// TODO: this actually forces us to walk the entire data tree, as far as it is defined by the schemas
			//       Do we really want to do this?  I mean, it's necessary if we ever want to catch the "self" links, but if not then it's not that helpful.
			thisSchemaSet.dataObj.properties(function (key, child) {
				var subSchemaKey = Utils.getKeyVariant(schemaKey, "prop");
				var subSchemas = schema.propertySchemas(key);
				for (var i = 0; i < subSchemas.length; i++) {
					child.addSchema(subSchemas[i], subSchemaKey, schemaKeyHistory);
				}
			});
			thisSchemaSet.dataObj.indices(function (i, child) {
				var subSchemaKey = Utils.getKeyVariant(schemaKey, "idx");
				var subSchemas = schema.indexSchemas(i);
				for (var i = 0; i < subSchemas.length; i++) {
					child.addSchema(subSchemas[i], schemaKey, schemaKeyHistory);
				}
			});

			var ext = schema.extendSchemas();
			for (var i = 0; i < ext.length; i++) {
				thisSchemaSet.addSchema(ext[i], schemaKey, schemaKeyHistory, fixed);
			}

			thisSchemaSet.addLinks(schema.links(), schemaKey, schemaKeyHistory);
			thisSchemaSet.addXorSelectors(schema, schemaKey, schemaKeyHistory);
			thisSchemaSet.addOrSelectors(schema, schemaKey, schemaKeyHistory);
			thisSchemaSet.addDependencySelector(schema, schemaKey, schemaKeyHistory);

			thisSchemaSet.schemaFlux--;
			thisSchemaSet.invalidateSchemaState();
			DelayedCallbacks.decrement();
		});
	},
	addLinks: function (potentialLinks, schemaKey, schemaKeyHistory) {
		var i, linkInstance;
		if (this.links[schemaKey] == undefined) {
			this.links[schemaKey] = [];
		}
		var selfLink = null;
		for (i = 0; i < potentialLinks.length; i++) {
			linkInstance = new LinkInstance(this.dataObj, potentialLinks[i]);
			this.links[schemaKey].push(linkInstance);
			this.addMonitorForLink(linkInstance, schemaKey, schemaKeyHistory);
			linkInstance.update();
			if (linkInstance.active && linkInstance.rawLink.rawLink.rel == "self") {
				selfLink = linkInstance;
			}
		}
		if (selfLink != null) {
			this.updateFromSelfLink(selfLink);
		}
		this.invalidateSchemaState();
	},
	addXorSelectors: function (schema, schemaKey, schemaKeyHistory) {
		var xorSchemas = schema.xorSchemas();
		var selectors = [];
		for (var i = 0; i < xorSchemas.length; i++) {
			var selector = new XorSchemaApplier(xorSchemas[i], Utils.getKeyVariant(schemaKey, "xor" + i), schemaKeyHistory, this);
			selectors.push(selector);
		}
		if (this.xorSelectors[schemaKey] == undefined) {
			this.xorSelectors[schemaKey] = selectors;
		} else {
			this.xorSelectors[schemaKey] = this.xorSelectors[schemaKey].concat(selectors);
		}
	},
	addOrSelectors: function (schema, schemaKey, schemaKeyHistory) {
		var orSchemas = schema.orSchemas();
		var selectors = [];
		for (var i = 0; i < orSchemas.length; i++) {
			var selector = new OrSchemaApplier(orSchemas[i], Utils.getKeyVariant(schemaKey, "or" + i), schemaKeyHistory, this);
			selectors.push(selector);
		}
		if (this.orSelectors[schemaKey] == undefined) {
			this.orSelectors[schemaKey] = selectors;
		} else {
			this.orSelectors[schemaKey] = this.orSelectors[schemaKey].concat(selectors);
		}
	},
	addDependencySelector: function (schema, schemaKey, schemaKeyHistory) {
		var selector = new DependencyApplier(schema, Utils.getKeyVariant(schemaKey, "dep"), schemaKeyHistory, this);
		var selectors = [selector];
		if (this.dependencySelectors[schemaKey] == undefined) {
			this.dependencySelectors[schemaKey] = selectors;
		} else {
			this.dependencySelectors[schemaKey] = this.dependencySelectors[schemaKey].concat(selectors);
		}
	},
	addLink: function (rawLink) {
		if (rawLink == null) {
			this.updateFromSelfLink();
			this.invalidateSchemaState();
			return;
		}
		var schemaKey = Utils.getUniqueKey();
		var linkData = publicApi.create(rawLink);
		var potentialLink = new PotentialLink(linkData);
		this.addLinks([potentialLink], schemaKey);
	},
	addMonitorForLink: function (linkInstance, schemaKey, schemaKeyHistory) {
		var thisSchemaSet = this;
		var rel = linkInstance.rel();
		if (rel === "describedby") {
			var subSchemaKey = Utils.getKeyVariant(schemaKey);
			linkInstance.addMonitor(subSchemaKey, function (active) {
				thisSchemaSet.removeSchema(subSchemaKey);
				if (active) {
					var rawLink = linkInstance.rawLink;
					var schema = publicApi.createSchema({
						"$ref": rawLink.href
					});
					thisSchemaSet.addSchema(schema, subSchemaKey, schemaKeyHistory, false);
				}
			});
		}
	},
	addSchemaMatchMonitor: function (monitorKey, schema, monitor, executeImmediately, impatientCallbacks) {
		var schemaMatch = new SchemaMatch(monitorKey, this.dataObj, schema, impatientCallbacks);
		if (this.matches[monitorKey] == undefined) {
			this.matches[monitorKey] = [];
		}
		this.matches[monitorKey].push(schemaMatch);
		schemaMatch.addMonitor(monitor, executeImmediately);
		return schemaMatch;
	},
	removeSchema: function (schemaKey) {
		//Utils.log(Utils.logLevel.DEBUG, "Actually removing schema:" + schemaKey);
		DelayedCallbacks.increment();

		this.dataObj.indices(function (i, subData) {
			subData.removeSchema(schemaKey);
		});
		this.dataObj.properties(function (i, subData) {
			subData.removeSchema(schemaKey);
		});

		var key, i, j;
		var keysToRemove = [];
		for (key in this.schemas) {
			if (Utils.keyIsVariant(key, schemaKey)) {
				keysToRemove.push(key);
			}
		}
		for (key in this.links) {
			if (Utils.keyIsVariant(key, schemaKey)) {
				keysToRemove.push(key);
			}
		}
		for (key in this.matches) {
			if (Utils.keyIsVariant(key, schemaKey)) {
				keysToRemove.push(key);
			}
		}
		for (i = 0; i < keysToRemove.length; i++) {
			key = keysToRemove[i];
			delete this.schemas[key];
			delete this.links[key];
			delete this.matches[key];
			delete this.xorSelectors[key];
			delete this.orSelectors[key];
			delete this.dependencySelectors[key];
		}

		if (keysToRemove.length > 0) {
			this.invalidateSchemaState();
		}
		DelayedCallbacks.decrement();
	},
	clear: function () {
		this.schemas = {};
		this.links = {};
		this.matches = {};
		this.invalidateSchemaState();
	},
	getSchemas: function () {
		if (this.cachedSchemaList !== null) {
			return this.cachedSchemaList;
		}
		var schemaResult = [];
		var fixedSchemas = {};

		var i, j, key, schemaList, schema, alreadyExists;
		for (key in this.schemas) {
			schemaList = this.schemas[key];
			var fixed = this.schemasFixed[key];
			for (i = 0; i < schemaList.length; i++) {
				schema = schemaList[i];
				if (fixed) {
					fixedSchemas[schema.data.uniqueId] = schema;
				}
				alreadyExists = false;
				for (j = 0; j < schemaResult.length; j++) {
					if (schema.equals(schemaResult[j])) {
						alreadyExists = true;
						break;
					}
				}
				if (!alreadyExists) {
					schemaResult.push(schema);
				}
			}
		}
		var schemaFixedResult = [];
		for (var key in fixedSchemas) {
			schemaFixedResult.push(fixedSchemas[key]);
		}
		this.cachedSchemaList = new SchemaList(schemaResult, schemaFixedResult);
		return this.cachedSchemaList;
	},
	getLinks: function(rel) {
		var key, i, keyInstance, keyList;
		if (this.cachedLinkList !== null) {
			return this.cachedLinkList.rel(rel);
		}
		var linkResult = [];
		for (key in this.links) {
			keyList = this.links[key];
			for (i = 0; i < keyList.length; i++) {
				keyInstance = keyList[i];
				if (keyInstance.active) {
					linkResult.push(keyInstance.rawLink);
				}
			}
		}
		this.cachedLinkList = new LinkList(linkResult);
		return this.cachedLinkList.rel(rel);
	},
	invalidateSchemaState: function () {
		this.cachedSchemaList = null;
		this.cachedLinkList = null;
		this.schemasStable = false;
		this.checkForSchemasStable();
	},
	checkForSchemasStable: function () {
		if (this.schemaFlux > 0) {
			// We're in the middle of adding schemas
			// We don't need to mark it as unstable, because if we're
			//  adding or removing schemas or links it will be explicitly invalidated
			return false;
		}
		var i, key, schemaList, schema;
		for (key in this.schemas) {
			schemaList = this.schemas[key];
			for (i = 0; i < schemaList.length; i++) {
				schema = schemaList[i];
				if (!schema.isComplete()) {
					this.schemasStable = false;
					return false;
				}
			}
		}
		
		var thisSchemaSet = this;
		if (!thisSchemaSet.schemasStable) {
			thisSchemaSet.schemasStable = true;
			notifySchemaChangeListeners(thisSchemaSet.dataObj);
		}
		thisSchemaSet.schemasStableListeners.notify(thisSchemaSet.dataObj, thisSchemaSet.getSchemas());
		return true;
	},
	addSchemasForProperty: function (key, subData) {
		for (var schemaKey in this.schemas) {
			var subSchemaKey = Utils.getKeyVariant(schemaKey, "prop");
			for (var i = 0; i < this.schemas[schemaKey].length; i++) {
				var schema = this.schemas[schemaKey][i];
				var subSchemas = schema.propertySchemas(key);
				for (var j = 0; j < subSchemas.length; j++) {
					subData.addSchema(subSchemas[j], subSchemaKey);
				}
			}
		}
	},
	addSchemasForIndex: function (index, subData) {
		for (var schemaKey in this.schemas) {
			var subSchemaKey = Utils.getKeyVariant(schemaKey, "idx");
			for (var i = 0; i < this.schemas[schemaKey].length; i++) {
				var schema = this.schemas[schemaKey][i];
				var subSchemas = schema.indexSchemas(index);
				for (var j = 0; j < subSchemas.length; j++) {
					subData.addSchema(subSchemas[j], subSchemaKey);
				}
			}
		}
	},
	removeSubSchemas: function (subData) {
		//    throw new Error("This should be using more than this.schemas");
		for (var schemaKey in this.schemas) {
			subData.removeSchema(schemaKey);
		}
	},
	whenSchemasStable: function (handlerFunction) {
		this.schemasStableListeners.add(handlerFunction);
		this.checkForSchemasStable();
	}
};

function LinkInstance(dataObj, potentialLink) {
	this.dataObj = dataObj;
	this.potentialLink = potentialLink;
	this.active = false;
	this.rawLink = null;
	this.updateMonitors = new MonitorSet(dataObj);
}
LinkInstance.prototype = {
	update: function (key) {
		var active = this.potentialLink.canApplyTo(this.dataObj);
		if (active) {
			this.rawLink = this.potentialLink.linkForData(this.dataObj);
		} else {
			this.rawLink = null;
		}
		this.active = active;
		this.updateMonitors.notify(this.active);
	},
	rel: function () {
		return this.potentialLink.rel();
	},
	usesKey: function (key) {
		return this.potentialLink.usesKey(key);
	},
	addMonitor: function (schemaKey, monitor) {
		this.updateMonitors.add(schemaKey, monitor);
	}
};

function XorSchemaApplier(options, schemaKey, schemaKeyHistory, schemaSet) {
	var inferredSchemaKey = Utils.getKeyVariant(schemaKey, "$");
	this.xorSelector = new XorSelector(schemaKey, options, schemaSet.dataObj);
	this.xorSelector.onMatchChange(function (selectedOption) {
		schemaSet.removeSchema(inferredSchemaKey);
		if (selectedOption != null) {
			schemaSet.addSchema(selectedOption, inferredSchemaKey, schemaKeyHistory, false);
		} else if (options.length > 0) {
			schemaSet.addSchema(options[0], inferredSchemaKey, schemaKeyHistory, false);
		}
	});
}

function OrSchemaApplier(options, schemaKey, schemaKeyHistory, schemaSet) {
	var inferredSchemaKeys = [];
	var optionsApplied = [];
	for (var i = 0; i < options.length; i++) {
		inferredSchemaKeys[i] = Utils.getKeyVariant(schemaKey, "$" + i);
		optionsApplied[i] = false;
	}
	this.orSelector = new OrSelector(schemaKey, options, schemaSet.dataObj);
	this.orSelector.onMatchChange(function (selectedOptions) {
		for (var i = 0; i < options.length; i++) {
			var found = false;
			for (var j = 0; j < selectedOptions.length; j++) {
				if (options[i] == selectedOptions[j]) {
					found = true;
					break;
				}
			}
			if (found && !optionsApplied[i]) {
				schemaSet.addSchema(options[i], inferredSchemaKeys[i], schemaKeyHistory, false);
			} else if (!found && optionsApplied[i]) {
				schemaSet.removeSchema(inferredSchemaKeys[i]);
			}
			optionsApplied[i] = found;
		}
		if (selectedOptions.length == 0 && options.length > 0) {
			schemaSet.addSchema(options[0], inferredSchemaKeys[0], schemaKeyHistory, false);
		}
	});
}

function DependencyApplier(schema, schemaKey, schemaKeyHistory, schemaSet) {
	this.inferredSchemaKeys = {};
	this.applied = {};
	this.schema = schema;
	this.schemaKeyHistory = schemaKeyHistory;
	this.schemaSet = schemaSet;

	var keys = this.schema.data.property("dependencies").keys();
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		this.inferredSchemaKeys[key] = Utils.getKeyVariant(schemaKey, "$" + i);
		this.dataUpdated(key);
	}
	return;
}
DependencyApplier.prototype = {
	dataUpdated: function (key) {
		if (key == null) {
			var keys = this.schema.data.property("dependencies").keys();
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				this.dataUpdated(key);
			}
			return;
		}
		if (this.schemaSet.dataObj.property(key).defined()) {
			var depList = this.schema.propertyDependencies(key);
			for (var i = 0; i < depList.length; i++) {
				var dep = depList[i];
				if (typeof dep != "string") {
					this.schemaSet.addSchema(dep, this.inferredSchemaKeys[key], this.schemaKeyHistory, false);
				}
			}
		} else {
			this.schemaSet.removeSchema(this.inferredSchemaKeys[key]);
		}
	}
};
