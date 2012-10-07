var elementLookup = {};
var uniqueIdLookup = {};

var ELEMENT_ID_PREFIX = "Render.Jsonary.element";
var elementIdCounter = 0;

function selectRenderer(data) {
	var schemas = data.schemas();
	for (var i = 0; i < rendererList.length; i++) {
		if (rendererList[i].canRender(data, schemas)) {
			return rendererList[i];
		}
	}
}

function render(element, data) {
	render.empty(element);
	if (element.id == undefined || element.id == "") {
		element.id = ELEMENT_ID_PREFIX + (elementIdCounter++);
	}
	if (uniqueIdLookup[element.id] != undefined) {
		var previousId = uniqueIdLookup[element.id];
		delete elementLookup[previousId][element.id];
	}
	var uniqueId = data.uniqueId;
	uniqueIdLookup[element.id] = uniqueId;
	if (elementLookup[uniqueId] == undefined) {
		elementLookup[uniqueId] = {};
	}
	var prevRenderer = elementLookup[uniqueId][element.id];
	var renderer = selectRenderer(data);
	if (renderer != undefined) {
		if (prevRenderer != renderer) {
			elementLookup[uniqueId][element.id] = renderer;
			renderer.render(element, data);
		}
	} else {
		element.innerHTML = "NO RENDERER FOUND";
	}
}
publicApi.render = render;
render.empty = function (element) {
	if (global.jQuery != null) {
		jQuery(element).empty();
	}
	element.innerHTML = "";
};

function update(data, operation) {
	var uniqueId = data.uniqueId;
	var elementIds = elementLookup[uniqueId];
	for (var elementId in elementIds) {
		var element = document.getElementById(elementId);
		if (element == undefined) {
			delete elementIds[elementId];
			continue;
		}
		var prevRenderer = elementIds[elementId];
		var renderer = selectRenderer(data);
		if (renderer == prevRenderer) {
			renderer.update(element, data, operation);
		} else {
			render(element, data);
		}
	}
}

Jsonary.registerChangeListener(function (patch, document) {
	patch.each(function (index, operation) {
		var dataObjects = document.affectedData(operation);
		for (var i = 0; i < dataObjects.length; i++) {
			update(dataObjects[i], operation);
		}
	});
});
Jsonary.registerSchemaChangeListener(function (data, schemas) {
	var uniqueId = data.uniqueId;
	var elementIds = elementLookup[uniqueId];
	for (var elementId in elementIds) {
		var element = document.getElementById(elementId);
		if (element == undefined) {
			delete elementIds[elementId];
			continue;
		}
		render(element, data);
	}
});

function Renderer(sourceObj) {
	this.renderFunction = sourceObj.render;
	this.updateFunction = sourceObj.update;
	this.filterFunction = sourceObj.filter;
}
Renderer.prototype = {
	render: function (element, data) {
		this.renderFunction(element, data);
		return this;
	},
	update: function (element, data, operation) {
		if (this.updateFunction != undefined) {
			this.updateFunction(element, data, operation);
		} else {
			this.defaultUpdate(element, data, operation);
		}
		return this;
	},
	canRender: function (data, schemas) {
		if (this.filterFunction != undefined) {
			return this.filterFunction(data, schemas);
		}
		return true;
	},
	defaultUpdate: function (element, data, operation) {
		var redraw = false;
		var pointerPath = data.pointerPath();
		if (operation.subjectEquals(pointerPath) || operation.subjectChild(pointerPath) !== false) {
			redraw = true;
		} else if (operation.target() != undefined) {
			if (operation.targetEquals(pointerPath) || operation.targetChild(pointerPath) !== false) {
				redraw = true;
			}
		}
		if (redraw) {
			render.empty(element);
			this.renderFunction(element, data);
		}
	}
}

var rendererList = [];
function register(obj) {
	rendererList.unshift(new Renderer(obj));
}
render.register = register;

if (typeof global.jQuery != "undefined") {
	var jQueryRender = function (data) {
		var element = this[0];
		if (element != undefined) {
			render(element, data);
		}
		return this;
	};
	publicApi.extendData({
		$renderTo: function (query) {
			if (typeof query == "string") {
				query = jQuery(query);
			}
			var element = query[0];
			if (element != undefined) {
				render(element, this);
			}
		}
	});
	jQueryRender.register = function (jQueryObj) {
		var obj = {};
		obj.filter = jQueryObj.filter;
		if (jQueryObj.render != undefined) {
			obj.render = function (element, data) {
				var query = $(element);
				query.empty();
				jQueryObj.render.call(this, query, data);
			}
		}
		if (obj.update != undefined) {
			obj.update = function (element, data, operation) {
				var query = $(element);
				jQueryObj.update.call(this, query, data, operation);
			}
		}
		render.register(obj);
	};
	jQueryRender.empty = function (query) {
		query.each(function (index, element) {
			render.empty(element);
		});
	};
	jQuery.fn.extend({renderJson: jQueryRender});
	jQuery.extend({renderJson: jQueryRender});
}

publicApi.extendData({
	renderTo: function (element) {
		render(element, this);
	}
});
