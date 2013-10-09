(function () {
	function stripTags(md) {
		// Rather brutal regex
		return md.replace(/<[^<>]+>/g, '');
	}

	Jsonary.render.register({
		renderHtml: function (data, context) {
			var html = "";
			if (typeof markdown === 'object' && markdown && typeof markdown.toHTML === 'function') {
				html = markdown.toHTML(stripTags(data.value()));
			} else if (typeof Markdown === 'object' && typeof Markdown.getSanitizingConverter === 'function') {
				var converter = Markdown.getSanitizingConverter();
				html = converter.makeHtml(data.value());
			}
			if (html.match(/<p>/g).length == 1 && html.substring(0, 3) == "<p>" && html.substring(html.length - 4) == '</p>') {
				html = html.substring(3, html.length - 4);
			}
			return html;
		},
		filter: function (data, schemas) {
			if (data.readOnly() && data.schemas().formats().indexOf('markdown') !== -1) {
				if (typeof markdown === 'object' && markdown && typeof markdown.toHTML === 'function') {
					return true;
				} else if (typeof Markdown === 'object' && typeof Markdown.getSanitizingConverter === 'function') {
					return true;
				}
			}
			return false;
		}
	});
})();