(function (global) {
	function encodeUiState (uiState) {
		var json = JSON.stringify(uiState);
		if (json == "{}") {
			return null;
		}
		return json;
	}
	function decodeUiState (uiStateString) {
		if (uiStateString == "" || uiStateString == null) {
			return {};
		}
		return JSON.parse(uiStateString);
	}
	function htmlEscapeSingleQuote (str) {
		return str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&#39;");
	}
	
	function HtmlBuilder() {
		this.content = [];
		this._base = this;
	}
	HtmlBuilder.prototype = {
		html: function (html) {
			this.content.push(html);
		},
		build: function () {
			var joined = this.content.join("");
			return joined;
		},
		/*
		forContext: function (context) {
			function Builder(context) {
				this.context = context;
			}
			Builder.prototype = this;
			return new Builder(context);
		}
		*/
	};

	var prefixPrefix = "Jsonary";
	var prefixCounter = 0;

	var componentNames = {
		ADD_REMOVE: "add/remove",
		TYPE_SELECTOR: "type-selector",
		RENDERER: "data renderer",
		add: function (newName, beforeName) {
			if (this[newName] != undefined) {
				return;
			}
			this[newName] = newName;
			if (componentList.indexOf(beforeName) != -1) {
				componentList.splice(componentList.indexOf(beforeName), 0, this[newName]);
			} else {
				componentList.unshift(this[newName]);
			}
		}
	};	
	var componentList = [componentNames.ADD_REMOVE, componentNames.TYPE_SELECTOR, componentNames.RENDERER];
	
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
		this.getInputName = this.getElementId;
		this.getInputValue = function (inputName) {
			var inputs = document.getElementsByName(inputName);
			if (inputs.length == 0) {
				return null;
			}
			var input = inputs[0];
			return input.value;
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
				var prevUiState = decodeUiState(element.getAttribute("data-jsonary"));
				var renderer = selectRenderer(data, prevUiState, prevContext.baseContext.usedComponents);
				if (renderer.uniqueId == prevContext.renderer.uniqueId) {
					renderer.render(element, data, prevContext);
				} else {
					prevContext.baseContext.render(element, data, prevUiState);
				}
			}
		});
		this.rootContext = this;
	}
	RenderContext.prototype = {
		usedComponents: [],
		rootContext: null,
		baseContext: null,
		subContext: function (elementId, data, uiStartingState) {
			var usedComponents = [];
			if (this.data == data) {
				usedComponents = this.usedComponents.slice(0);
				if (this.renderer != undefined) {
					usedComponents = usedComponents.concat(this.renderer.component);
				}
			}
			if (typeof elementId == "object") {
				elementId = elementId.id;
			}
			function Context(rootContext, baseContext, elementId, data, uiState, usedComponents) {
				this.rootContext = rootContext;
				this.baseContext = baseContext;
				this.elementId = elementId;
				this.data = data;
				this.uiState = uiState;
				this.usedComponents = usedComponents;
			}
			Context.prototype = this.rootContext;
			return new Context(this.rootContext, this, elementId, data, uiStartingState, usedComponents);
		},
		render: function (element, data, uiStartingState) {
			// If data is a URL, then fetch it and call back
			if (typeof data == "string") {
				data = Jsonary.getData(data);
			}
			if (data.getData != undefined) {
				var thisContext = this;
				data.getData(function (actualData) {
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
			var encodedState = encodeUiState(uiStartingState);
			if (encodedState != null) {
				element.setAttribute("data-jsonary", encodedState);
			} else {
				element.removeAttribute("data-jsonary");
			}
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
			console.log("renderHtml :(");
			var builder = new HtmlBuilder();
			this.buildHtml(builder, data, uiStartingState);
			return builder.build();
		},
		buildHtml: function (htmlBuilder, data, uiStartingState) {
			var elementId = this.getElementId();
			if (typeof data == "string") {
				data = Jsonary.getData(data);
			}
			if (data.getData != undefined) {
				var thisContext = this;
				var rendered = false;
				data.getData(function (actualData) {
					if (!rendered) {
						rendered = true;
						data = actualData;
					} else {
						thisContext.render(document.getElementById(elementId), actualData, uiStartingState);
					}
				});
				if (!rendered) {
					rendered = true;
					htmlBuilder.html('<span id="' + elementId + '">Loading...</span>');
					return;
				}
			}

			if (typeof uiStartingState != "object") {
				uiStartingState = {};
			}
			var subContext = this.subContext(elementId, data, uiStartingState);

			var startingStateString = encodeUiState(uiStartingState);
			var renderer = selectRenderer(data, uiStartingState, subContext.usedComponents);
			subContext.renderer = renderer;
			
			if (startingStateString != null) {
				htmlBuilder.html('<span id="' + elementId + '" data-jsonary=\'' + htmlEscapeSingleQuote(startingStateString) + '\'>');
			} else {
				htmlBuilder.html('<span id="' + elementId + '">');
			}
			renderer.buildHtml(htmlBuilder, data, subContext);
			htmlBuilder.html('</span>');

			var uniqueId = data.uniqueId;
			if (this.elementLookup[uniqueId] == undefined) {
				this.elementLookup[uniqueId] = [];
			}
			if (this.elementLookup[uniqueId].indexOf(elementId) == -1) {
				this.elementLookup[uniqueId].push(elementId);
			}
			this.addEnhancement(elementId, subContext);
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
				var prevUiState = decodeUiState(element.getAttribute("data-jsonary"));
				var renderer = selectRenderer(data, prevUiState, prevContext.baseContext.usedComponents);
				if (renderer.uniqueId == prevContext.renderer.uniqueId) {
					renderer.update(element, data, prevContext, operation);
				} else {
					prevContext.baseContext.render(element, data, prevUiState);
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
			return '<a href="javascript:void(0)" id="' + elementId + '" style="text-decoration: none">' + innerHtml + '</a>';
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
			var rootElement = element;
			while (element) {
				if (element.nodeType == 1) {
					this.enhanceElementSingle(element);
				}
				if (element.firstChild) {
					element = element.firstChild;
					continue;
				}
				while (!element.nextSibling && element != rootElement) {
					element = element.parentNode;
				}
				if (element == rootElement) {
					break;
				}
				element = element.nextSibling;
			}
		},
		enhanceElementSingle: function (element) {
			var elementId = element.id;
			var context = this.enhancementContexts[elementId];
			if (context != undefined) {
				element.jsonaryContext = context;
				delete this.enhancementContexts[elementId];
				var renderer = context.renderer;
				if (renderer != undefined) {
					renderer.enhance(element, context.data, context);
				}
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

	if (global.jQuery != undefined) {
		render.empty = function (element) {
			global.jQuery(element).empty();
		};
	} else {
		render.empty = function (element) {
			element.innerHTML = "";
		};
	}
	render.Components = componentNames;
	
	/**********/

	var rendererIdCounter = 0;
	
	function Renderer(sourceObj) {
		this.renderFunction = sourceObj.render || sourceObj.enhance;
		this.buildHtmlFunction = sourceObj.buildHtml;
		if (sourceObj.renderHtml != undefined) {
			var renderFunction = sourceObj.renderHtml;
			this.buildHtmlFunction = function (builder, data, context) {
				console.log("forwarding to renderHtml :(");
				builder.html(renderFunction.call(this, data, context));
			};
		}
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
		if (typeof this.component == "string") {
			this.component = [this.component];
		}
	}
	function Timer() {
		var times = [(new Date).getTime()];
		var labels = [];
		this.mark = function (label) {
			labels.push(label);
			times.push((new Date).getTime());
		};
		this.log = function () {
			var result = [];
			for (var i = 1; i < times.length; i++) {
				result.push(labels[i - 1] + ": " + (times[i] - times[i - 1]) + "ms");
			}
			result.push("TOTAL: " + (times[times.length - 1] - times[0]) + "ms");
			console.log(result.join("\n"));
		};
	}
	Renderer.prototype = {
		render: function (element, data, context) {
			if (element[0] != undefined) {
				element = element[0];
			}
			var builder = new HtmlBuilder();
			var timer = new Timer();
			render.empty(element);
			timer.mark("empty");
			this.buildHtml(builder, data, context);
			timer.mark("buildHtml");
			var html = builder.build();
			timer.mark("build");
			element.innerHTML = html;
			timer.mark("set innerHTML");
			if (this.renderFunction != null) {
				this.renderFunction(element, data, context);
			}
			context.enhanceElement(element);
			timer.mark("enhance");
			timer.log();
			return this;
		},
		buildHtml: function (builder, data, context) {
			if (this.buildHtmlFunction != undefined) {
				this.buildHtmlFunction(builder, data, context);
			}
		},
		enhance: function (element, data, context) {
			if (this.renderFunction != null) {
				this.renderFunction(element, data, context);
			}
			return this;
		},
		update: function (element, data, context, operation) {
			var redraw;
			if (this.updateFunction != undefined) {
				redraw = this.updateFunction(element, data, context, operation);
			} else {
				redraw = this.defaultUpdate(element, data, context, operation);
			}
			if (redraw) {
				this.render(element, data, context);
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
			return redraw;
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
					if (renderer.component.indexOf(component) == -1) {
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
		renderHtml: renderHtml,
		HtmlBuilder: HtmlBuilder
	});
	Jsonary.extendData({
		renderTo: function (element, uiState) {
			render(element, this, uiState);
		}
	});
})(this);
