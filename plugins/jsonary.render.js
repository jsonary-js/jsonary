(function (global) {
	function encodeUiState (uiState) {
		return JSON.stringify(uiState);
	}
	function decodeUiState (uiStateString) {
		return JSON.parse(uiStateString);
	}
	function htmlEscapeSingleQuote (str) {
		return str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&#39;");
	}

	var prefixPrefix = "Jsonary";
	var prefixCounter = 0;
	
	var componentList = ["type-selector", "renderer"];
	
	function RenderContext(elementIdPrefix) {
		var thisContext = this;
		this.elementLookup = {};

		if (elementIdPrefix == undefined) {
			elementIdPrefix = prefixPrefix + "." + (prefixCounter++) + ".";
		}
		var elementIdCounter = 0;
		this.getElementId = function () {
			return elementIdPrefix + (elementIdCounter++);
		};

		var renderDepth = 0;
		this.enhancementContexts = {};
		this.enhancementActions = {};

		Jsonary.registerChangeListener(function (patch, document) {
			patch.each(function (index, operation) {
				var dataObjects = document.affectedData(operation);
				for (var i = 0; i < dataObjects.length; i++) {
					thisContext.update(dataObjects[i], operation);
				}
			});
		});
		Jsonary.registerSchemaChangeListener(function (data, schemas) {
			var uniqueId = data.uniqueId;
			var elementIds = thisContext.elementLookup[uniqueId];
			if (elementIds == undefined || elementIds.length == 0) {
				return;
			}
			var elements = [];
			for (var i = 0; i < elementIds.length; i++) {
				var element = document.getElementById(elementIds[i]);
				if (element == undefined) {
					elementIds.splice(i, 1);
					i--;
					continue;
				}
				elements[i] = element;
			}
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				var prevContext = element.jsonaryContext;
				var prevUiState = decodeUiState(element.getAttribute("jsonary-ui-starting-state"));
				var renderer = selectRenderer(data, prevUiState, prevContext.usedComponents);
				if (renderer.uniqueId == prevContext.renderer.uniqueId) {
					renderer.render(element, data, prevContext);
				} else {
					prevContext.render(element, data, prevUiState);
				}
			}
		});
	}
	RenderContext.prototype = {
		usedComponents: [],
		baseContext: null,
		subContext: function (elementId, data, uiStartingState) {
			var usedComponents = [];
			if (this.data == data) {
				usedComponents = this.usedComponents.slice(0);
				if (this.renderer != undefined) {
					usedComponents.push(this.renderer.component);
				}
			}
			if (typeof elementId == "object") {
				elementId = elementId.id;
			}
			function F(baseContext, elementId, data, uiState, usedComponents) {
				this.baseContext = baseContext;
				this.elementId = elementId;
				this.data = data;
				this.uiState = uiState;
				this.usedComponents = usedComponents;
			}
			var base = (this.baseContext != undefined) ? this.baseContext : this;
			F.prototype = base;
			return new F(base, elementId, data, uiStartingState, usedComponents);
		},
		render: function (element, data, uiStartingState) {
			// If data is a URL, then fetch it and call back
			if (typeof data == "string") {
				var thisContext = this;
				Jsonary.getData(data, function (actualData) {
					thisContext.render(element, actualData, uiStartingState);
				});
				return;
			}

			if (typeof uiStartingState != "object") {
				uiStartingState = {};
			}
			if (element.id == undefined || element.id == "") {
				element.id = this.getElementId();
			}

			var previousContext = element.jsonaryContext;
			var subContext = this.subContext(element, data, uiStartingState);
			element.setAttribute("jsonary-ui-starting-state", encodeUiState(uiStartingState));
			element.jsonaryContext = subContext;

			if (previousContext) {
				// Something was rendered here before - remove this element from the lookup list for that data ID
				var previousId = previousContext.data.uniqueId;
				var index = this.elementLookup[previousId].indexOf(element.id);
				if (index >= 0) {
					this.elementLookup[previousId].splice(index, 1);
				}
			}
			var uniqueId = data.uniqueId;
			if (this.elementLookup[uniqueId] == undefined) {
				this.elementLookup[uniqueId] = [];
			}
			if (this.elementLookup[uniqueId].indexOf(element.id) == -1) {
				this.elementLookup[uniqueId].push(element.id);
			}
			var renderer = selectRenderer(data, uiStartingState, subContext.usedComponents);
			if (renderer != undefined) {
				subContext.renderer = renderer;
				renderer.render(element, data, subContext);
			} else {
				element.innerHTML = "NO RENDERER FOUND";
			}
		},
		renderHtml: function (data, uiStartingState) {
			var elementId = this.getElementId();
			if (typeof uiStartingState != "object") {
				uiStartingState = {};
			}
			var subContext = this.subContext(elementId, data, uiStartingState);

			var startingStateString = encodeUiState(uiStartingState);
			var renderer = selectRenderer(data, uiStartingState, subContext.usedComponents);
			subContext.renderer = renderer;
			
			var innerHtml = renderer.renderHtml(data, subContext);
			var uniqueId = data.uniqueId;
			if (this.elementLookup[uniqueId] == undefined) {
				this.elementLookup[uniqueId] = [];
			}
			if (this.elementLookup[uniqueId].indexOf(elementId) == -1) {
				this.elementLookup[uniqueId].push(elementId);
			}
			this.addEnhancement(elementId, subContext);
			return '<span id="' + elementId + '" jsonary-ui-starting-state=\'' + htmlEscapeSingleQuote(startingStateString) + '\'>' + innerHtml + '</span>';
		},
		update: function (data, operation) {
			var uniqueId = data.uniqueId;
			var elementIds = this.elementLookup[uniqueId];
			if (elementIds == undefined || elementIds.length == 0) {
				return;
			}
			var elements = [];
			for (var i = 0; i < elementIds.length; i++) {
				var element = document.getElementById(elementIds[i]);
				if (element == undefined) {
					elementIds.splice(i, 1);
					i--;
					continue;
				}
				elements[i] = element;
			}
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				var prevContext = element.jsonaryContext;
				var prevUiState = decodeUiState(element.getAttribute("jsonary-ui-starting-state"));
				var renderer = selectRenderer(data, prevUiState, prevContext.usedComponents);
				if (renderer.uniqueId == prevContext.renderer.uniqueId) {
					renderer.update(element, data, prevContext, operation);
				} else {
					this.render(element, data, prevUiState);
				}
			}
		},
		actionHtml: function(innerHtml, actionName) {
			var params = [];
			for (var i = 2; i < arguments.length; i++) {
				params.push(arguments[i]);
			}
			var elementId = this.getElementId();
			this.addEnhancementAction(elementId, actionName, this, params);
			return '<a href="javascript:void(0)" id="' + elementId + '">' + innerHtml + '</a>';
		},
		addEnhancement: function(elementId, context) {
			this.enhancementContexts[elementId] = context;
		},
		addEnhancementAction: function (elementId, actionName, context, params) {
			if (params == null) {
				params = [];
			}
			this.enhancementActions[elementId] = {
				actionName: actionName,
				context: context,
				params: params
			};
		},
		enhanceElement: function (element) {
			var context = this.enhancementContexts[element.id];
			if (context != undefined) {
				element.jsonaryContext = context;
				delete this.enhancementContexts[element.id];
				var renderer = context.renderer;
				var data = context.data;
				if (renderer != undefined) {
					renderer.enhance(element, data, this);
				}
			} else {
				context = this;
			}
			var action = this.enhancementActions[element.id];
			if (action != undefined) {
				delete this.enhancementActions[element.id];
				element.onclick = function () {
					var actionContext = action.context;
					var args = [actionContext, action.actionName].concat(action.params);
					if (actionContext.renderer.action.apply(actionContext.renderer, args)) {
						// Action returned positive - we should force a re-render
						var element = document.getElementById(actionContext.elementId);
						actionContext.renderer.render(element, actionContext.data, actionContext);
					}
					return false;
				};
			}
			for (var i = 0; i < element.childNodes.length; i++) {
				if (element.childNodes[i].nodeType == 1) {
					context.enhanceElement(element.childNodes[i]);
				}
			}
			element = null;
		}
	};
	var pageContext = new RenderContext();

	function render(element, data, uiStartingState) {
		pageContext.render(element, data, uiStartingState);
		return this;
	}
	function renderHtml(data, uiStartingState) {
		return pageContext.renderHtml(data, uiStartingState);
	}

	render.empty = function (element) {
		try {
			global.jQuery(element).empty();
		} catch (e) {
		}
		element.innerHTML = "";
	};
	
	/**********/

	var rendererIdCounter = 0;
	
	function Renderer(sourceObj) {
		this.renderFunction = sourceObj.render || sourceObj.enhance;
		this.renderHtmlFunction = sourceObj.renderHtml;
		this.updateFunction = sourceObj.update;
		this.filterFunction = sourceObj.filter;
		this.actionFunction = sourceObj.action;
		for (var key in sourceObj) {
			if (this[key] == undefined) {
				this[key] = sourceObj[key];
			}
		}
		this.uniqueId = rendererIdCounter++;
		this.component = (sourceObj.component != undefined) ? sourceObj.component : componentList[componentList.length - 1];
	}
	Renderer.prototype = {
		render: function (element, data, context) {
			if (element[0] != undefined) {
				element = element[0];
			}
			render.empty(element);
			element.innerHTML = this.renderHtml(data, context);
			if (this.renderFunction != null) {
				this.renderFunction(element, data, context);
			}
			context.enhanceElement(element);
			return this;
		},
		renderHtml: function (data, context) {
			var innerHtml = "";
			if (this.renderHtmlFunction != undefined) {
				innerHtml = this.renderHtmlFunction(data, context);
			}
			return innerHtml;
		},
		enhance: function (element, data, context) {
			if (this.renderFunction != null) {
				this.renderFunction(element, data, context);
			}
			return this;
		},
		update: function (element, data, context, operation) {
			if (this.updateFunction != undefined) {
				this.updateFunction(element, data, context, operation);
			} else {
				this.defaultUpdate(element, data, context, operation);
			}
			return this;
		},
		action: function (context, actionName, data) {
			return this.actionFunction.apply(this, arguments);
		},
		canRender: function (data, schemas, uiState) {
			if (this.filterFunction != undefined) {
				return this.filterFunction(data, schemas, uiState);
			}
			return true;
		},
		defaultUpdate: function (element, data, context, operation) {
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
				this.render(element, data, context);
			}
		}
	}

	var rendererLookup = {};
	var rendererList = [];
	function register(obj) {
		var renderer = new Renderer(obj);
		rendererLookup[renderer.uniqueId] = renderer;
		rendererList.push(renderer);
	}
	render.register = register;
	
	function lookupRenderer(rendererId) {
		return rendererLookup[rendererId];
	}

	function selectRenderer(data, uiStartingState, usedComponents) {
		var schemas = data.schemas();
		for (var j = 0; j < componentList.length; j++) {
			if (usedComponents.indexOf(componentList[j]) == -1) {
				var component = componentList[j];
				for (var i = rendererList.length - 1; i >= 0; i--) {
					var renderer = rendererList[i];
					if (renderer.component != component) {
						continue;
					}
					if (renderer.canRender(data, schemas, uiStartingState)) {
						return renderer;
					}
				}
			}
		}
	}

	if (typeof global.jQuery != "undefined") {
		var jQueryRender = function (data, uiStartingState) {
			var element = this[0];
			if (element != undefined) {
				render(element, data, uiStartingState);
			}
			return this;
		};
		Jsonary.extendData({
			$renderTo: function (query, uiState) {
				if (typeof query == "string") {
					query = jQuery(query);
				}
				var element = query[0];
				if (element != undefined) {
					render(element, this, uiState);
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
		renderTo: function (element, uiState) {
			render(element, this, uiState);
		}
	});
})(this);
