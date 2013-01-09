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

## Using hyper-schemas

Hyper-schemas can define links on the data, with the URLs parametrised from the data itself:
```javascript
var data = Jsonary.create({
    "id": 125,
    "authorId": 25,
    "title": "Example data"
});
var schema = Jsonary.createSchema({
    "title": "Example hyper-schema",
    "links": [
        {
            "rel": "self":,
            "href": "http://example.com/items/{id}"
        }
        {
            "rel": "author",
            "href": "http://example.com/users/{authorId}"
        }
    ]
});
data.addSchema(schema);
```

Jsonary handles these, and the links can be inspected:
```javascript
alert(data.links().length); // 2

var authorLink = data.links('author')[0];
alert(authorLink.href); // http://example.com/users/25
```

Many more properties of links can be inspected

## Rendering clients

Jsonary comes bundled with a rendering system that bases its interface on the schemas that a data object has applied to it.
```javascript
data.renderTo(document.getElementById('render-container'));
```

## Main site

More information can be found at: [jsonary.com](http://jsonary.com/).

There is a [quick feature tour](http://jsonary.com/feature-tour/), walkthroughs for [creating a generic browser](http://jsonary.com/walkthrough-basic/) or [creating a Facebook client](http://jsonary.com/walkthrough-facebook/) (incomplete).

There is also a demo of how the default editable interface deals with various JSON Schema validation keywords [here](http://jsonary.com/documentation/json-schema/).
