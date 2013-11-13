var express = require('express');
var app = express();

var mysqlPool = require('../mysql-connect-to-pool.js');
var classDefs = require('../classes.js');

app.get(/^\//, function (request, response, next) {
	var classes = classDefs.cacheWithPool(mysqlPool);
	var apiName = request.path.substring(1);
	classes.Api.open(apiName, function (err, api) {
		if (err) {
			return next(err);
		}
		if (!api) {
			api = new classes.Api({title: apiName});
		}
		response.links({describedby: '/json/schemas/api'});
		response.links({edit: ''});
		response.json(api);
	});
});

app.put(/^\//, function (request, response, next) {
	var classes = classDefs.cacheWithPool(mysqlPool);
	var apiName = request.path.substring(1);
	classes.Api.open(apiName, function (err, api) {
		if (err) {
			return next(err);
		}
		if (!api) {
			api = new classes.Api({apiName: apiName});
		}
		for (var key in request.body) {
			api[key] = request.body[key];
		}
		api['apiName'] = apiName;
		classes.Api.save(api, function (err, saveResult) {
			if (err) {
				return next(err);
			}
			response.links({describedby: '/json/schemas/api'});
			response.links({edit: ''});
			response.json(api);
		})
	});
});

module.exports = app;