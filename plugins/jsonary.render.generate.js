(function (Jsonary) {

	Jsonary.plugins.Generator = function (obj) {
		if (!obj.rendererForData) {
			throw "Generator must have method rendererForData";
		}
	
		obj.renderHtml = function (data, context) {
			context.generatedRenderer = context.generatedRenderer || obj.rendererForData(data);
			return context.generatedRenderer.renderHtml(data, context);
		};
		obj.enhance = function (element, data, context) {
			context.generatedRenderer = context.generatedRenderer || obj.rendererForData(data);
			if (context.generatedRenderer.enhance) {
				return context.generatedRenderer.enhance(element, data, context);
			} else if (context.generatedRenderer.render) {
				return context.generatedRenderer.render(element, data, context);
			}
		};
		obj.action = function (context) {
			context.generatedRenderer = context.generatedRenderer || obj.rendererForData(context.data);
			return context.generatedRenderer.action.apply(context.generatedRenderer, arguments);
		};
		obj.update = function (element, data, context) {
			context.generatedRenderer = context.generatedRenderer || obj.rendererForData(context.data);
			if (context.generatedRenderer.update) {
				return context.generatedRenderer.update.apply(context.generatedRenderer, arguments);
			} else {
				return this.defaultUpdate.apply(this, arguments);
			}
		};

		return obj;
	};	

})(Jsonary);