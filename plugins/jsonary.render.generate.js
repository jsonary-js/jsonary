(function (Jsonary) {

	Jsonary.plugins.Generator = function (obj) {
		if (!obj.rendererForData) {
			throw "Generator must have method rendererForData";
		}
		
		obj.name = obj.name || "Generated (unknown)";
		
		function substituteContext(context) {
			var replacement = Object.create(context);
			
			replacement.subContext = function () {
				var result = context.subContext.apply(this, arguments);
				result.set('generated', context.get('generated'));
				return substituteContext(result);
			};
			
			return replacement;
		}
	
		obj.renderHtml = function (data, context) {
			var generatedRenderer = context.get('generated') || obj.rendererForData(data);
			context.set('generated', generatedRenderer);
			return generatedRenderer.renderHtml(data, substituteContext(context));
		};
		obj.enhance = function (element, data, context) {
			var generatedRenderer = context.get('generated');
			if (!generatedRenderer) {
				throw new Error("Generated renderer: cannot enhance without rendering first");
			}
			if (generatedRenderer.enhance) {
				return generatedRenderer.enhance(element, data, substituteContext(context));
			} else if (generatedRenderer.render) {
				return generatedRenderer.render(element, data, substituteContext(context));
			}
		};
		obj.action = function (context) {
			var generatedRenderer = context.get('generated');
			if (!generatedRenderer) {
				throw new Error("Generated renderer: cannot run action without rendering first");
			}
			var args = Array.prototype.slice.call(arguments, 0);
			args[0] = substituteContext(context);
			return generatedRenderer.action.apply(generatedRenderer, arguments);
		};
		obj.update = function (element, data, context) {
			var generatedRenderer = context.get('generated');
			if (!generatedRenderer) {
				throw new Error("Generated renderer: cannot update without rendering first");
			}
			generatedRenderer.defaultUpdate = this.defaultUpdate;
			
			var args = Array.prototype.slice.call(arguments, 0);
			args[2] = substituteContext(context);
			if (generatedRenderer.update) {
				return generatedRenderer.update.apply(generatedRenderer, args);
			} else {
				return this.defaultUpdate.apply(this, args);
			}
		};

		return obj;
	};	

})(Jsonary);