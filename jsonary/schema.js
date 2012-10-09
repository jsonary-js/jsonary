var ALL_TYPES = ["null", "boolean", "integer", "number", "string", "array", "object"];

function getSchema(url, callback) {
	return publicApi.getData(url, function(data, fragmentRequest) {
		var schema = data.asSchema();
		callback.call(schema, schema, fragmentRequest);
	});
}
publicApi.createSchema = function (rawData, baseUrl) {
	var data = publicApi.create(rawData, baseUrl, true);
	return data.asSchema();
};

publicApi.getSchema = getSchema;

function Schema(data) {
	this.data = data;
	var referenceUrl = data.referenceUrl();
	var id = data.propertyValue("id");
	// TODO: if id is set, then cache it somehow, so we can find it again?

	var potentialLinks = [];
	var i, linkData;
	var linkDefinitions = data.property("links");
	if (linkDefinitions !== undefined) {
		linkDefinitions.indices(function (index, subData) {
			potentialLinks[potentialLinks.length] = new PotentialLink(subData);
		});
	}
	this.links = function () {
		return potentialLinks.slice(0);
	};
	this.schemaTitle = this.title();
}
Schema.prototype = {
	"toString": function () {
		return "<Schema " + this.data + ">";
	},
	referenceUrl: function () {
		return this.data.referenceUrl();
	},
	isComplete: function () {
		var refUrl = this.data.propertyValue("$ref");
		return refUrl === undefined;
	},
	getFull: function (callback) {
		var refUrl = this.data.propertyValue("$ref");
		if (refUrl === undefined) {
			callback(this, undefined);
			return;
		}
		refUrl = this.data.resolveUrl(refUrl);
		getSchema(refUrl, callback);
	},
	title: function () {
		var title = this.data.propertyValue("title");
		if (title == undefined) {
			title = null;
		}
		return title;
	},
	hasDefault: function() {
		return this.data.property("default").defined();
	},
	defaultValue: function() {
		return this.data.propertyValue("default");
	},
	propertySchemas: function (key) {
		var subSchema = this.data.property("properties").property(key);
		if (!subSchema.defined()) {
			subSchema = this.data.property("additionalProperties");
		}
		if (subSchema.defined()) {
			var result = subSchema.asSchema();
			return new SchemaList([result]);
		}
		return new SchemaList();
	},
	propertyDependencies: function (key) {
		var dependencies = this.data.property("dependencies");
		if (dependencies.defined()) {
			var dependency = dependencies.property(key);
			if (dependency.defined()) {
				if (dependency.basicType() == "string") {
					return [dependency.value()];
				} else if (dependency.basicType() == "array") {
					return dependency.value();
				} else {
					return new SchemaList([dependency.asSchema()]);
				}
			}
		}
		return new SchemaList();
	},
	indexSchemas: function (i) {
		var items = this.data.property("items");
		var subSchema;
		if (!items.defined()) {
			return new SchemaList();
		}
		if (items.basicType() == "array") {
			subSchema = items.index(i);
			if (!subSchema.defined()) {
				subSchema = this.data.property("additionalItems");
			}
		} else {
			subSchema = items;
		}
		if (subSchema.defined()) {
			var result = subSchema.asSchema();
			return new SchemaList([result]);
		}
		return new SchemaList();
	},
	extendSchemas: function () {
		var extData = this.data.property("extends");
		var ext = [];
		if (extData.defined()) {
			if (extData.basicType() == "array") {
				extData.indices(function (i, e) {
					ext[ext.length] = e.asSchema();
				});
			} else {
				ext[0] = extData.asSchema();
			}
		}
		return new SchemaList(ext);
	},
	types: function () {
		var typeData = this.data.property("type");
		var types = [];
		if (typeData.defined()) {
			if (typeData.basicType() == "array") {
				typeData.indices(function (i, t) {
					if (t.basicType() === "string") {
						types.push(t.value());
					} else {
						types.push(t.asSchema());
					}
				});
			} else {
				if (typeData.basicType() === "string") {
					types[0] = typeData.value();
				} else {
					types[0] = typeData.asSchema();
				}
			}
		}
		return types;
	},
	basicTypes: function () {
		var types = this.types();
		var basicTypes = {};
		for (var i = 0; i < types.length; i++) {
			var type = types[i];
			if (typeof type === "string") {
				if (type === "any") {
					return ALL_TYPES;
				}
				basicTypes[type] = true;
			}
		}
		var basicTypesList = [];
		for (var basicType in basicTypes) {
			basicTypesList.push(basicType);
		}
		if (basicTypesList.length === 0) {
			return ALL_TYPES;
		}
		return basicTypesList;
	},
	equals: function (otherSchema) {
		if (this === otherSchema) {
			return true;
		}
		if (this.referenceUrl() !== undefined && otherSchema.referenceUrl() !== undefined) {
			return this.referenceUrl() === otherSchema.referenceUrl();
		}
		return this.data.equals(otherSchema.data);
	},
	enumValues: function () {
		return this.data.propertyValue("enum");
	},
	enumData: function () {
		return this.data.property("enum");
	},
	minItems: function () {
		return this.data.propertyValue("minItems");
	},
	maxItems: function () {
		return this.data.propertyValue("maxItems");
	},
	numberInterval: function() {
		return this.data.propertyValue("divisibleBy");
	},
	minimum: function () {
		return this.data.propertyValue("minimum");
	},
	exclusiveMinimum: function () {
		return !!this.data.propertyValue("exclusiveMinimum");
	},
	maximum: function () {
		return this.data.propertyValue("maximum");
	},
	exclusiveMaximum: function () {
		return !!this.data.propertyValue("exclusiveMaximum");
	},
	definedProperties: function() {
		var result = {};
		this.data.property("properties").properties(function (key, subData) {
			result[key] = true;
		});
		this.data.property("required").items(function (index, subData) {
			result[subData.value()] = true;
		});
		var resultArray = [];
		for (var key in result) {
			resultArray.push(key);
		}
		return resultArray;
	},
	requiredProperties: function () {
		var requiredKeys = this.data.propertyValue("required");
		if (typeof requiredKeys != "object") {
			requiredKeys = [];
		}
		var properties = this.data.property("properties");
		if (properties != undefined) {
			properties.properties(function (key, subData) {
				var required = subData.property("required");
				if (required != undefined && required.basicType() == "boolean" && required.value()) {
					requiredKeys.push(key);
				}
			});
		}
		return requiredKeys;
	},
	allowedAdditionalProperties: function () {
		return !(this.data.propertyValue("additionalProperties") === false);
	},
	getLink: function (rel) {
		var links = this.links();
		for (var i = 0; i < links.length; i++) {
			if (links[i].rel() == rel) {
				return links[i];
			}
		}
	},
	asList: function () {
		return new SchemaList([this]);
	}
};

publicApi.extendSchema = function (obj) {
	for (var key in obj) {
		if (Schema.prototype[key] == undefined) {
			Schema.prototype[key] = obj[key];
		}
	}
};

function PotentialLink(linkData) {
	var i, part, index, partConstant, partName;
	var parts = linkData.propertyValue("href").split("{");
	this.constantParts = [];
	this.dataParts = [];
	this.data = linkData;

	this.constantParts[0] = parts[0];
	for (i = 1; i < parts.length; i++) {
		part = parts[i];
		index = part.indexOf("}");
		partName = part.substring(0, index);
		partConstant = part.substring(index + 1);
		if (partName == "@") {
			this.dataParts[i - 1] = null;
		} else {
			this.dataParts[i - 1] = partName;
		}
		this.constantParts[i] = partConstant;
	}
	
	var schemaData = linkData.property("schema");
	if (schemaData.defined()) {
		var schema = schemaData.asSchema();
		this.submissionSchemas = new SchemaList([schema]);
	} else {
		this.submissionSchemas = new SchemaList();
	}
	var targetSchemaData = linkData.property("targetSchema");
	if (targetSchemaData != undefined) {
		this.targetSchema = targetSchemaData.asSchema();
	}
	
	this.handlers = [];
	this.preHandlers = [];
}
PotentialLink.prototype = {
	addHandler: function(handler) {
		this.handlers.unshift(handler);
		return this;
	},
	addPreHandler: function(handler) {
		this.preHandlers.push(handler);
		return this;
	},
	canApplyTo: function (privateData) {
		var i, key, subData = null, basicType;
		for (i = 0; i < this.dataParts.length; i++) {
			key = this.dataParts[i];
			if (key === null) {
				subData = privateData;
			} else if (privateData.basicType() == "object") {
				subData = privateData.property(key);
			} else if (privateData.basicType() == "array" && isIndex(key)) {
				subData = privateData.index(key);
			}
			if (subData == undefined) {
				return false;
			}
			basicType = subData.basicType();
			if (basicType != "string" && basicType != "number" && basicType != "integer") {
				return false;
			}
		}
		return true;
	},
	linkForData: function (publicData) {
		var href = this.constantParts[0];
		var i, key, subData;
		for (i = 0; i < this.dataParts.length; i++) {
			key = this.dataParts[i];
			if (key === null) {
				subData = publicData;
			} else if (publicData.basicType() == "object") {
				subData = publicData.property(key);
			} else {
				subData = publicData.index(key);
			}
			href += subData.value();
			href += this.constantParts[i + 1];
		}
		var rawLink = this.data.value();
		rawLink.href = publicData.resolveUrl(href);
		return new ActiveLink(rawLink, this, publicData);
	},
	usesKey: function (key) {
		var i;
		for (i = 0; i < this.dataParts.length; i++) {
			if (this.dataParts[i] === key) {
				return true;
			}
		}
		return false;
	},
	rel: function () {
		return this.data.propertyValue("rel");
	}
};

var defaultLinkHandlers = [];
var defaultLinkPreHandlers = [];
publicApi.addLinkHandler = function(handler) {
	defaultLinkHandlers.unshift(handler);
};
publicApi.addLinkPreHandler = function(handler) {
	defaultLinkPreHandlers.push(handler);
};

function ActiveLink(rawLink, potentialLink, data) {
	this.rawLink = rawLink;
	this.definition = potentialLink;
	this.subjectData = data;

	this.href = rawLink.href;
	var hashIndex = this.href.indexOf('#');
	if (hashIndex >= 0) {
		this.hrefBase = this.href.substring(0, hashIndex);
		this.hrefFragment = this.href.substring(hashIndex + 1);
	} else {
		this.hrefBase = this.href;
		this.hrefFragment = "";
	}

	this.rel = rawLink.rel;
	this.method = (rawLink.method != undefined) ? rawLink.method : "GET";
	if (rawLink.enctype != undefined) {
		rawLink.encType = rawLink.enctype;
		delete rawLink.enctype;
	}
	if (rawLink.encType == undefined) {
		if (this.method == "GET") {
			this.encType = "application/x-www-form-urlencoded";
		} else if (this.method == "POST" || this.method == "PUT") {
			this.encType = "application/json";
		} else {
			this.encType = "application/x-www-form-urlencoded";
		}
	} else {
		this.encType = rawLink.encType;
	}
	if (this.definition != null) {
		this.submissionSchemas = this.definition.submissionSchemas;
		this.targetSchema = this.definition.targetSchema;
	}
}
var ACTIVE_LINK_SCHEMA_KEY = Utils.getUniqueKey();
ActiveLink.prototype = {
	toString: function() {
		return this.href;
	},
	createSubmissionData: function(callback) {
		var hrefBase = this.hrefBase;
		var submissionSchemas = this.submissionSchemas;
		submissionSchemas.getFull(function(fullList) {
			var value = fullList.createValue();
			var data = publicApi.create(value, hrefBase);
			for (var i = 0; i < fullList.length; i++) {
				data.addSchema(fullList[i], ACTIVE_LINK_SCHEMA_KEY);
			}
			callback(data);
		});
		return this;
	},
	follow: function(submissionData, extraHandler) {
		if (typeof submissionData == 'function') {
			extraHandler = submissionData;
			submissionData = undefined;
		}
		if (submissionData !== undefined) {
			if (!(submissionData instanceof Data)) {
				submissionData = publicApi.create(submissionData);
			}
		} else {
			submissionData = publicApi.create(undefined);
		}
		var preHandlers = defaultLinkPreHandlers.concat(this.definition.preHandlers);
		for (var i = 0; i < preHandlers.length; i++) {
			var handler = preHandlers[i];
			if (handler.call(this, this, submissionData) === false) {
				Utils.log(Utils.logLevel.DEBUG, "Link cancelled: " + this.href);
				return null;
			}
		}
		var value = submissionData.value();
		
		var request = publicApi.getData({
			url:this.href,
			method:this.method,
			data:value,
			encType:this.encType
		}, null, this.targetSchema);
		submissionData = submissionData.readOnlyCopy();
		var handlers = this.definition.handlers.concat(defaultLinkHandlers);
		if (extraHandler !== undefined) {
			handlers.unshift(extraHandler);
		}
		for (var i = 0; i < handlers.length; i++) {
			var handler = handlers[i];
			if (handler.call(this, this, submissionData, request) === false) {
				break;
			}
		}
		return request;
	}
};

