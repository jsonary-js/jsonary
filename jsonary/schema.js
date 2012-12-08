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

var ALL_TYPES = ["null", "boolean", "integer", "number", "string", "array", "object"];
var TYPE_SCHEMAS = {};
function getTypeSchema(basicType) {
	if (TYPE_SCHEMAS[basicType] == undefined) {
		TYPE_SCHEMAS[basicType] = publicApi.createSchema({"type": basicType});
	}
	return TYPE_SCHEMAS[basicType];
}

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
		return this;
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
		var schemas = [];
		var subSchema = this.data.property("properties").property(key);
		if (subSchema.defined()) {
			schemas.push(subSchema.asSchema());
		}
		this.data.property("patternProperties").properties(function (patternKey, subData) {
			var regEx = new RegExp(patternKey);
			if (regEx.test(key)) {
				schemas.push(subData.asSchema());
			}
		});
		if (schemas.length == 0) {
			subSchema = this.data.property("additionalProperties");
			if (subSchema.defined()) {
				schemas.push(subSchema.asSchema());
			}
		}
		return new SchemaList(schemas);
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
	andSchemas: function () {
		var result = [];
		var extData = this.data.property("extends");
		if (extData.defined()) {
			if (extData.basicType() == "array") {
				extData.indices(function (i, e) {
					result.push(e.asSchema());
				});
			} else {
				result.push(extData.asSchema());
			}
		}
		this.data.property("allOf").items(function (index, data) {
			result.push(data.asSchema());
		});
		return new SchemaList(result);
	},
	notSchemas: function () {
		var result = [];
		var disallowData = this.data.property("disallow");
		if (disallowData.defined()) {
			if (disallowData.basicType() == "array") {
				disallowData.indices(function (i, e) {
					if (e.basicType() == "string") {
						result.push(publicApi.createSchema({type: e.value()}));
					} else {
						result.push(e.asSchema());
					}
				});
			} else if (disallowData.basicType() == "string") {
				result.push(publicApi.createSchema({type: disallowData.value()}));
			} else {
				result.push(disallowData.asSchema());
			}
		}
		if (this.data.property("not").defined()) {
			result.push(this.data.property("not").asSchema());
		}
		return new SchemaList(result);
	},
	types: function () {
		var typeData = this.data.property("type");
		if (typeData.defined()) {
			if (typeData.basicType() === "string") {
				if (typeData.value() == "all") {
					return ALL_TYPES.slice(0);
				}
				return [typeData.value()];
			} else {
				var types = [];
				for (var i = 0; i < typeData.length(); i++) {
					if (typeData.item(i).basicType() == "string") {
						if (typeData.item(i).value() == "all") {
							return ALL_TYPES.slice(0);
						}
						types.push(typeData.item(i).value());
					} else {
						return ALL_TYPES.slice(0);
					}
				}
				if (types.indexOf("number") != -1 && types.indexOf("integer") == -1) {
					types.push("integer");
				}
				return types;
			}
		}
		return ALL_TYPES.slice(0);
	},
	xorSchemas: function () {
		var result = [];
		var typeData = this.data.property("type");
		if (typeData.defined()) {
			for (var i = 0; i < typeData.length(); i++) {
				if (typeData.item(i).basicType() != "string") {
					var xorGroup = [];
					typeData.items(function (index, subData) {
						if (subData.basicType() == "string") {
							xorGroup.push(getTypeSchema(subData.value()));
						} else {
							xorGroup.push(subData.asSchema());
						}
					});
					result.push(xorGroup);
					break;
				}
			}
		}
		if (this.data.property("oneOf").defined()) {
			var xorGroup = [];
			this.data.property("oneOf").items(function (index, subData) {
				xorGroup.push(subData.asSchema());
			});
			result.push(xorGroup);
		}
		return result;
	},
	orSchemas: function () {
		var result = [];
		var typeData = this.data.property("type");
		if (this.data.property("anyOf").defined()) {
			var orGroup = [];
			this.data.property("anyOf").items(function (index, subData) {
				orGroup.push(subData.asSchema());
			});
			result.push(orGroup);
		}
		return result;
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
		var result = this.data.propertyValue("minItems");
		if (result == undefined) {
			return 0;
		}
		return result;
	},
	maxItems: function () {
		return this.data.propertyValue("maxItems");
	},
	tupleTypingLength: function () {
		if (this.data.property("items").basicType() != "array") {
			return 0;
		}
		return this.data.property("items").length();
	},
	minLength: function () {
		var result = this.data.propertyValue("minLength");
		if (result == undefined) {
			return 0;
		}
		return result;
	},
	maxLength: function () {
		return this.data.propertyValue("maxLength");
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
	minProperties: function () {
		var result = this.data.propertyValue("minProperties");
		if (result == undefined) {
			return 0;
		}
		return result;
	},
	maxProperties: function () {
		return this.data.propertyValue("maxProperties");
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
	},
	format: function () {
		return this.data.propertyValue("format");
	},
};
Schema.prototype.basicTypes = Schema.prototype.types;
Schema.prototype.extendSchemas = Schema.prototype.andSchemas;

publicApi.extendSchema = function (obj) {
	for (var key in obj) {
		if (Schema.prototype[key] == undefined) {
			Schema.prototype[key] = obj[key];
		}
	}
};

function PotentialLink(linkData) {
	this.data = linkData;
	
	this.uriTemplate = new UriTemplate(linkData.propertyValue("href"));
	this.dataParts = this.uriTemplate.varNames;
	
	var schemaData = linkData.property("schema");
	if (schemaData.defined()) {
		var schema = schemaData.asSchema();
		this.submissionSchemas = new SchemaList([schema]);
	} else {
		this.submissionSchemas = new SchemaList();
	}
	var targetSchemaData = linkData.property("targetSchema");
	if (targetSchemaData.defined()) {
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
		var rawLink = this.data.value();
		rawLink.href = this.uriTemplate.fill(function (varName) {
			varName = decodeURIComponent(varName);
			if (publicData.basicType() == "array") {
				return publicData.itemValue(varName);
			} else {
				return publicData.propertyValue(varName);
			}
		});
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
		if (callback != undefined && submissionSchemas.length == 0 && this.method == "PUT") {
			Jsonary.getData(this.href, function (data) {
				callback(data.editableCopy());
			})
			return this;
		}
		if (callback != undefined) {
			submissionSchemas.createValue(function (value) {
				var data = publicApi.create(value, hrefBase);
				for (var i = 0; i < submissionSchemas.length; i++) {
					data.addSchema(submissionSchemas[i], ACTIVE_LINK_SCHEMA_KEY);
				}
				callback(data);
			});
		} else {
			var value = submissionSchemas.createValue();
			var data = publicApi.create(value, hrefBase);
			for (var i = 0; i < submissionSchemas.length; i++) {
				data.addSchema(submissionSchemas[i], ACTIVE_LINK_SCHEMA_KEY);
			}
			return data;
		}
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

