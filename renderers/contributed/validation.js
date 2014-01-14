// Uses (if exists) a "validation" property on the root object that matches the output of tv4 (https://github.com/geraintluff/tv4)
Jsonary.render.Components.add('VALIDATION');
Jsonary.render.register({
    component: Jsonary.render.Components.VALIDATION,
    renderHtml: function (data, context) {
        var result = "";
        var rootData = data.document.root;
        if (rootData.validation) {
            var errors = rootData.validation.errors;
            if (errors) {
                for (var i = 0; i < errors.length; i++) {
                    if (errors[i].dataPath == data.pointerPath()) {
                        result += "<span class='validation-error'>" + errors[i].message + "</span>";
                        //mark i entry in errors as rendered, so that we can display not rendered errors somewhere else
                        errors[i].rendered = true;

                    }
                }
            }
        }
        return context.renderHtml(data) + result;
    }
});
