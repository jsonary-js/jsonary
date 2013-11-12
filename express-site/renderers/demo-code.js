(function (Jsonary) {
	function prepareForPrism(codeText) {
		// Prism requires opening tags and ampersands to be replaced, but nothing else
		return codeText.replace(/&/g, "&amp;").replace(/</g, "&lt;");
	}

	function consoleDisplay(value, shortForm) {
		var node = document.createElement('span');
		var expandFunction = null;
		var defaultExpandFunction = function () {
			var result = document.createElement('span');
			result.innerHTML = ': ';
			result.appendChild(consoleDisplay(value, false));
			return result;
		};
		if (value instanceof Error) {
			node.innerHTML = value.toString();
			expandFunction = function () {
				var stack = document.createElement('span');
				stack.innerHTML = ("\n" + (value.stack || "(stack trace not available)")).replace(/\n/g, '\n\t').replace(/[ \r\n\t]$/, '');
				return stack;
			}
			if (shortForm === false) {
				node.appendChild(expandFunction());
				expandFunction = null;
			}
		} else if (typeof value === 'undefined') {
			node.className = "demo-code-console-type-undefined";
			node.innerHTML = 'undefined';
		} else if (value === null) {
			node.className = "demo-code-console-type-null";
			node.innerHTML = 'null';
		} else if (typeof value === 'boolean') {
			node.className = 'demo-code-console-type-boolean';
			node.innerHTML = value ? 'true' : 'false';
		} else if (typeof value === 'number') {
			node.className = 'demo-code-console-type-number';
			node.innerHTML = JSON.stringify(value);
		} else if (typeof value === 'string') {
			if (/^data:image\/[^;\/]+(;charset=[^;]*)?;base64/.test(value)) {
				node.className = 'demo-code-console-type-image';
				node.innerHTML = '<img src="' + Jsonary.escapeHtml(value) + '">';
			} else {
				node.className = 'demo-code-console-type-string';
				node.innerHTML = Jsonary.escapeHtml(JSON.stringify(value));
			}
		} else if (Array.isArray(value)) {
			if (shortForm || (shortForm !== false && value.length > 3)) {
				node.className = 'demo-code-console-expand';
				node.innerHTML = 'Array';
				node.innerHTML += '&lt;' + value.length + '&gt;';
				node.style.cursor = 'pointer';
				expandFunction = defaultExpandFunction;
			} else {
				node.className = 'demo-code-console-type-array';
				node.appendChild(document.createTextNode('['));
				for (var i = 0; i < value.length; i++) {
					node.appendChild(consoleDisplay(value[i], true));
					node.appendChild(document.createTextNode(', '));
				}
				node.appendChild(document.createTextNode(']'));
			}
		} else if (typeof value === 'object') {
			var keys = [];
			for (var key in value) {
				keys.push(key);
			}
			if (shortForm || (shortForm !== false && keys.length > 3)) {
				node.className = 'demo-code-console-expand';
				node.innerHTML = value + "";
				node.innerHTML += '&lt;' + keys.length + '&gt;';
				expandFunction = defaultExpandFunction;
			} else {
				var useTable = keys.length > 2;
				var containerTag = useTable ? 'table' : 'span';
				var pairTag = useTable ? 'tr' : 'span';
				var keyValueTag = useTable ? 'td' : 'span';
				node.className = 'demo-code-console-type-object';
				node.appendChild(document.createTextNode('{'));
				var container = document.createElement(containerTag);
				for (var i = 0; i < keys.length; i++) {
					var pair = document.createElement(pairTag);
					
					var keyNode = document.createElement(keyValueTag);
					keyNode.className = 'demo-code-console-object-key';
					var jsonText = JSON.stringify(keys[i]);
					keyNode.innerHTML = '<span class="demo-code-console-punctuation-gentle">"</span>'
						+ jsonText.substring(1, jsonText.length - 1)
						+ '<span class="demo-code-console-punctuation-gentle">"</span>'
						+ ': ';
					
					var valueNode = document.createElement(keyValueTag);
					valueNode.className = 'demo-code-console-object-value';
					valueNode.appendChild(consoleDisplay(value[keys[i]], true));
					if (i < keys.length - 1) {
						valueNode.appendChild(document.createTextNode(', '));
					}
					
					pair.appendChild(keyNode);
					pair.appendChild(valueNode);
					container.appendChild(pair);
				}
				node.appendChild(container);
				node.appendChild(document.createTextNode('}'));
			}
		} else if (typeof value === 'function') {
			if (shortForm) {
				node.className = 'demo-code-console-type-function';
				node.innerHTML = '&lt;Function&gt;';
				expandFunction = defaultExpandFunction;
			} else {
				node.className = 'demo-code-console-type-function-full';
				var codeText = value + "";
				if (typeof Prism !== 'undefined') {
					codeText = prepareForPrism(codeText);
					node.innerHTML = '<code style="white-space: pre-wrap">' + Prism.highlight(codeText, Prism.languages.javascript) + '</code>';
				} else {
					node.innerHTML = Jsonary.escapeHtml(codeText);
				}
			}
		} else {
			node.innerHTML = value + "";
		}
		if (expandFunction ){
			var shortNode = node;
			var expandedNode = null;
			node = document.createElement('span');
			node.setAttribute('unselectable', 'on'); // IE <9, and Opera

			shortNode.style.cursor = 'pointer';
			shortNode.onmousedown = function (evt) {
				evt = evt || window.event;
				if (expandedNode) {
					node.removeChild(expandedNode);
					expandedNode = null;
					return;
				}
				expandedNode = expandFunction();
				node.appendChild(expandedNode);
				!evt.preventDefault || evt.preventDefault();
				return false;
			};
			
			node.appendChild(shortNode);
		}
		return node;
	}
	
	function WrappedConsole(consoleNode) {
		this.clear = function () {
			consoleNode.innerHTML = "";
		};
		this.log = function (value) {
			var logLine = document.createElement('div');
			logLine.className = "demo-code-console-line";
			logLine.innerHTML = '<span class="demo-code-console-line-mark">&gt;</span>';
			logLine.appendChild(consoleDisplay(value));
			consoleNode.appendChild(logLine);
		};
		this.error = function (value) {
			var logLine = document.createElement('div');
			logLine.className = "demo-code-console-error";
			logLine.innerHTML = '<span class="demo-code-console-line-mark">&gt;</span>';
			logLine.appendChild(consoleDisplay(value));
			consoleNode.appendChild(logLine);
		};
	}
	WrappedConsole.prototype = console;

	Jsonary.render.register({
		renderHtml: function (data, context) {
			var result = '<div class="demo-code">';
			result += '<div class="demo-code-input">';
			if (!data.readOnly() || data.get('/html')) {
				result += '<div class="demo-code-input-pair">';
				result += '<div class="demo-code-input-title">HTML:</div>';
				result += '<div class="demo-code-html">' + context.renderHtml(data.property('html')) + '</div>';
				result += '</div>';
			}
			
			result += '<div class="demo-code-input-pair">';
			result += '<div class="demo-code-input-title">JavaScript:</div>';
			result += '<div class="demo-code-javascript">' + context.renderHtml(data.property('js')) + '</div>';
			result += '</div>';
			result += '</div>';
			return result + '</div>';
		},
		runCode: function (data, context) {
			setTimeout(function () {
				context.get('htmlTarget').innerHTML = data.get('/html') || "";
				context.get('consoleWrapped').clear();
				var jsCode = data.get('/js');
				try {
					var func = new Function('element', 'console', jsCode);
					var element = context.get('htmlTarget');
					func.call(element, element, context.get('consoleWrapped'));
				} catch (e) {
					context.get('consoleWrapped').error(e);
				}
			}, 10);
		},
		update: function (element, data, context) {
			this.runCode(data, context);
			return false;
		},
		render: function (element, data, context) {
			for (var i = 0; i < element.childNodes.length; i++) {
				if (element.childNodes[i].nodeType === 1) {
					element = element.childNodes[i];
					break;
				}
			}

			// Re-use results element
			if (context.get('htmlTarget')) {
				var result = context.get('htmlTarget');
				if (result.parentNode) {
					result.parentNode.removeChild(result);
				}
			} else {
				var result = document.createElement('div');
				context.set('htmlTarget', result);
			}
			result.className = "demo-code-result";
			
			// Re-use console element
			if (context.get('consoleTarget')) {
				var consoleResult = context.get('consoleTarget');
				if (consoleResult.parentNode) {
					consoleResult.parentNode.removeChild(consoleResult);
				}
			} else {
				var consoleResult = document.createElement('div');
				context.set('consoleTarget', consoleResult);
			}
			consoleResult.className = "demo-code-console";
			
			var consoleWrapped = new WrappedConsole(consoleResult);
			context.set('consoleWrapped', consoleWrapped);

			element.appendChild(result);
			element.appendChild(consoleResult);
			this.runCode(data, context);
		},
		filter: {
			type: 'object',
			schema: '/json/schemas/demo-code'
		}
	});

	Jsonary.render.register({
		renderHtml: function (data, context) {
			if (!data.readOnly()) {
				return '<code>' + context.withComponent('DATA_RENDERER').renderHtml(data) + '</code>';
			}
			var mediaType = null;
			data.schemas().any(function (index, schema) {
				mediaType = mediaType || schema.data.get('/media/type');
			});

			var prismLanguage = null;
			if (mediaType === 'text/html') {
				prismLanguage = 'markup';
			} else if (mediaType === 'application/javascript') {
				prismLanguage = 'javascript';
			}
			if (typeof Prism !== 'undefined' && prismLanguage && Prism.languages[prismLanguage]) {
				jsCode = data.value();
				jsCode = prepareForPrism(jsCode);
				return '<code style="white-space: pre-wrap">' + Prism.highlight(jsCode, Prism.languages[prismLanguage]) + '</code>';
			}
			return '<code style="white-space: pre-wrap">' + Jsonary.escapeHtml(data.value()) + '</code>';
		},
		filter: {
			type: 'string',
			filter: function (data, schemas) {
				return schemas.any(function (index, schema) {
					return schema.data.get('/media/type') && !schema.data.get('/media/binaryEncoding');
				});
			}
		}
	});


	// ACE editors leak memory
	var aceEditorPool = [];
	var aceEditorIdCounter = 0;
	var aceEditorReturnToPool = function (editor, element) {
		if (editor.cleanupInterval) {
			clearInterval(editor.cleanupInterval);
		}
		aceEditorPool.push({editor: editor, element: element});
		//console.log("Returned to pool: #" + editor.uniqueId);
	};
	var aceEditorReset = function (editor, container) {
		editor.getSession().removeAllListeners('change');
		editor.getSession().removeAllListeners('blur');
		//console.log("Reset: #" + editor.uniqueId);
		if (editor._editorElement.parentNode) {
			editor._editorElement.parentNode.removeChild(editor._editorElement);
		}
		if (container) {
			container.appendChild(editor._editorElement);
		}
		return aceEditorSetCleanup(editor);
	}
	var aceEditorSetCleanup = function (editor) {
		var editorElement = editor._editorElement;
		if (editor.cleanupInterval) {
			clearInterval(editor.cleanupInterval);
		}
		editor.cleanupInterval = setInterval(function () {
			var el = editor._editorElement;
			while (el.parentNode) {
				el = el.parentNode;
			}
			if (el != editorElement.ownerDocument) {
				aceEditorReset(editor);
				aceEditorReturnToPool(editor, editorElement);
				//console.log("Recycled (" + aceEditorPool.length + ")");
			} else {
				//console.log("Still good");
			}
		}, 1000);
		return editor;
	};
	var aceEditorObtain = function (container, getElementId) {
		var editor, editorElement;
		if (aceEditorPool.length > 0) {
			var obj = aceEditorPool.shift();
			editor = obj.editor;
			editorElement = obj.element;
			container.appendChild(editorElement);
			console.log("Re-used from pool: #" + editor.uniqueId);
		} else {
			editorElement = document.createElement('div');
			editorElement.className = "ace-editor";
			editorElement.innerHTML = "";
			editorElement.id = getElementId();
			container.appendChild(editorElement);
			editor = ace.edit(editorElement.id, {});
			editor._editorElement = editorElement;
			editor.uniqueId = aceEditorIdCounter++;
			console.log("Created: #" + editor.uniqueId);
		}
		aceEditorSetCleanup(editor);
		return editor;
	};

	Jsonary.render.register({
		renderHtml: function (data, context) {
			// Fall back to other renderer
			return context.withComponent('DATA_RENDERER').renderHtml(data);
		},
		enhance: function (element, data, context) {
			element.innerHTML = "";
			var container = document.createElement('div');
			container.className = "ace-editor-container";
			element.appendChild(container);
			var editor = context.get('editor');
			if (context.get('editor')) {
				aceEditorReset(editor, container);
			} else {
				var editor = aceEditorObtain(container, context.getElementId.bind(context));
				context.set('editor', editor);

				var mediaType = null;
				data.schemas().any(function (index, schema) {
					mediaType = mediaType || schema.data.get('/media/type');
				});
				if (mediaType === 'text/html') {
					editor.setTheme("ace/theme/tomorrow");
					editor.getSession().setMode("ace/mode/html");
				} else if (mediaType === 'application/javascript') {
					editor.setTheme("ace/theme/tomorrow");
					editor.getSession().setMode("ace/mode/javascript");
				}
			}
			
			editor.getSession().setValue(data.value());

			var extraLines = data.readOnly() ? 0.5 : 1.5;
			function updateHeight() {
				var jsCode = editor.getSession().getValue();
				var lines = Math.min(15, Math.max(1, jsCode.split(/\n/g).length + extraLines));
				container.style.height = 1.2*lines + "em";
				editor.resize();
			}
			updateHeight();

			if (data.readOnly()) {
				editor.setReadOnly(true);
			} else {
				editor.setReadOnly(false);
				editor.on('change', updateHeight);
				editor.on('blur', function () {
					var jsCode = editor.getSession().getValue();
					data.setValue(jsCode);
				});
			}
		},
		update: function (element, data, context) {
			var editor = context.get('editor');
			var jsCode = editor.getSession().getValue();
			return data.value() !== jsCode;
		},
		filter: {
			type: 'string',
			readOnly: false,
			filter: function (data, schemas) {
				return schemas.any(function (index, schema) {
					return schema.data.get('/media/type') && !schema.data.get('/media/binaryEncoding');
				});
			}
		}
	});
})(Jsonary);