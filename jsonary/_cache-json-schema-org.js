// Modified versions of the meta-schemas

var baseSchema = {
	"id": "http://json-schema.org/draft-04/schema#",
	"$schema": "http://json-schema.org/draft-04/schema#",
	"title": "JSON Schema",
	"description": "Core schema meta-schema",
	"definitions": {
		"schemaArray": {
			"type": "array",
			"minItems": 1,
			"items": { "$ref": "#" }
		},
		"positiveInteger": {
			"type": "integer",
			"minimum": 0
		},
		"positiveIntegerDefault0": {
			"allOf": [ { "$ref": "#/definitions/positiveInteger" }, { "default": 0 } ]
		},
		"simpleTypes": {
			"title": "Simple type",
			"enum": [ "array", "boolean", "integer", "null", "number", "object", "string" ]
		},
		"stringArray": {
			"type": "array",
			"items": { "type": "string" },
			"minItems": 1,
			"uniqueItems": true
		}
	},
	"type": "object",
	"properties": {
		"id": {
			"type": "string",
			"format": "uri"
		},
		"$schema": {
			"type": "string",
			"format": "uri"
		},
		"title": {
			"type": "string"
		},
		"description": {
			"type": "string"
		},
		"default": {},
		"multipleOf": {
			"type": "number",
			"minimum": 0,
			"exclusiveMinimum": true
		},
		"maximum": {
			"type": "number"
		},
		"exclusiveMaximum": {
			"type": "boolean",
			"default": false
		},
		"minimum": {
			"type": "number"
		},
		"exclusiveMinimum": {
			"type": "boolean",
			"default": false
		},
		"maxLength": { "$ref": "#/definitions/positiveInteger" },
		"minLength": { "$ref": "#/definitions/positiveIntegerDefault0" },
		"pattern": {
			"type": "string",
			"format": "regex"
		},
		"additionalItems": {
			"oneOf": [
				{ "type": "boolean" },
				{ "$ref": "#" }
			],
			"default": {}
		},
		"items": {
			"oneOf": [
				{ "$ref": "#" },
				{ "$ref": "#/definitions/schemaArray" }
			],
			"default": {}
		},
		"maxItems": { "$ref": "#/definitions/positiveInteger" },
		"minItems": { "$ref": "#/definitions/positiveIntegerDefault0" },
		"uniqueItems": {
			"type": "boolean",
			"default": false
		},
		"maxProperties": { "$ref": "#/definitions/positiveInteger" },
		"minProperties": { "$ref": "#/definitions/positiveIntegerDefault0" },
		"required": { "$ref": "#/definitions/stringArray" },
		"additionalProperties": {
			"oneOf": [
				{ "type": "boolean"},
				{ "$ref": "#" }
			],
			"default": {}
		},
		"definitions": {
			"type": "object",
			"additionalProperties": { "$ref": "#" },
			"default": {}
		},
		"properties": {
			"type": "object",
			"additionalProperties": { "$ref": "#" },
			"default": {}
		},
		"patternProperties": {
			"type": "object",
			"additionalProperties": { "$ref": "#" },
			"default": {}
		},
		"dependencies": {
			"type": "object",
			"additionalProperties": {
				"oneOf": [
					{ "$ref": "#" },
					{ "$ref": "#/definitions/stringArray" }
				]
			}
		},
		"enum": {
			"type": "array",
			"minItems": 1,
			"uniqueItems": true
		},
		"type": {
			"oneOf": [
				{ "$ref": "#/definitions/simpleTypes" },
				{
					"type": "array",
					"items": { "$ref": "#/definitions/simpleTypes" },
					"minItems": 1,
					"uniqueItems": true
				}
			]
		},
		"allOf": { "$ref": "#/definitions/schemaArray" },
		"anyOf": { "$ref": "#/definitions/schemaArray" },
		"oneOf": { "$ref": "#/definitions/schemaArray" },
		"not": { "$ref": "#" }
	},
	"dependencies": {
		"exclusiveMaximum": [ "maximum" ],
		"exclusiveMinimum": [ "minimum" ]
	},
	"default": {}
};

var hyperSchema = {
	"$schema": "http://json-schema.org/draft-04/hyper-schema#",
	"id": "http://json-schema.org/draft-04/hyper-schema#",
	"title": "JSON Hyper-Schema",
	"allOf": [
		{
			"$ref": "http://json-schema.org/draft-04/schema#"
		}
	],
	"properties": {
		"additionalItems": {
			"oneOf": [
				{
					"type": "boolean"
				},
				{
					"$ref": "#"
				}
			]
		},
		"additionalProperties": {
			"oneOf": [
				{
					"type": "boolean"
				},
				{
					"$ref": "#"
				}
			]
		},
		"dependencies": {
			"additionalProperties": {
				"oneOf": [
					{
						"$ref": "#"
					},
					{
						"type": "array"
					}
				]
			}
		},
		"items": {
			"oneOf": [
				{
					"$ref": "#"
				},
				{
					"$ref": "#/definitions/schemaArray"
				}
			]
		},
		"definitions": {
			"additionalProperties": {
				"$ref": "#"
			}
		},
		"patternProperties": {
			"additionalProperties": {
				"$ref": "#"
			}
		},
		"properties": {
			"additionalProperties": {
				"$ref": "#"
			}
		},
		"allOf": {
			"$ref": "#/definitions/schemaArray"
		},
		"oneOf": {
			"$ref": "#/definitions/schemaArray"
		},
		"oneOf": {
			"$ref": "#/definitions/schemaArray"
		},
		"not": {
			"$ref": "#"
		},

		"links": {
			"type": "array",
			"items": {
				"$ref": "#/definitions/linkDescription"
			}
		},
		"fragmentResolution": {
			"type": "string"
		},
		"media": {
			"type": "object",
			"properties": {
				"type": {
					"description": "A media type, as described in RFC 2046",
					"type": "string"
				},
				"binaryEncoding": {
					"description": "A content encoding scheme, as described in RFC 2045",
					"type": "string"
				}
			}
		},
		"pathStart": {
			"description": "Instances' URIs must start with this value for this schema to apply to them",
			"type": "string",
			"format": "uri"
		}
	},
	"definitions": {
		"schemaArray": {
			"title": "Array of schemas",
			"type": "array",
			"items": {
				"$ref": "#"
			}
		},
		"linkDescription": {
			"title": "Link Description Object",
			"type": "object",
			"required": [ "href", "rel" ],
			"properties": {
				"href": {
					"description": "a URI template, as defined by RFC 6570, with the addition of the $, ( and ) characters for pre-processing",
					"type": "string"
				},
				"rel": {
					"description": "relation to the target resource of the link",
					"type": "string"
				},
				"title": {
					"description": "a title for the link",
					"type": "string"
				},
				"targetSchema": {
					"description": "JSON Schema describing the link target",
					"$ref": "#"
				},
				"mediaType": {
					"description": "media type (as defined by RFC 2046) describing the link target",
					"type": "string"
				},
				"method": {
					"description": "method for requesting the target of the link (e.g. for HTTP this might be \"GET\" or \"DELETE\")",
					"type": "string"
				},
				"encType": {
					"description": "The media type in which to submit data along with the request",
					"type": "string",
					"default": "application/json"
				},
				"schema": {
					"description": "Schema describing the data to submit along with the request",
					"$ref": "#"
				}
			}
		}
	},
	"links": [
		{
			"rel": "self",
			"href": "{+id}"
		},
		{
			"rel": "full",
			"href": "{+($ref)}"
		}
	]
};

Jsonary.addToCache('http://json-schema.org/schema', {allOf: [{"$ref": "draft-04/schema"}]});
Jsonary.addToCache('http://json-schema.org/draft-04/schema', baseSchema);

Jsonary.addToCache('http://json-schema.org/hyper-schema', {allOf: [{"$ref": "draft-04/hyper-schema"}]});
Jsonary.addToCache('http://json-schema.org/draft-04/hyper-schema', hyperSchema);