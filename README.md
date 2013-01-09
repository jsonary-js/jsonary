# Jsonary

Jsonary is a wrapper for JSON data, that deals with [JSON Schema](http://json-schema.org/).  Its goal is to help quickly assemble clients for JSON APIs.

It is written in Javascript.  Currently, it is being developed and tested for in-browser use.  However, Node.js support is planned, with the goal of being able to write a single client that can be used either in-browser using AJAX, or as an HTML-only interface for non-JS browsers.

The primary goal of this library is not validation of data, but rather to simplify the fetching, handling and rendering of data.  Its focus is correctly assigning JSON Schema to data, which can then be used to select and inform user-interfaces.

## Using schemas

The core of Jsonary deals with JSON Schema (including hyper-schema).  For example, here we create a Jsonary data wrapper, and apply a schema to it:
```javascript
var data = Jsonary.create({
    "title": "Example data"
});
var schema = Jsonary.createSchema({
    "title": "Example schema",
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "minLength": 1
        }
    },
    "required": ["title"]
});
data.addSchema(schema);
```

The data can be inspected or manipulated, like so:
```javascript
alert(data.property('title').value());
data.property('message').setValue("Hello, world!");
```

The schema constraints can be inspected, like so:
```javascript
alert(data.schemas().length); // 1
alert(data.schemas().requiredProperties()); // ["title"]

var title = data.property("title");
alert(title.schemas().minLength()); // 1
```
