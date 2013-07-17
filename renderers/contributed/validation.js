// Uses (if exists) a "validation" property on the root object that matches the output of tv4 (https://github.com/geraintluff/tv4)
Jsonary.render.Components.add('VALIDATION');
Jsonary.render.register({
	component: Jsonary.render.Components.VALIDATION,
	renderHtml: function (data, context) {
		var result = "";
		var rootData = data.document.root;
		if (rootData.validation) {
			var errors = rootData.validation.errors;
			for (var i = 0; i < errors.length; i++) {
				if (errors[i].dataPath == data.pointerPath()) {
					result += "<span class='validation-error'>" + errors[i].message + "</span>";
                    //remove i entry in errors, so that it is not displayed again where "leftover's" are displayed
                    errors.splice(i, 1);

                }
			}
		}
		return context.renderHtml(data) + result;
	}
});
