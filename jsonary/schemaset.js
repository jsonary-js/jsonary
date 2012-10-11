var schemaChangeListeners = [];
publicApi.registerSchemaChangeListener = function (listener) {
	schemaChangeListeners.push(listener);
};
function notifySchemaChangeListeners(data, schemaList) {
	for (var i = 0; i < schemaChangeListeners.length; i++) {
		schemaChangeListeners[i].call(data, data, schemaList);
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
function SchemaList(schemaList) {
	if (schemaList == undefined) {
		this.length = 0;
		return;
	}
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
	potentialLinks: function () {
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
	definedProperties: function () {
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
		var result = [];
		for (var key in definedKeys) {
			result.push(key);
		}
		cacheResult(this, {
			definedProperties: result,
			allowedAdditionalProperties: additionalProperties
		});
		return result;
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
	basicTypes: function () {
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
		var basicTypesList = [];
		for (var basicType in basicTypes) {
			basicTypesList.push(basicType);
		}
		return basicTypesList;
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
		return this.exclusiveMinimum;
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
		return this.exclusiveMinimum;
	},
	minItems: function () {
		var minItems = 0;
		for (var i = 0; i < this.length; i++) {
			var otherMinItems = this[i].minItems();
			if (otherMinItems > minItems) {
				minItems = otherMinItems;
			}
		}
		return minItems;
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
	createValue: function(callback) {
		if (callback != null) {
			this.getFull(function (schemas) {
				callback.call(this, schemas.createValue());
			});
			return;
		}
		var candidates = [];
		for (var i = 0; i < this.length; i++) {
			if (this[i].hasDefault()) {
				candidates.push(this[i].defaultValue());
			}
		}
		var enumValues = this.enumValues();
		if (enumValues != undefined) {
			for (var i = 0; i < enumValues.length; i++) {
				candidates.push(enumValues[i]);
			}
		} else {
			var basicTypes = this.basicTypes();
			for (var i = 0; i < basicTypes.length; i++) {
				var basicType = basicTypes[i];
				if (basicType == "null") {
					candidates.push(null);
				} else if (basicType == "boolean") {
					candidates.push(true);
				} else if (basicType == "integer" || basicType == "number") {
					var candidate = this.createValueNumber();
					if (candidate !== undefined) {
						candidates.push(candidate);
					}
				} else if (basicType == "string") {
					var candidate = this.createValueString();
					if (candidate !== undefined) {
						candidates.push(candidate);
					}
				} else if (basicType == "array") {
					var candidate = this.createValueArray();
					if (candidate !== undefined) {
						candidates.push(candidate);
					}
				} else if (basicType == "object") {
					var candidate = this.createValueObject();
					if (candidate !== undefined) {
						candidates.push(candidate);
					}
				}
			}
		}
		for (var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
			var candidate = candidates[candidateIndex];
			return candidate;
		}
		return null;
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
	createValueArray: function () {
		var candidate = [];
		var minItems = this.minItems();
		if (minItems != undefined) {
			while (candidate.length < minItems) {
				candidate.push(this.createValueForIndex(candidate.length));
			}
		}
		return candidate;
	},
	createValueObject: function () {
		var candidate = {};
		var requiredProperties = this.requiredProperties();
		for (var i = 0; i < requiredProperties.length; i++) {
			var key = requiredProperties[i];
			candidate[key] = this.createValueForProperty(key);
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
	getFull: function(callback) {
		if (this.length == 0) {
			return this;
		}
		var pending = 0;
		var result = [];
		function addAll(list) {
			pending += list.length;
			for (var i = 0; i < list.length; i++) {
				list[i].getFull(function(schema) {
					for (var i = 0; i < result.length; i++) {
						if (schema.equals(result[i])) {
							pending--;
							if (pending == 0) {
								var fullList = new SchemaList(result);
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
						var fullList = new SchemaList(result);
						callback.call(fullList, fullList);
					}
				});
			}
		}
		addAll(this);
		return this;
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
	this.links = {};
	this.matches = {};
	this.xorSelectors = {};
	this.orSelectors = {};
	this.schemaFlux = 0;
	this.schemasStable = true;

	this.schemasStableListeners = new ListenerSet(dataObj);
	this.schemaMonitors = new MonitorSet(dataObj);

	this.cachedSchemaList = null;
	this.cachedLinkList = null;
}
var counter = 0;
SchemaSet.prototype = {
	update: function (key) {
		this.updateLinksWithKey(key);
		this.updateMatchesWithKey(key);
	},
	baseSchemas: function () {
		var result = [];
		for (var key in this.schemas) {
			if (Utils.keyIsRoot(key)) {
				result = result.concat(this.schemas[key]);
			}
		}
		return result;
	},
	updateLinksWithKey: function (key) {
		var schemaKey, i, linkList, linkInstance;
		var linksToUpdate = [];
		for (schemaKey in this.links) {
			linkList = this.links[schemaKey];
			for (i = 0; i < linkList.length; i++) {
				linkInstance = linkList[i];
				if (linkInstance.usesKey(key)) {
					linksToUpdate.push(linkInstance);
				}
			}
		}
		if (linksToUpdate.length > 0) {
			for (i = 0; i < linksToUpdate.length; i++) {
				linkInstance = linksToUpdate[i];
				linkInstance.update();
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
			for (var i = 0; i < matchList.length; i++) {
				matchList[i].dataUpdated(key);
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
	addSchema: function (schema, schemaKey, schemaKeyHistory) {
		if (counter++ > 1000) {
			throw new Error("Only allowed 1000 dependent schema in total (for a given base key): " + JSON.stringify(schema.data.value()));
		}
		var thisSchemaSet = this;
		if (schemaKey == undefined) {
			schemaKey = Utils.getUniqueKey();
			counter = 0;
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

			thisSchemaSet.schemas[schemaKey][thisSchemaSet.schemas[schemaKey].length] = schema;

			thisSchemaSet.dataObj.properties(function (key, child) {
				var subSchemas = schema.propertySchemas(key);
				for (var i = 0; i < subSchemas.length; i++) {
					child.addSchema(subSchemas[i], schemaKey, schemaKeyHistory);
				}
			});
			thisSchemaSet.dataObj.indices(function (i, child) {
				var subSchemas = schema.indexSchemas(i);
				for (var i = 0; i < subSchemas.length; i++) {
					child.addSchema(subSchemas[i], schemaKey, schemaKeyHistory);
				}
			});

			var ext = schema.extendSchemas();
			for (var i = 0; i < ext.length; i++) {
				thisSchemaSet.addSchema(ext[i], schemaKey, schemaKeyHistory);
			}

			thisSchemaSet.addLinks(schema.links(), schemaKey, schemaKeyHistory);
			thisSchemaSet.addXorSelectors(schema, schemaKey, schemaKeyHistory);
			thisSchemaSet.addOrSelectors(schema, schemaKey, schemaKeyHistory);

			thisSchemaSet.schemaFlux--;
			thisSchemaSet.invalidateSchemaState();
		});
	},
	addLinks: function (potentialLinks, schemaKey, schemaKeyHistory) {
		var i, linkInstance;
		if (this.links[schemaKey] == undefined) {
			this.links[schemaKey] = [];
		}
		for (i = 0; i < potentialLinks.length; i++) {
			linkInstance = new LinkInstance(this.dataObj, potentialLinks[i]);
			this.links[schemaKey].push(linkInstance);
			this.addMonitorForLink(linkInstance, schemaKey, schemaKeyHistory);
			linkInstance.update();
		}
		this.invalidateSchemaState();
	},
	addXorSelectors: function (schema, schemaKey, schemaKeyHistory) {
		var xorSchemas = schema.xorSchemas();
		var selectors = [];
		for (var i = 0; i < xorSchemas.length; i++) {
			var selector = new XorSchemaApplier(xorSchemas[i], Utils.getKeyVariant(schemaKey, "xor" + i), schemaKeyHistory, this);
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
		}
		if (this.orSelectors[schemaKey] == undefined) {
			this.orSelectors[schemaKey] = selectors;
		} else {
			this.orSelectors[schemaKey] = this.orSelectors[schemaKey].concat(selectors);
		}
	},
	addLink: function (rawLink) {
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
					thisSchemaSet.addSchema(schema, subSchemaKey, schemaKeyHistory);
				}
			});
		}
	},
	addSchemaMatchMonitor: function (monitorKey, schema, monitor, executeImmediately) {
		var schemaMatch = new SchemaMatch(monitorKey, this.dataObj, schema);
		if (this.matches[monitorKey] == undefined) {
			this.matches[monitorKey] = [];
		}
		this.matches[monitorKey].push(schemaMatch);
		schemaMatch.addMonitor(monitor, executeImmediately);
		return schemaMatch;
	},
	removeSchema: function (schemaKey) {
		//Utils.log(Utils.logLevel.DEBUG, "Actually removing schema:" + schemaKey);

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
		}

		if (keysToRemove.length > 0) {
			this.invalidateSchemaState();
		}
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

		var i, j, key, schemaList, schema, alreadyExists;
		for (key in this.schemas) {
			schemaList = this.schemas[key];
			for (i = 0; i < schemaList.length; i++) {
				schema = schemaList[i];
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
		this.cachedSchemaList = new SchemaList(schemaResult);
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
	notifySchemaMonitors: function () {
		this.schemaMonitors.notify(this.getSchemas());
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

		if (!this.schemasStable) {
			this.schemasStable = true;
			this.schemaMonitors.notify(this.getSchemas());
			notifySchemaChangeListeners(this.dataObj, this.getSchemas());
		}
		this.schemasStableListeners.notify(this.dataObj, this.getSchemas());
		return true;
	},
	addSchemasForProperty: function (key, subData) {
		for (var schemaKey in this.schemas) {
			for (var i = 0; i < this.schemas[schemaKey].length; i++) {
				var schema = this.schemas[schemaKey][i];
				var subSchemas = schema.propertySchemas(key);
				for (var j = 0; j < subSchemas.length; j++) {
					subData.addSchema(subSchemas[j], schemaKey);
				}
			}
		}
	},
	addSchemasForIndex: function (index, subData) {
		for (var schemaKey in this.schemas) {
			for (var i = 0; i < this.schemas[schemaKey].length; i++) {
				var schema = this.schemas[schemaKey][i];
				var subSchemas = schema.indexSchemas(index);
				for (var j = 0; j < subSchemas.length; j++) {
					subData.addSchema(subSchemas[j], schemaKey);
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
	},
	// TODO: we shouldn't be using these at all
	addSchemaMonitor: function (monitorKey, monitor, executeImmediately) {
		this.schemaMonitors.add(monitorKey, monitor);
		if (executeImmediately !== false) {
			monitor.call(this.dataObj, this.getSchemas());
		}
	},
	removeSchemaMonitor: function (monitorKey) {
		this.schemaMonitors.remove(monitorKey);
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
		this.active = this.potentialLink.canApplyTo(this.dataObj);
		if (this.active) {
			this.rawLink = this.potentialLink.linkForData(this.dataObj);
		}
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
	var inferredSchemaKey = Utils.getKeyVariant(schemaKey, "auto");
	this.xorSelector = new XorSelector(schemaKey, options, schemaSet.dataObj);
	this.xorSelector.onMatchChange(function (selectedOption) {
		schemaSet.removeSchema(inferredSchemaKey);
		if (selectedOption != null) {
			schemaSet.addSchema(selectedOption, inferredSchemaKey, schemaKeyHistory);
		}
	});
}

function OrSchemaApplier(options, schemaKey, schemaKeyHistory, schemaSet) {
	var inferredSchemaKeys = [];
	var optionsApplied = [];
	for (var i = 0; i < options.length; i++) {
		inferredSchemaKeys[i] = Utils.getKeyVariant(schemaKey, "auto" + i);
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
				schemaSet.addSchema(options[i], inferredSchemaKeys[i], schemaKeyHistory);
			} else if (!found && optionsApplied[i]) {
				schemaSet.removeSchema(inferredSchemaKeys[i]);
			}
			optionsApplied[i] = found;
		}
	});
}
