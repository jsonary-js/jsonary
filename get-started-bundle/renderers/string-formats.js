(function () {
	// Display string
	Jsonary.render.register({
		renderHtml: function (data, context) {
			var date = new Date(data.value());
			return '<span class="json-string json-string-date">' + date.toLocaleString() + '</span>';
		},
		filter: function (data, schemas) {
			return data.basicType() == "string" && data.readOnly() && schemas.formats().indexOf("date-time") != -1;
		}
	});
	
	// Display string
	Jsonary.render.register({
		renderHtml: function (data, context) {
			if (data.readOnly()) {
				if (context.uiState.showPassword) {
					return Jsonary.escapeHtml(data.value());
				} else {
					return context.actionHtml('(show password)', 'show-password');
				}
			} else {
				var inputName = context.inputNameForAction('update');
				return '<input type="password" name="' + inputName + '" value="' + Jsonary.escapeHtml(data.value()) + '"></input>';
			}
		},
		action: function (context, actionName, arg1) {
			if (actionName == "show-password") {
				context.uiState.showPassword = true;
				return true;
			} else if (actionName == "update") {
				context.data.setValue(arg1);
			}
		},
		filter: function (data, schemas) {
			return data.basicType() == "string" && schemas.formats().indexOf("password") != -1;
		}
	});
})();
