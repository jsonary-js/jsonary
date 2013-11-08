tests.add("Preserve state when re-rendering remote items (as sub-render)", function() {
	var thisTest = this;
	// Simple read-only boolean
	var data = Jsonary.create(true, null, true);
	
	var remoteUrl = "http://example.com/data/" + Math.random();
	Jsonary.addToCache(remoteUrl, "Remote data");
	
	var renderer = Jsonary.render.register({
		name: "Test renderer",
		renderHtml: function (data, context) {
			return context.renderHtml(remoteUrl, 'remote');
		},
		filter: function (d) {
			return d === data;
		}
	});
	var remoteUiState = null;
	Jsonary.render.register({
		name: "Remote data",
		renderHtml: function (data, context) {
		if (remoteUiState) {
				thisTest.assert(remoteUiState == context.uiState, "UI state should not be reset");
			} else {
				context.uiState.testVar = Math.random();
				remoteUiState = context.uiState;
			}
			return Jsonary.escapeHtml(data.value()) + ": " +  context.uiState.testVar;
		},
		filter: function (d) {
			return d.document.url == remoteUrl;
		}
	});
	
	Jsonary.asyncRenderHtml(data, null, function (error, html, renderContext) {
		renderContext.asyncRerenderHtml(function (error2, html2, renderContext) {
			thisTest.assert(html == html2, "HTML renderings should be equivalent");
			thisTest.pass();
		});
	});
});