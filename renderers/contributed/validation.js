// Uses (if exists) a "validation" property on the root object that matches the output of tv4 (https://github.com/geraintluff/tv4)
Jsonary.render.Components.add('VALIDATION');
Jsonary.render.register({
	component: Jsonary.render.Components.VALIDATION,
	renderHtml: function (data, context) {
		var result = "";
		var rootData = data.document.root;
		if (!!rootData.validation) {
			if (data.pointerPath() != "") {
				for (i in rootData.validation.errors) {
					if (rootData.validation.errors[i].dataPath == data.pointerPath()) {
						//result += "<span class='validationError'>(validation message: " + rootData.validation.errors[i].message+" code: "+rootData.validation.errors[i].code+" schemaKey: "+rootData.validation.errors[i].schemaKey+")</span>";
						result += "<span class='validationError'>" + rootData.validation.errors[i].message + "</span>";
						//remove i entry in errors
						rootData.validation.errors.splice(i, 1);
					}
				}
			}
		}
		return context.renderHtml(data) + result;
	}
});
