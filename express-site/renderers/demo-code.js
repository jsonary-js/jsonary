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
			context.htmlTarget.innerHTML = data.get('/html') || "";
			context.consoleTarget.innerHTML = "";
			var jsCode = data.get('/js');
			try {
				var func = new Function('element', 'console', jsCode);
				func.call(context.htmlTarget, context.htmlTarget, context.consoleWrapped);
			} catch (e) {
				context.consoleWrapped.error(e);
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

		var result = document.createElement('div');
		result.className = "demo-code-result";

		var consoleResult = document.createElement('div');
		consoleResult.className = "demo-code-console";

		var consoleWrapped = Object.create(console);
		consoleWrapped.log = function (value) {
			if (typeof value !== 'string') {
				value = JSON.stringify(value);
			}
			var logLine = document.createElement('div');
			logLine.className = "demo-code-console-line";
			logLine.innerHTML = '<span class="demo-code-console-line-mark">&gt;</span>' + Jsonary.escapeHtml(value);
			consoleResult.appendChild(logLine);
		};
		consoleWrapped.error = function (value) {
			if (typeof value !== 'string') {
				if (value.stack) {
					value = value.stack;
				} else {
					value = JSON.stringify(value);
				}
			}
			var logLine = document.createElement('div');
			logLine.className = "demo-code-console-error";
			logLine.innerHTML = '<span class="demo-code-console-line-mark">&gt;</span>' + Jsonary.escapeHtml(value);
			consoleResult.appendChild(logLine);
		};
		context.consoleWrapped = consoleWrapped;	
		context.htmlTarget = result;
		context.consoleTarget = consoleResult;
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
		// Fall back to other renderer
		return context.withComponent('DATA_RENDERER').renderHtml(data);
	},
	enhance: function (element, data, context) {
		element.innerHTML = "";
		var container = document.createElement('div');
		container.className = "ace-editor-container";
		element.appendChild(container);
		var editorElement = document.createElement('div');
		editorElement.className = "ace-editor";
		editorElement.innerHTML = Jsonary.escapeHtml(data.value());
		editorElement.id = context.getElementId();
		container.appendChild(editorElement);

		var editor = ace.edit(editorElement.id);
		context.set('editor', editor);
		var extraLines = data.readOnly() ? 0 : 1;
		function updateHeight() {
			var jsCode = editor.getSession().getValue();
			var lines = Math.min(15, Math.max(1, jsCode.split(/\n/g).length + extraLines));
			container.style.height = 16*lines + "px";
			editor.resize();
		}
		updateHeight();

		if (data.readOnly()) {
			editor.setReadOnly(true);
		} else {
			editor.on('change', updateHeight);
			editor.on('blur', function () {
				var jsCode = editor.getSession().getValue();
				data.setValue(jsCode);
			});
		}

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
	},
	update: function (element, data, context) {
		var editor = context.get('editor');
		var jsCode = editor.getSession().getValue();
		return data.value() !== jsCode;
	},
	filter: {
		filter: function (data, schemas) {
			return schemas.any(function (index, schema) {
				return schema.data.get('/media/type') && !schema.data.get('/media/binaryEncoding');
			});
		}
	}
});