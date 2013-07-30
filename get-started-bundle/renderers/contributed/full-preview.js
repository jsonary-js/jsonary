Jsonary.render.register({
	component: [Jsonary.render.Components.RENDERER, Jsonary.render.Components.LIST_LINKS],
	renderHtml: function (data, context) {
		var previewLink = data.getLink('full-preview');
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
		return data.getLink('full') && data.getLink('full-preview');
	}
});