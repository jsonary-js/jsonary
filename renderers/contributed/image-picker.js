// Fancy image-picker with HTML5
if (typeof FileReader === 'function') {
	Jsonary.render.register({
		component: Jsonary.render.Components.ADD_REMOVE,
		renderHtml: function (data, context) {
			if (data.defined()) {
				var mediaType = null;
				data.schemas().each(function (index, schema) {
					if (/^image/.test(schema.data.get('/media/type'))) {
						mediaType = schema.data.get('/media/type');
					}
				});
				var dataUrl = 'data:;base64,' + data.value();
				var result = '<div class="json-object-delete-container">';
				if (!data.readOnly()) {
					result += context.actionHtml('<span class="json-object-delete">X</span>', 'remove');
				}
				result += '<div class="base64-image-preview"><img src="' + Jsonary.escapeHtml(dataUrl) + '"></div>';
				result += '</div>';
				return result;
			} else if (context.uiState.warning) {
				return '<div class="base64-image-warning warning">' + Jsonary.escapeHtml(context.uiState.warning) + '"</div>';
			} else {
				return '<div class="base64-image-placeholder"></div>';
			}
		},
		action: {
			remove: function (data, context) {
				data.remove();
			}
		},
		render: function (element, data, context) {
			if (data.readOnly()) {
				return;
			}
			function handleFileSelect(files) {
				// files is a FileList of File objects. List some properties.
				var output = [];
				if (files.length) {
					var firstFile = files[0];
					if (!firstFile.type.match('image.*')) {
						return;
					}
					var reader = new FileReader();

					reader.onload = function(loadEvent) {
						delete context.uiState.warning;
						var dataUrl = loadEvent.target.result;
						var remainder = dataUrl.substring(5);
						var mediaType = remainder.split(';', 1)[0];
						remainder = remainder.substring(mediaType.length + 1);
						var binaryEncoding = remainder.split(',', 1)[0];
						remainder = remainder.substring(binaryEncoding.length + 1);
						if (binaryEncoding !== 'base64') {
							context.uiState.warning = "Data URL is not base64";
							Jsonary.log(Jsonary.logLevel.ERROR, 'Data URL is not base64');
							return context.rerender();
						} else if (!/^image\//.test(mediaType)) {
							context.uiState.warning = "File must be an image";
							Jsonary.log(Jsonary.logLevel.ERROR, 'Data is not an image');
							return context.rerender();
						}
						data.setValue(remainder);
					};

					reader.readAsDataURL(firstFile);
				}
			}
			
			var mediaType = null;
			data.schemas().each(function (index, schema) {
				if (/^image/.test(schema.data.get('/media/type'))) {
					mediaType = schema.data.get('/media/type');
				}
			});

			var input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.setAttribute('accept', mediaType || 'image/*');
			input.onchange = function (evt) {
				var files = evt.target.files; // FileList object
				handleFileSelect(files);
			};
			
			var firstElement = null;
			for (var i = 0; i < element.childNodes.length; i++) {
				if (element.childNodes[i].nodeType === 1) {
					firstElement = element.childNodes[i];
				}
			}
			firstElement.addEventListener("dragover", function (e) {
				e.preventDefault();
			}, true);
			firstElement.addEventListener("dragenter", function (e) {
				firstElement.className += " drag-hover";
			});
			firstElement.addEventListener("dragleave", function (e) {
				firstElement.className = firstElement.className.replace(/(^| )drag-hover($| )/g, ' ');
			});
			firstElement.addEventListener("drop", function (e) {
				e.preventDefault(); 
				window.evt = e;
				console.log(e);
				var files = e.dataTransfer.files;
				handleFileSelect(files);
			}, true);
			
			element.appendChild(input);
		},
		filter: {
			type: ['string', undefined],
			filter: function (data) {
				var schemas = data.schemas(true); // force search for potential future schemas
				return schemas.any(function (index, schema) {
					return (schema.data.get('/media/binaryEncoding') || "").toLowerCase() == 'base64'
						&& /^image\//.test(schema.data.get('/media/type'));
				});
			}
		}
	});
}