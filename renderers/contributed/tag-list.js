Jsonary.render.register({
	renderHtml: function (data, context) {
		var enumDatas = data.schemas().enumDatas();
	},
	filter: {
		type: 'array',
		filter: function (data, schemas) {
			if (schemas.tupleTyping()) {
				return false;
			}
			var indexSchemas = schemas.indexSchemas(0);
			return !!schemas.enumDatas();
		}
	}
});