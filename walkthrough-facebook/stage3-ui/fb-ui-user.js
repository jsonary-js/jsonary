Jsonary.getSchema("../schemas/object.json");
Jsonary.getSchema("../schemas/me.json");
Jsonary.getSchema("../schemas/user.json");
Jsonary.getSchema("../schemas/post.json");
Jsonary.getSchema("../schemas/photo.json");
Jsonary.getSchema("../schemas/album.json");
Jsonary.getSchema("../schemas/guess.json");

Jsonary.render.register({
	component: [Jsonary.render.Components.RENDERER, Jsonary.render.Components.LIST_LINKS],
	tabs: {
		"photos": {
			title: "Photos",
			buildHtml: function (builder, data, context) {
				var photosLink = data.links('photos')[0];
				var albumsLink = data.links('albums')[0];
				albumsLink.follow(function (link, submissionData, request) {
					builder.html('<div class="facebook-user-section-title">');
					context.buildHtml(builder, data.property("first_name"));
					builder.html('\'s albums</div>');
					builder.html('<div class="facebook-user-section">');
					context.buildHtml(builder, request);
					builder.html('</div>');
					return false;
				});
				photosLink.follow(function (link, submissionData, request) {
					builder.html('<div class="facebook-user-section-title">Photos of ');
					context.buildHtml(builder, data.property("first_name"));
					builder.html('</div>');
					builder.html('<div class="facebook-user-section">');
					context.buildHtml(builder, request);
					builder.html('</div>');
					return false;
				});
			}
		}
	},
	tabOrder: ["photos"],
	buildHtml: function (builder, data, context) {
		var uiState = context.uiState;
		if (uiState.tab == undefined) {
			uiState.tab = this.tabOrder[0];
		}
	
		// Render header
		builder.html('<div class="facebook-user">');
		var pictureLink = data.links("picture")[0];
		builder.html('<img class="facebook-user-picture" src="' + pictureLink.href + '">');
		builder.html('<div class="facebook-user-name">');
		context.buildHtml(builder, data.property("name"));
		builder.html('</div>');
		builder.html('<div class="facebook-user-update-time">last updated ');
		context.buildHtml(builder, data.property("updated_time"));
		builder.html('</div>');

		// Render the tab switcher
		builder.html('<div class="facebook-user-tabs">');
		for (var i = 0; i < this.tabOrder.length; i++) {
			var tabKey = this.tabOrder[i];
			var selected = (tabKey == uiState.tab) ? ' selected' : '';
			var tabHtml = '<div class="facebook-user-tab' + selected + '">' + this.tabs[tabKey].title + '</div>';
			builder.html(context.actionHtml(tabHtml, "select-tab", tabKey));
		}
		builder.html('</div>');
		// Render the actual tab data
		builder.html('<div class="facebook-user-tab-content">');
		this.tabs[uiState.tab].buildHtml(builder, data, context);
		builder.html('<div style="clear: both"></div></div>');
		builder.html('</div>');
		return result;
	},
	action: function (context, actionName, arg1) {
		if (actionName == "select-tab") {
			context.uiState.tab = arg1;
			return true;
		} else if (actionName == "post") {
			var data = context.data;
			var submissionData = arg1;
			var submissionLink = data.links("create_post")[0];
			submissionLink.follow(submissionData.value(), function () {return false;});
			return true;
		}
	},
	filter: function (data, schemas, uiState) {
		return schemas.containsUrl("user.json");
	}
});
