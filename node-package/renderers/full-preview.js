Jsonary.render.register({
	component: [Jsonary.render.Components.LIST_LINKS],
	renderHtml: function (data, context) {
		var previewLink = data.getLink('preview') || data.getLink('full-preview');
		var innerHtml = context.renderHtml(previewLink.follow(null, false));
		return context.actionHtml(innerHtml, 'full');
	},
	action: function (context, actionName) {
		var data = context.data;
		if (actionName == 'full') {
			var fullLink = data.getLink('full');
			fullLink.follow();
		}
	},
	filter: function (data, schemas) {
		return data.readOnly() && data.getLink('full') && (data.getLink('preview') || data.getLink('full-preview'));
	}
});

Jsonary.render.register({
	component: [Jsonary.render.Components.LIST_LINKS],
	renderHtml: function (data, context) {
		var previewLink = data.getLink('preview') || data.getLink('full-preview');
		return context.renderHtml(data) + " - " + context.renderHtml(previewLink.follow(null, false));
	},
	filter: function (data, schemas) {
		return !data.readOnly() && data.getLink('full') && (data.getLink('preview') || data.getLink('full-preview'));
	}
});