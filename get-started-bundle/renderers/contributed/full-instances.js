(function (Jsonary) {
	Jsonary.render.register({
		component: [Jsonary.render.Components.RENDERER, Jsonary.render.Components.LIST_LINKS],
		renderHtml: function (data, context) {
			var result = '<select name="' + context.inputNameForAction('select-url') + '">';
			var options = {};
			var optionOrder = [];
			var optionValues = {};
			var renderData = {};
			
			var links = data.links('instances');
			var fullLink = data.getLink('full');
			var previewPath = "";
			
			var fullPreviewLink = data.getLink('full-preview');
			if (fullPreviewLink && Jsonary.Uri.resolve(fullPreviewLink.href, '#') == Jsonary.Uri.resolve(fullLink.href, '#')) {
				var fullFragment = fullLink.href.split('#').slice(1).join('#');
				var previewFragment = fullPreviewLink.href.split('#').slice(1).join('#');
				var previewPath = decodeURIComponent(previewFragment.substring(fullFragment.length));
			}
			
			var rerender = false;
			for (var i = 0; i < links.length; i++) {
				var link = links[i];
				link.follow(null, false).getData(function (data) {
					data.items(function (index, subData) {
						var url = subData.getLink('self') ? subData.getLink('self').href : subData.referenceUrl();
						if (!options[url]) {
							options[url] = subData;
	
							var value = fullLink.valueForUrl(url);
							if (value !== undefined) {
								optionOrder.push(url);
								optionValues[url] = value;
								renderData[url] = subData.subPath(previewPath);
							}
						}
					});
					if (rerender) {
						context.rerender();
						rerender = false;
					}
				});
			}
			rerender = true;
			var optionsHtml = "";
			var foundSelected = false;
			for (var i = 0; i < optionOrder.length; i++) {
				var url = optionOrder[i];
				var selected = '';
				if (data.equals(Jsonary.create(optionValues[url]))) {
					foundSelected = true;
					selected = ' selected';
				}
				optionsHtml += '<option value="' + Jsonary.escapeHtml(url) + '"' + selected + '>' + context.renderHtml(renderData[url]) + '</option>';
			}
			if (!foundSelected) {
				optionsHtml = '<option selected>' + context.renderHtml(fullPreviewLink.follow(null, false), 'current') + '</option>' + optionsHtml;
			}
			result += optionsHtml;
			return result + '</select>';
		},
		action: function (context, actionName, arg1) {
			var data = context.data;
			if (actionName == 'select-url') {
				var url = arg1;
				var fullLink = data.getLink('full');
				var value = fullLink.valueForUrl(url);
				data.setValue(value);
			}
		},
		filter: function (data, schemas) {
			return !data.readOnly() && data.getLink('instances') && data.getLink('full');
		}
	});
})(Jsonary);