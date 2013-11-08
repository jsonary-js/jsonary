Jsonary.render.register({
	renderHtml: function (data, context) {
		var result = '<div class="site">';
		// Render certain properties with class "site-????"
		data.properties(['title', 'topContent'], function (key, subData) {
			result += '<div class="site-' + Jsonary.escapeHtml(key) + '">';
			result += context.renderHtml(subData);
			result += '</div>';
		});
		// Render other documented properties with class "site-section site-section-????"
		data.properties(data.schemas().knownProperties(['title', 'topContent']), function (key, subData) {
			if (subData.defined() || !subData.readOnly()) {
				result += '<div class="site-section site-section-' + Jsonary.escapeHtml(key) + '">';
				result += context.renderHtml(subData);
				result += '</div>';
			}
		});
		return result + '</div>';
	},
	filter: {
		schema: '/json/schemas/site'
	}
});

Jsonary.render.register({
	component: 'WHOLE_PAGE',
	renderHtml: function (data, context) {
		var title = "Page title";
		var page = null;
		var pageTitle = data.get('/title');
		data.property('sections').items(function (index, subData) {
			if (subData.get('/tabs') == context.uiState.nav) {
				page = subData.property('tabs').getLink('full').href;
				pageTitle += ": " + subData.get('/title');
			}
		});
		context.set('pageTitle', pageTitle);
		var result = '<h1>' + Jsonary.escapeHtml(pageTitle) + '</h1>';
		result += '<hr>';
		if (!page) {
			if (context.uiState.nav) {
				return result + 'Page not found: ' + Jsonary.escapeHtml(context.uiState.nav);
			} else {
				return result + context.renderHtml(data, 'page');
			}
		} else {
			result += context.actionHtml('<span class="button">back to root</span>', 'back');
			return result + context.renderHtml(page, 'page');
		}
	},
	action: {
		back: function (data, context) {
			delete context.uiState.nav;
			return true;
		}
	},
	enhance: function (element, data, context) {
		element.ownerDocument.title = context.get('pageTitle');
	},
	saveState: function (uiState, subStates) {
		var result = {page: subStates.page};
		for (var key in uiState) {
			result[key] = result[key] || uiState[key];
		}
		return result;
	},
	loadState: function (savedState) {
		var page = savedState.page || {};
		delete savedState.page;
		return [savedState, {page: page}];
	},
	linkHandler: function (data, context, link, submissionData, request) {
		var found = null;
		data.property('sections').items(function (index, subData) {
			if (subData.property('tabs').getLink('full') == link) {
				found = subData.get('/tabs');
			}
		});
		if (found) {
			if (Jsonary.location.addHistoryPoint) {
				Jsonary.location.addHistoryPoint();
			}
			context.uiState.nav = found;
			context.rerender();
			return false;
		}
	}
});

Jsonary.location.urlFromUiState = function (uiState) {
	return '?' + Jsonary.encodeData(uiState);
};
Jsonary.location.uiStateFromUrl = function (url) {
	var query = url.split('?').slice(1).join('?');
	return Jsonary.decodeData(query);
};