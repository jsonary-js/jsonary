(function (global) {
	var elementLookup = {};
	var uniqueIdLookup = {};

	var ELEMENT_ID_PREFIX = "Jsonary.element";
	var elementIdCounter = 0;

	var renderDepth = 0;
	function render(element, data, namespace) {
		if (typeof data == "string") {
			Jsonary.getData(data, function (actualData) {
				render(element, actualData, namespace);
			});
			return;
		}

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
		var renderer = selectRenderer(data, namespace);
		if (renderer != undefined) {
			if (prevRenderer == undefined || prevRenderer.renderer != renderer) {
				elementLookup[uniqueId][element.id] = {
					renderer: renderer,
					namespace: namespace
				};
				renderer.render(element, data);
			}
		} else {
			element.innerHTML = "NO RENDERER FOUND";
		}
	}
	render.empty = function (element) {
		try {
			global.jQuery(element).empty();
		} catch (e) {
		}
		element.innerHTML = "";
	};
	
	function renderHtml(data, namespace) {
		var renderer = selectRenderer(data, namespace);
		return renderer.renderHtml(data, namespace);
	}

	function update(data, operation) {
		var uniqueId = data.uniqueId;
		var elementIds = elementLookup[uniqueId];
		for (var elementId in elementIds) {
			var element = document.getElementById(elementId);
			if (element == undefined) {
				delete elementIds[elementId];
				continue;
			}
			var prevRenderer = elementIds[elementId].renderer;
			var prevNamespace = elementIds[elementId].namespace;
			var renderer = selectRenderer(data, prevNamespace);
			if (renderer == prevRenderer) {
				renderer.update(element, data, operation);
			} else {
				render(element, data, prevNamespace);
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
			render(element, data, elementIds[elementId].namespace);
		}
	});

	var enhancementList = [];
	function addEnhancement(renderer, data, namespace) {
		var elementId = ELEMENT_ID_PREFIX + (elementIdCounter++);
		if (uniqueIdLookup[elementId] != undefined) {
			var previousId = uniqueIdLookup[elementId];
			delete elementLookup[previousId][elementId];
		}
		var uniqueId = data.uniqueId;
		uniqueIdLookup[elementId] = uniqueId;
		if (elementLookup[uniqueId] == undefined) {
			elementLookup[uniqueId] = {};
		}
		var prevRenderer = elementLookup[uniqueId][elementId];
		if (prevRenderer == undefined || prevRenderer.renderer != renderer) {
			elementLookup[uniqueId][elementId] = {
				renderer: renderer,
				namespace: namespace
			};
		}

		enhancementList.push(function () {
			var target = document.getElementById(elementId);
			renderDepth++;
			renderer.enhance(target, data, namespace);
			renderDepth--;
		});
		return elementId;
	}
	function executeEnhancements() {
		while (renderDepth == 0 && enhancementList.length > 0) {
			var enhancement = enhancementList.shift();
			enhancement();
		}
	}
	
	function Renderer(sourceObj) {
		this.renderFunction = sourceObj.render;
		this.renderHtmlFunction = sourceObj.renderHtml;
		this.updateFunction = sourceObj.update;
		this.filterFunction = sourceObj.filter;
		this.actionFunction = sourceObj.action;
		for (var key in sourceObj) {
			if (this[key] == undefined) {
				this[key] = sourceObj[key];
			}
		}
	}
	Renderer.prototype = {
		render: function (element, data) {
			if (element[0] != undefined) {
				element = element[0];
			}
			renderDepth++;
			var namespace = elementLookup[data.uniqueId][element.id].namespace;
			render.empty(element);
			if (this.renderHtmlFunction != undefined) {
				element.innerHTML = this.renderHtmlFunction(data, namespace);
			}
			this.renderFunction(element, data, namespace);
			renderDepth--;
			executeEnhancements();
			return this;
		},
		renderHtml: function (data, namespace) {
			var innerHtml = "";
			if (this.renderHtmlFunction != undefined) {
				innerHtml = this.renderHtmlFunction(data);
			}
			var elementId = addEnhancement(this, data, namespace);
			return '<span id="' + elementId + '">' + innerHtml + '</span>';
		},
		enhance: function (element, data, namespace) {
			this.renderFunction(element, data, namespace);
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
		action: function (actionName, data) {
			this.actionFunction(actionName, data);
		},
		actionHtml: function (actionName, data, innerHtml) {
			var thisRenderer = this;
			var elementId = ELEMENT_ID_PREFIX + (elementIdCounter++);
			enhancementList.push(function () {
				var target = document.getElementById(elementId);
				target.onclick = function () {
					thisRenderer.action(actionName, data);
					return false;
				};
				target = null;
			});
			return '<span id="' + elementId + '">' + innerHtml + '</span>';
		},
		canRender: function (data, schemas) {
			if (this.filterFunction != undefined) {
				return this.filterFunction(data, schemas);
			}
			return true;
		},
		defaultUpdate: function (element, data, operation) {
			var redraw = false;
			var checkChildren = operation.action() != "replace";
			var pointerPath = data.pointerPath();
			if (operation.subjectEquals(pointerPath) || (checkChildren && operation.subjectChild(pointerPath) !== false)) {
				redraw = true;
			} else if (operation.target() != undefined) {
				if (operation.targetEquals(pointerPath) || (checkChildren && operation.targetChild(pointerPath) !== false)) {
					redraw = true;
				}
			}
			if (redraw) {
				this.render(element, data);
			}
		}
	}

	var rendererList = {};
	function register(obj) {
		var namespace = obj.namespace;
		if (namespace == undefined) {
			namespace = "";
		}
		var namespaceArray = namespace;
		if (typeof namespace == "string") {
			namespaceArray = [];
			parts = namespace.split("/");
			for (var i = 0; i < parts.length; i++) {
				namespaceArray.push(parts.slice(0, i).join("/"));
			}
		}
		for (var i = 0; i < namespaceArray.length; i++) {
			var namespace = namespaceArray[i];
			if (rendererList[namespace] == undefined) {
				rendererList[namespace] = [];
			}
			rendererList[namespace].unshift(new Renderer(obj));
		}
	}
	render.register = register;

	function selectRenderer(data, namespace) {
		if (namespace == undefined) {
			namespace = "";
		}
		var namespaceArray = namespace;
		if (typeof namespace == "string") {
			namespaceArray = [];
			parts = namespace.split("/");
			for (var i = parts.length; i >= 0; i--) {
				namespaceArray.push(parts.slice(0, i).join("/"));
			}
		}
		var schemas = data.schemas();
		for (var j = 0; j < namespaceArray.length; j++) {
			renderers = rendererList[namespaceArray[j]];
			if (renderers == undefined) {
				continue;
			}
			for (var i = 0; i < renderers.length; i++) {
				if (renderers[i].canRender(data, schemas)) {
					return renderers[i];
				}
			}
		}
	}

	if (typeof global.jQuery != "undefined") {
		var jQueryRender = function (data, namespace) {
			var element = this[0];
			if (element != undefined) {
				render(element, data, namespace);
			}
			return this;
		};
		Jsonary.extendData({
			$renderTo: function (query, namespace) {
				if (typeof query == "string") {
					query = jQuery(query);
				}
				var element = query[0];
				if (element != undefined) {
					render(element, this, namespace);
				}
			}
		});
		jQueryRender.register = function (jQueryObj) {
			if (jQueryObj.render != undefined) {
				var oldRender = jQueryObj.render;
				jQueryObj.render = function (element, data) {
					var query = $(element);
					oldRender.call(this, query, data);
				}
			}
			if (jQueryObj.update != undefined) {
				var oldUpdate = jQueryObj.update;
				jQueryObj.update = function (element, data, operation) {
					var query = $(element);
					oldUpdate.call(this, query, data, operation);
				}
			}
			render.register(jQueryObj);
		};
		jQueryRender.empty = function (query) {
			query.each(function (index, element) {
				render.empty(element);
			});
		};
		jQuery.fn.extend({renderJson: jQueryRender});
		jQuery.extend({renderJson: jQueryRender});
	}

	Jsonary.extend({
		render: render,
		renderHtml: renderHtml
	});
	Jsonary.extendData({
		renderTo: function (element, namespace) {
			render(element, this, namespace);
		}
	});
})(this);
