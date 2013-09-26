# Jsonary on Node.js

**WARNING: rendering functionality is rather limited at the moment**

This package makes the [Jsonary](https://github.com/geraintluff/jsonary) library available on Node.js.

###  What is Jsonary?

Jsonary is a library for dealing with data and APIs that are described by JSON (Hyper-)Schema.  It can find and fetch schemas referenced from HTTP headers, allowing you to use the API in a flexible way.

It also contains a rendering system, using schema constraints and hyper-schema links to assemble adaptive clients for your APIs.  This is currently only in the browser, but the final steps for getting it working on Node are being worked on.

The goal is that you should be able to write a Jsonary renderer *once*, and it should generate static HTML on Node, and provide part of a snazzy AJAX client on the browser.

### So what can I do with it on Node right now?

Right now, the rendering system doesn't quite work, but you can still other (slightly less cool) schema-aware features of Jsonary.

For example, here is a short script that scrapes a (JSON Hyper-Schema described) API, starring every document written by someone whose name begins with 'J':

```javascript
var Jsonary = require('jsonary').instance();

var results = [];
Jsonary.getData('http://example.com/documents/', function (documents) {
	documents.items(function (index, docData) {
		var authorLink = docData.getLink('author');
		var starLink = docData.getLink('star');
		if (authorLink && starLink) {
			authorLink.follow(null, false).getData(function (authorData) {
				var authorName = authorData.get('/name');
				if (/^J/.test(authorName)) {
					starLink.follow(null, false);
				}
			});
		}
	});
});
```

That script knows nothing about any URL apart from the entry-point - the link information is taken from the hyper-schema referenced by the data.

Jsonary also implements a basic cookie store, so your scripts can log in to an API before using it:

```javascript
var Jsonary = require('jsonary').instance();

Jsonary.getData('http://example.com/json/', function (basePage) {
	var loginLink = basePage.getLink('login');
	loginLink.follow({username: "hello", password: "world"}, false).getData(function (loginResult) {
		assert(loginResult.get('/success') == true);
		performLoggedInActions();
	});
});
```

`loginLink` will be followed at whatever URL, and with whatever method and Content-Type is appropriate.  For maximum flexibility, the login data should probably have used `link.createSubmissionData()`, in case there are other required parameters:

```javascript
var loginLink = basePage.getLink('login');
loginLink.createSubmissionData(function (loginData) {
	loginData.set('/username', "hello");
	loginData.set('/password', "world");
	loginLink.follow(loginData, false).getData(...);
});
```