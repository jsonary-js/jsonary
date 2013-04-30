function SchemaMatch(monitorKey, data, schema, impatientCallbacks) {
	var thisSchemaMatch = this;
	this.monitorKey = monitorKey;
	this.match = false;
	this.matchFailReason = new SchemaMatchFailReason("initial failure", null);
	this.monitors = new MonitorSet(schema);
	this.impatientCallbacks = impatientCallbacks;
	
	this.propertyMatches = {};
	this.indexMatches = {};

	this.dependencies = {};
	this.dependencyKeys = {};

	this.schemaLoaded = false;
	this.data = data;
	schema.getFull(function (schema) {
		thisSchemaMatch.schemaLoaded = true;
		thisSchemaMatch.schema = schema;

		thisSchemaMatch.basicTypes = schema.basicTypes();
		thisSchemaMatch.setupXorSelectors();
		thisSchemaMatch.setupOrSelectors();
		thisSchemaMatch.setupAndMatches();
		thisSchemaMatch.setupNotMatches();
		thisSchemaMatch.dataUpdated();
	});
}
SchemaMatch.prototype = {
	setupXorSelectors: function () {
		var thisSchemaMatch = this;
		this.xorSelectors = {};
		var xorSchemas = this.schema.xorSchemas();
		for (var i = 0; i < xorSchemas.length; i++) {
			var xorSelector = new XorSelector(Utils.getKeyVariant(this.monitorKey, "xor" + i), xorSchemas[i], this.data);
			this.xorSelectors[i] = xorSelector;
			xorSelector.onMatchChange(function (selectedOption) {
				thisSchemaMatch.update();
			}, false);
		}
	},
	setupOrSelectors: function () {
		var thisSchemaMatch = this;
		this.orSelectors = {};
		var orSchemas = this.schema.orSchemas();
		for (var i = 0; i < orSchemas.length; i++) {
			var orSelector = new OrSelector(Utils.getKeyVariant(this.monitorKey, "or" + i), orSchemas[i], this.data);
			this.orSelectors[i] = orSelector;
			orSelector.onMatchChange(function (selectedOptions) {
				thisSchemaMatch.update();
			}, false);
		}
	},
	setupAndMatches: function () {
		var thisSchemaMatch = this;
		this.andMatches = [];
		var andSchemas = this.schema.andSchemas();
		andSchemas.each(function (index, subSchema) {
			var keyVariant = Utils.getKeyVariant(thisSchemaMatch.monitorKey, "and" + index);
			var subMatch = thisSchemaMatch.data.addSchemaMatchMonitor(keyVariant, subSchema, function () {
				thisSchemaMatch.update();
			}, false, true);
			thisSchemaMatch.andMatches.push(subMatch);
		});
	},
	setupNotMatches: function () {
		var thisSchemaMatch = this;
		this.notMatches = [];
		var notSchemas = this.schema.notSchemas();
		for (var i = 0; i < notSchemas.length; i++) {
			(function (index, subSchema) {
				var keyVariant = Utils.getKeyVariant(thisSchemaMatch.monitorKey, "not" + index);
				var subMatch = thisSchemaMatch.data.addSchemaMatchMonitor(keyVariant, subSchema, function () {
					thisSchemaMatch.update();
				}, false, true);
				thisSchemaMatch.notMatches.push(subMatch);
			})(i, notSchemas[i]);
		}
	},
	addMonitor: function (monitor, executeImmediately) {
		// TODO: make a monitor set that doesn't require keys.  The keyed one could use it!
		this.monitors.add(this.monitorKey, monitor);
		if (executeImmediately !== false) {
			monitor.call(this.schema, this.match, this.matchFailReason);
		}
		return this;
	},
	dataUpdated: function (key) {
		if (!this.schemaLoaded) {
			return;
		}
		var thisSchemaMatch = this;
		if (this.data.basicType() == "object") {
			this.indexMatches = {};
			this.data.properties(function (key, subData) {
				if (thisSchemaMatch.propertyMatches[key] == undefined) {
					var matches = [];
					var subSchemas = thisSchemaMatch.schema.propertySchemas(key);
					subSchemas.each(function (i, subSchema) {
						var subMatch = subData.addSchemaMatchMonitor(thisSchemaMatch.monitorKey, subSchemas[i], function () {
							thisSchemaMatch.subMatchUpdated(key, subMatch);
						}, false, true);
						matches.push(subMatch);
					});
					thisSchemaMatch.propertyMatches[key] = matches;
					thisSchemaMatch.addDependencies(key);
				}
			});
			var keysToRemove = [];
			for (var key in this.propertyMatches) {
				if (!this.data.property(key).defined()) {
					keysToRemove.push(key);
				}
			};
			for (var i = 0; i < keysToRemove.length; i++) {
				var key = keysToRemove[i];
				delete this.propertyMatches[key];
				if (this.dependencyKeys[key] != undefined) {
					this.data.removeSchema(this.dependencyKeys[key]);
					delete this.dependencies[key];
					delete this.dependencyKeys[key];
				}
			}
		} else if (this.data.basicType() == "array") {
			this.propertyMatches = {};
			this.data.indices(function (index, subData) {
				if (thisSchemaMatch.indexMatches[index] == undefined) {
					var matches = [];
					var subSchemas = thisSchemaMatch.schema.indexSchemas(index);
					subSchemas.each(function (i, subSchema) {
						var subMatch = subData.addSchemaMatchMonitor(thisSchemaMatch.monitorKey, subSchemas[i], function () {
							thisSchemaMatch.subMatchUpdated(key, subMatch);
						}, false, true);
						matches.push(subMatch);
					});
					thisSchemaMatch.indexMatches[index] = matches;
				}
			});
			var keysToRemove = [];
			for (var key in this.indexMatches) {
				if (this.data.length() <= key) {
					keysToRemove.push(key);
				}
			};
			for (var i = 0; i < keysToRemove.length; i++) {
				delete this.indexMatches[keysToRemove[i]];
			}
		} else {
			this.propertyMatches = {};
			this.indexMatches = {};
		}
		this.update();
	},
	addDependencies: function (key) {
		var thisSchemaMatch = this;
		var dependencies = this.schema.propertyDependencies(key);
		this.dependencies[key] = [];
		this.dependencyKeys[key] = [];
		for (var i = 0; i < dependencies.length; i++) {
			var dependency = dependencies[i];
			if (typeof (dependency) == "string") {
				this.dependencies[key].push(dependency);
			} else {
				(function (index) {
					var subMonitorKey = Utils.getKeyVariant(thisSchemaMatch.monitorKey, "dep:" + key + ":" + index);
					thisSchemaMatch.dependencyKeys[key].push(subMonitorKey);
					var subMatch = thisSchemaMatch.data.addSchemaMatchMonitor(subMonitorKey, dependency, function () {
						thisSchemaMatch.dependencyUpdated(key, index);
					}, false, true);
					thisSchemaMatch.dependencies[key].push(subMatch);
				})(i);
			}
		}
	},
	notify: function () {
		this.monitors.notify(this.match, this.matchFailReason);
	},
	setMatch: function (match, failReason) {
		var thisMatch = this;
		var oldMatch = this.match;
		var oldFailReason = this.matchFailReason;
		
		this.match = match;
		if (!match) {
			this.matchFailReason = failReason;
		} else {
			this.matchFailReason = null;
		}
		if (this.impatientCallbacks) {
			return this.notify();
		}
		
		if (this.pendingNotify) {
			return;
		}
		this.pendingNotify = true;
		DelayedCallbacks.add(function () {
			thisMatch.pendingNotify = false;
			if (thisMatch.match && oldMatch) {
				// Still matches - no problem
				return;
			}
			if (!thisMatch.match && !oldMatch && thisMatch.matchFailReason.equals(oldFailReason)) {
				// Still failing for the same reason
				return;
			}
			thisMatch.notify();
		});
	},	subMatchUpdated: function (indexKey, subMatch) {
		this.update();
	},
	subMatchRemoved: function (indexKey, subMatch) {
		this.update();
	},
	dependencyUpdated: function (key, index) {
		this.update();
	},
	update: function () {
		try {
			this.matchAgainstBasicTypes();
			this.matchAgainstSubMatches();
			this.matchAgainstImmediateConstraints();
			this.setMatch(true);
		} catch (exception) {
			if (exception instanceof SchemaMatchFailReason) {
				this.setMatch(false, exception);
			} else {
				throw exception;
			}
		}
	},
	matchAgainstBasicTypes: function () {
		var basicType = this.data.basicType();
		for (var i = 0; i < this.basicTypes.length; i++) {
			if (this.basicTypes[i] == basicType || basicType == "integer" && this.basicTypes[i] == "number") {
				return;
			}
		}
		throw new SchemaMatchFailReason("Data does not match any of the basic types: " + this.basicTypes, this.schema);
	},
	matchAgainstSubMatches: function () {
		for (var i = 0; i < this.andMatches.length; i++) {
			var andMatch = this.andMatches[i];
			if (!andMatch.match) {
				var message = "extended schema #" + i + ": " + andMatch.message;
				throw new SchemaMatchFailReason(message, this.schema, andMatch.failReason);
			}
		}
		for (var i = 0; i < this.notMatches.length; i++) {
			var notMatch = this.notMatches[i];
			if (notMatch.match) {
				var message = "\"not\" schema #" + i + " matches";
				throw new SchemaMatchFailReason(message, this.schema);
			}
		}
		for (var key in this.xorSelectors) {
			var selector = this.xorSelectors[key];
			if (selector.selectedOption == null) {
				var message = "XOR #" + key + ": " + selector.failReason.message;
				throw new SchemaMatchFailReason(message, this.schema, selector.failReason);
			}
		}
		for (var key in this.orSelectors) {
			var selector = this.orSelectors[key];
			if (selector.selectedOptions.length == 0) {
				var message = "OR #" + key + ": no matches";
				throw new SchemaMatchFailReason(message, this.schema);
			}
		}
		for (var key in this.propertyMatches) {
			var subMatchList = this.propertyMatches[key];
			for (var i = 0; i < subMatchList.length; i++) {
				var subMatch = subMatchList[i];
				if (!subMatch.match) {
					var message = key + ": " + subMatch.matchFailReason.message;
					throw new SchemaMatchFailReason(message, this.schema, subMatch.matchFailReason);
				}
			}
		}
		for (var key in this.indexMatches) {
			var subMatchList = this.indexMatches[key];
			for (var i = 0; i < subMatchList.length; i++) {
				var subMatch = subMatchList[i];
				if (!subMatch.match) {
					var message = key + ": " + subMatch.matchFailReason.message;
					throw new SchemaMatchFailReason(message, this.schema, subMatch.matchFailReason);
				}
			}
		}
	},
	matchAgainstImmediateConstraints: function () {
		this.matchAgainstEnums();
		this.matchAgainstNumberConstraints();
		this.matchAgainstArrayConstraints();
		this.matchAgainstObjectConstraints();
	},
	matchAgainstEnums: function () {
		var enumList = this.schema.enumData();
		if (enumList.defined()) {
			for (var i = 0; i < enumList.length(); i++) {
				var enumValue = enumList.index(i);
				if (enumValue.equals(this.data)) {
					return;
				}
			}
			throw new SchemaMatchFailReason("Data does not match enum: " + JSON.stringify(enumList.value()) + " (" + JSON.stringify(this.data.value()) + ")", this.schema);
		}
	},
	matchAgainstNumberConstraints: function () {
		if (this.data.basicType() != "number" && this.data.basicType() != "integer") {
			return;
		}
		var value = this.data.value();
		var interval = this.schema.numberInterval();
		if (interval != undefined) {
			if (value%interval != 0) {
				throw new SchemaMatchFailReason("Number must be divisible by " + interval);
			}
		}
		var minimum = this.schema.minimum();
		if (minimum !== undefined) {
			if (this.schema.exclusiveMinimum()) {
				if (value <= minimum) {
					throw new SchemaMatchFailReason("Number must be > " + minimum);
				}
			} else if (value < minimum) {
				throw new SchemaMatchFailReason("Number must be >= " + minimum);
			}
		}
		var maximum = this.schema.maximum();
		if (maximum != undefined) {
			if (this.schema.exclusiveMaximum()) {
				if (value >= maximum) {
					throw new SchemaMatchFailReason("Number must be < " + maximum);
				}
			} else if (value > maximum) {
				throw new SchemaMatchFailReason("Number must be <= " + maximum);
			}
		}
	},
	matchAgainstArrayConstraints: function () {
		if (this.data.basicType() != "array") {
			return;
		}
		var minItems = this.schema.minItems();
		if (minItems !== undefined && minItems > this.data.length()) {
			throw new SchemaMatchFailReason("Data is not long enough - minimum length is " + minItems, this.schema);
		}
		var maxItems = this.schema.maxItems();
		if (maxItems !== undefined && maxItems < this.data.length()) {
			throw new SchemaMatchFailReason("Data is too long - maximum length is " + maxItems, this.schema);
		}
	},
	matchAgainstObjectConstraints: function () {
		if (this.data.basicType() != "object") {
			return;
		}
		var required = this.schema.requiredProperties();
		for (var i = 0; i < required.length; i++) {
			var key = required[i];
			if (!this.data.property(key).defined()) {
				throw new SchemaMatchFailReason("Missing key " + JSON.stringify(key), this.schema);
			}
		}
		this.matchAgainstDependencies();
	},
	matchAgainstDependencies: function () {
		for (var key in this.dependencies) {
			if (this.data.property(key) == undefined) {
				continue;
			}
			var dependencyList = this.dependencies[key];
			for (var i = 0; i < dependencyList.length; i++) {
				var dependency = dependencyList[i];
				if (typeof dependency == "string") {
					if (!this.data.property(dependency).defined()) {
						throw new SchemaMatchFailReason("Dependency - property " + JSON.stringify(key) + " requires property " + JSON.stringify(dependency), this.schema);
					}
				} else {
					if (!dependency.match) {
						throw new SchemaMatchFailReason("Dependency for " + key, this.schema, dependency.matchFailReason);
					}
				}
			}
		}
	}
};

function SchemaMatchFailReason(message, schema, subMatchFailReason) {
	this.message = message;
	this.schema = schema;
	this.subMatchFailReason = subMatchFailReason;
}
SchemaMatchFailReason.prototype = new Error();
SchemaMatchFailReason.prototype.toString = function () {
	return this.message + " in " + this.schema.title();
};
SchemaMatchFailReason.prototype.equals = function (other) {
	if (!(other instanceof SchemaMatchFailReason)) {
		return false;
	}
	if (this.subMatchFailReason == null) {
		if (other.subMatchFailReason != null) {
			return false;
		}
	} else if (other.subMatchFailReason == null || !this.subMatchFailReason.equals(other.subMatchFailReason)) {
		return false;
	}
	return this.message == other.message && (this.schema == null && other.schema == null || this.schema != null && other.schema != null && this.schema.equals(other.schema));
};

function XorSelector(schemaKey, options, dataObj) {
	var thisXorSelector = this;
	this.options = options;
	this.matchCallback = null;
	this.selectedOption = null;
	this.data = dataObj;
	
	this.subMatches = [];
	this.subSchemaKeys = [];
	var pendingUpdate = false;
	for (var i = 0; i < options.length; i++) {
		this.subSchemaKeys[i] = Utils.getKeyVariant(schemaKey, "option" + i);
		this.subMatches[i] = dataObj.addSchemaMatchMonitor(this.subSchemaKeys[i], options[i], function () {
			thisXorSelector.update();
		}, false, true);
	}
	this.update();
}
XorSelector.prototype = {
	onMatchChange: function (callback, executeImmediately) {
		this.matchCallback = callback;
		if (executeImmediately !== false) {
			callback.call(this, this.selectedOption);
		}
		return this;
	},
	update: function () {
		var nextOption = null;
		var failReason = "No matches";
		for (var i = 0; i < this.subMatches.length; i++) {
			if (this.subMatches[i].match) {
				if (nextOption == null) {
					nextOption = this.options[i];
					failReason = null;
				} else {
					failReason = "multiple matches";
					nextOption = null;
					break;
				}
			}
		}
		this.failReason = new SchemaMatchFailReason(failReason);
		if (this.selectedOption != nextOption) {
			this.selectedOption = nextOption;
			if (this.matchCallback != undefined) {
				this.matchCallback.call(this, this.selectedOption);
			}
		}
	}
};

function OrSelector(schemaKey, options, dataObj) {
	var thisOrSelector = this;
	this.options = options;
	this.matchCallback = null;
	this.selectedOptions = [];
	this.data = dataObj;
	
	this.subMatches = [];
	this.subSchemaKeys = [];
	var pendingUpdate = false;
	for (var i = 0; i < options.length; i++) {
		this.subSchemaKeys[i] = Utils.getKeyVariant(schemaKey, "option" + i);
		this.subMatches[i] = dataObj.addSchemaMatchMonitor(this.subSchemaKeys[i], options[i], function () {
			thisOrSelector.update();
		}, false, true);
	}
	this.update();
}
OrSelector.prototype = {
	onMatchChange: function (callback, executeImmediately) {
		this.matchCallback = callback;
		if (executeImmediately !== false) {
			callback.call(this, this.selectedOptions);
		}
		return this;
	},
	update: function () {
		var nextOptions = [];
		var failReason = "No matches";
		for (var i = 0; i < this.subMatches.length; i++) {
			if (this.subMatches[i].match) {
				nextOptions.push(this.options[i]);
			}
		}
		var difference = false;
		if (nextOptions.length != this.selectedOptions.length) {
			difference = true;
		} else {
			for (var i = 0; i < nextOptions.length; i++) {
				if (nextOptions[i] != this.selectedOptions[i]) {
					difference = true;
					break;
				}
			}
		}
		if (difference) {
			this.selectedOptions = nextOptions;
			if (this.matchCallback != undefined) {
				this.matchCallback.call(this, this.selectedOptions);
			}
		}
	}
};
