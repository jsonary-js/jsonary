function getSchema(url, callback) {
	return publicApi.getData(url, function(data, fragmentRequest) {
		var schema = data.asSchema();
		if (callback != undefined) {
			callback.call(schema, schema, fragmentRequest);
		}
	});
}
publicApi.createSchema = function (rawData, baseUrl) {
	var data = publicApi.create(rawData, baseUrl, true);
	return data.asSchema();
};
publicApi.isSchema = function (obj) {
	return obj instanceof Schema;
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
	isFull: function () {
		var refUrl = this.data.propertyValue("$ref");
		return refUrl === undefined;
	},
	getFull: function (callback) {
		var refUrl = this.data.propertyValue("$ref");
		if (refUrl === undefined) {
			if (callback) {
				callback.call(this, this, undefined);
			}
			return this;
		}
		refUrl = this.data.resolveUrl(refUrl);
		if (refUrl.charAt(0) == "#" && (refUrl.length == 1 || refUrl.charAt(1) == "/")) {
			var documentRoot = this.data.document.root;
			var pointerPath = decodeURIComponent(refUrl.substring(1));
			var schema = documentRoot.subPath(pointerPath).asSchema();
			if (callback) {
				callback.call(schema, schema, null);
			} else {
				return schema;
			}
		} else if (callback) {
			getSchema(refUrl, callback);
		}
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
					return [dependency.asSchema()];
				}
			}
		}
		return [];
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
		return result;
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
	equals: function (otherSchema, resolveRef) {
		var thisSchema = this;
		if (resolveRef) {
			otherSchema = otherSchema.getFull();
			thisSchema = this.getFull();
		}
		if (thisSchema === otherSchema) {
			return true;
		}
		var thisRefUrl = thisSchema.referenceUrl();
		var otherRefUrl = otherSchema.referenceUrl();
		if (resolveRef && !thisSchema.isFull()) {
			thisRefUrl = thisSchema.data.resolveUrl(this.data.propertyValue("$ref"));
		}
		if (resolveRef && !otherSchema.isFull()) {
			otherRefUrl = otherSchema.data.resolveUrl(otherSchema.data.propertyValue("$ref"));
		}
		if (thisRefUrl !== undefined && otherRefUrl !== undefined) {
			return Utils.urlsEqual(thisRefUrl, otherRefUrl);
		}
		return this.data.equals(otherSchema.data);
	},
	readOnly: function () {
		return !!(this.data.propertyValue("readOnly") || this.data.propertyValue("readonly"));
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
	definedProperties: function(ignoreList) {
		if (ignoreList) {
			this.definedProperties(); // created cached function
			return this.definedProperties(ignoreList);
		}
		var keys = this.data.property("properties").keys();
		this.definedProperties = function (ignoreList) {
			ignoreList = ignoreList || [];
			var result = [];
			for (var i = 0; i < keys.length; i++) {
				if (ignoreList.indexOf(keys[i]) == -1) {
					result.push(keys[i]);
				}
			}
			return result;
		};
		return keys.slice(0);
	},
	knownProperties: function(ignoreList) {
		if (ignoreList) {
			this.knownProperties(); // created cached function
			return this.knownProperties(ignoreList);
		}
		var result = {};
		this.data.property("properties").properties(function (key, subData) {
			result[key] = true;
		});
		var required = this.requiredProperties();
		for (var i = 0; i < required.length; i++) {
			result[required[i]] = true;
		}
		var keys = Object.keys(result);
		this.knownProperties = function (ignoreList) {
			ignoreList = ignoreList || [];
			var result = [];
			for (var i = 0; i < keys.length; i++) {
				if (ignoreList.indexOf(keys[i]) == -1) {
					result.push(keys[i]);
				}
			}
			return result;
		};
		return keys.slice(0);
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
	}
};
Schema.prototype.basicTypes = Schema.prototype.types;
Schema.prototype.extendSchemas = Schema.prototype.andSchemas;
Schema.prototype.isComplete = Schema.prototype.isFull;

publicApi.extendSchema = function (obj) {
	for (var key in obj) {
		if (Schema.prototype[key] == undefined) {
			Schema.prototype[key] = obj[key];
		}
	}
};

var extraEscaping = {
	"!": "%21",
	"'": "%27",
	"(": "%28",
	")": "%29",
	"*": "%2A"
};
function preProcessUriTemplate(template) {
	if (template == "{@}") {
		return "{+%73elf}";
	}
	var newTemplate = [];
	var curlyBrackets = false;
	var roundBrackets = false;
	for (var i = 0; i < template.length; i++) {
		var tChar = template.charAt(i);
		if (!curlyBrackets) {
			if (tChar == "{") {
				curlyBrackets = true;
			}
			newTemplate.push(tChar);
		} else if (!roundBrackets) {
			if (tChar == "$") {
				newTemplate.push("%73elf");
				continue;
			} else if (tChar == "(") {
				if (template.charAt(i + 1) == ")") {
					newTemplate.push("%65mpty");
					i++;
				} else {
					roundBrackets = true;
				}
				continue;
			} else if (tChar == "}") {
				curlyBrackets = false;
			}
			newTemplate.push(tChar);
		} else {
			if (tChar == ")") {
				if (template.charAt(i + 1) == ")") {
					newTemplate.push(extraEscaping[")"]);
					i++;
				} else {
					roundBrackets = false;
				}
				continue;
			}
			if (extraEscaping[tChar] != undefined) {
				newTemplate.push(extraEscaping[tChar])
			} else {
				newTemplate.push(encodeURIComponent(tChar));
			}
		}
	}
	return newTemplate.join("");
}

function PotentialLink(linkData) {
	this.data = linkData;
	
	this.uriTemplate = new UriTemplate(preProcessUriTemplate(linkData.propertyValue("href")));
	this.dataParts = [];
	for (var i = 0; i < this.uriTemplate.varNames.length; i++) {
		this.dataParts.push(translateUriTemplateName(this.uriTemplate.varNames[i]));
	}
	
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
function translateUriTemplateName(varName) {
	if (varName == "%65mpty") {
		return "";
	} else if (varName == "%73elf") {
		return null;
	}
	return decodeURIComponent(varName);
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
	canApplyTo: function (candidateData) {
		var i, key, subData = null, basicType;
		for (i = 0; i < this.dataParts.length; i++) {
			key = this.dataParts[i];
			if (key === null) {
				subData = candidateData;
			} else if (candidateData.basicType() == "object") {
				subData = candidateData.property(key);
			} else if (candidateData.basicType() == "array" && isIndex(key)) {
				subData = candidateData.index(key);
			}
			if (subData == undefined || !subData.defined()) {
				return false;
			}
			if (subData.basicType() == "null") {
				return false;
			}
		}
		return true;
	},
	linkForData: function (publicData) {
		var rawLink = this.data.value();
		var href = this.uriTemplate.fill(function (varName) {
			varName = translateUriTemplateName(varName);
			if (varName == null) {
				return publicData.value();
			}
			if (publicData.basicType() == "array") {
				return publicData.itemValue(varName);
			} else {
				return publicData.propertyValue(varName);
			}
		});
		rawLink.href = publicData.resolveUrl(href);
		rawLink.rel = rawLink.rel.toLowerCase();
		rawLink.title = rawLink.title;
		return new ActiveLink(rawLink, this, publicData);
	},
	usesKey: function (key) {
		var i;
		for (i = 0; i < this.dataParts.length; i++) {
			if (this.dataParts[i] === key || this.dataParts[i] === null) {
				return true;
			}
		}
		return false;
	},
	rel: function () {
		return this.data.propertyValue("rel").toLowerCase();
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
	this.title = rawLink.title;
	if (rawLink.method != undefined) {
		this.method = rawLink.method;
	} else if (rawLink.rel == "edit") {
		this.method = "PUT"
	} else if (rawLink.rel == "create") {
		this.method = "POST"
	} else if (rawLink.rel == "delete") {
		this.method = "DELETE"
	} else {
		this.method = "GET";
	}
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

