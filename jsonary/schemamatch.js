function SchemaMatch(monitorKey, data, schema) {
	var thisSchemaMatch = this;
	this.monitorKey = monitorKey;
	this.schema = schema;
	this.match = false;
	this.matchFailReason = new SchemaMatchFailReason("initial failure", null);
	this.monitors = new MonitorSet(schema);
	
	this.propertyMatches = {};
	this.indexMatches = {};

	this.dependencies = {};
	this.dependencyKeys = {};

	this.types = schema.types();
	this.data = data;
	this.setupTypeSelector();
	this.dataUpdated();
}
SchemaMatch.prototype = {
	setupTypeSelector: function () {
		var thisSchemaMatch = this;
		this.currentType = null;
		var first = true;
		if (this.types.length > 0) {
			this.typeSelector = new TypeSelector(this.monitorKey, this.types, this.data);
			this.typeSelector.onMatch(function (type) {
				var oldType = thisSchemaMatch.currentType;
				thisSchemaMatch.currentType = type;
				if (oldType == null && !first) {
					thisSchemaMatch.update();
				}
				first = false;
			}).onNoMatch(function () {
				var oldType = thisSchemaMatch.currentType;
				thisSchemaMatch.currentType = null;
				if (oldType != null && !first) {
					thisSchemaMatch.update();
				}
				first = false;
			});
		} else {
			this.typeSelector = null;
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
		if (key == null && this.typeSelector != null) {
			this.typeSelector.updateWithBasicType(this.data.basicType());
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
						}, false);
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
						}, false);
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
					}, false);
					thisSchemaMatch.dependencies[key].push(subMatch);
				})(i);
			}
		}
	},
	notify: function () {
		this.monitors.notify(this.match, this.matchFailReason);
	},
	setMatch: function (match, failReason) {
		if (match && this.match) {
			// If we're failing but not changing state, then the failReason has possibly changed
			// However, if we're succeeding then nothing has changed, so don't notify anybody
			return;
		}
		if (!match && !this.match && this.matchFailReason.equals(failReason)) {
			return;
		}
		this.match = match;
		if (!match) {
			this.matchFailReason = failReason;
		} else {
			this.matchFailReason = null;
		}
		this.notify();
	},
	subMatchUpdated: function (indexKey, subMatch) {
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
			this.matchHasType();
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
	matchHasType: function () {
		if (this.currentType != null || this.types.length == 0) {
			return;
		}
		throw new SchemaMatchFailReason("Data does not match any of the types", this.schema);
	},
	matchAgainstSubMatches: function () {
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
		if (minimum != undefined) {
			if (value < minimum) {
				throw new SchemaMatchFailReason("Number must be >= " + minimum);
			}
		}
		var maximum = this.schema.maximum();
		if (maximum != undefined) {
			if (value > maximum) {
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
	return this.message == other.message && this.schema.equals(other.schema);
};

function TypeSelector(schemaKey, types, dataObj) {
	this.schemaKeyRoot = schemaKey;

	this.schemaMatchKeys = [];
	this.types = types;
	if (this.types.length == 0) {
		throw new Error("Cannot select types from []");
	}

	this.candidateMatchCallback = null;
	this.candidateNoMatchCallback = null;
	this.data = null;
	this.setData(dataObj);
}
TypeSelector.prototype = {
	setData: function (dataObj) {
		// TODO: think through whether we need to remove the listeners (and old value monitors!) here - it might have already happened
		if (this.data == dataObj) {
			return;
		}
		this.data = dataObj;
		var thisTypeSelector = this;
		this.lastValidIndex = null;
		this.currentCandidate = -1;
		this.dataBasicType = dataObj.basicType();
		this.tryNextCandidate();
	},
	onMatch: function (callback) {
		this.candidateMatchCallback = callback;
		if (this.currentCandidate != null) {
			callback.call(this, this.types[this.currentCandidate]);
		}
		return this;
	},
	onNoMatch: function (callback) {
		this.candidateNoMatchCallback = callback;
		if (this.currentCandidate == null) {
			callback.call(this);
		}
		return this;
	},
	basicTypeMatches: function (type) {
		return type === "any" || type === this.dataBasicType || (type === "number" && this.dataBasicType === "integer");
	},
	updateWithBasicType: function (basicType) {
		this.dataBasicType = basicType;
		for (var i = 0; i < this.types.length; i++) {
			var type = this.types[i];
			if (typeof type != "string") {
				continue;
			}
			if (this.basicTypeMatches(type)) {
				this.candidateMatches(i);
				return;
			} else {
				this.candidateDoesNotMatch(i);
			}
		}
	},
	tryNextCandidate: function () {
		this.currentCandidate = (this.currentCandidate + 1) % this.types.length;
		if (this.currentCandidate == this.lastValidIndex) {
			this.currentCandidate = null;
			this.candidatesNoneMatch();
			return;
		} else if (this.lastValidIndex === null) {
			this.lastValidIndex = this.currentCandidate;
		}
		this.tryCandidate(this.currentCandidate);
	},
	tryCandidate: function (index) {
		var thisTypeSelector = this;
		var type = this.types[index];
		if (this.schemaMatchKeys[index] == undefined) {
			this.schemaMatchKeys[index] = Utils.getKeyVariant(this.schemaKeyRoot, "autoType" + index);
		}
		if (typeof type == "string") {
			if (this.basicTypeMatches(type)) {
				this.candidateMatches(index);
			} else {
				this.candidateDoesNotMatch(index);
			}
		} else {
			this.data.addSchemaMatchMonitor(this.schemaMatchKeys[index], type, function (match) {
				if (match) {
					thisTypeSelector.candidateMatches(index);
				} else {
					thisTypeSelector.candidateDoesNotMatch(index);
				}
			});
		}
	},
	candidateMatches: function (index) {
		this.currentCandidate = index;
		var type = this.types[index];
		for (var i = 0; i < this.types.length; i++) {
			if (i != index) {
				var schemaMatchKey = this.schemaMatchKeys[i];
				if (schemaMatchKey != null) {
					this.data.removeSchema(schemaMatchKey);
				}
			}
		}
		this.lastValidIndex = index;
		if (this.candidateMatchCallback != null) {
			this.candidateMatchCallback.call(this, type);
		}
	},
	candidateDoesNotMatch: function (index) {
		if (this.currentCandidate == index) {
			this.tryNextCandidate();
		}
	},
	candidatesNoneMatch: function () {
		if (this.candidateNoMatchCallback != null) {
			this.candidateNoMatchCallback.call(this);
		}
	}
};
