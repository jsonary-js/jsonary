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
		"about": {
			title: "Info",
			renderHtml: function (data, context) {
				var result = "";
				result += '<div class="facebook-user-section-title">About me</div><div class="facebook-user-section">' + context.renderHtml(data.property("bio")) + '</div>';
				result += '<div class="facebook-user-section-title">Quotes</div><div class="facebook-user-section">' + context.renderHtml(data.property("quotes")) + '</div>';
				if (data.property("relationship_status").defined()) {
					result += '<div class="facebook-user-section-title">Relationship</div>';
					result += '<div class="facebook-user-section">' + context.renderHtml(data.property("relationship_status"));
					result += '<br>' + context.renderHtml(data.property("significant_other"));
					result += '</div>';
				}
				if (data.property("website").defined()) {
					result += '<div class="facebook-user-section-title">Website</div><div class="facebook-user-section">';
					result += '<a href="' + data.propertyValue("website") + '">' + context.renderHtml(data.property("website")) + '</a>';
					result += '</div>';
				}
				return result;
			}
		},
		"feed": {
			title: "Wall",
			renderHtml: function (data, context) {
				var html = "";
				var postLink = data.links('create_post')[0];
				var submissionData = postLink.createSubmissionData();
				html += '<div class="facebook-user-section-title">New post</div>';
				html += '<div class="facebook-user-section">';
				html += context.renderHtml(submissionData);
				html += context.actionHtml('<div class="facebook-button">Post</div>', "post", submissionData);
				html += '</div>';
				html += '<div style="clear: left"></div>';
				var feedLink = data.links('feed')[0];
				feedLink.follow(function (link, submissionData, request) {
					html += context.renderHtml(request);
					return false;
				});
				return html;
			}
		},
		"friends": {
			title: "Friends",
			renderHtml: function (data, context) {
				var friendsLink = data.links('friends')[0];
				var html = "Error loading friends";
				friendsLink.follow(function (link, submissionData, request) {
					html = context.renderHtml(request);
					return false;
				});
				return html;
			}
		},
		"photos": {
			title: "Photos",
			renderHtml: function (data, context) {
				var photosLink = data.links('photos')[0];
				var albumsLink = data.links('albums')[0];
				var html = "";
				albumsLink.follow(function (link, submissionData, request) {
					html += '<div class="facebook-user-section-title">' + context.renderHtml(data.property("first_name")) + '\'s albums</div>';
					html += '<div class="facebook-user-section">' + context.renderHtml(request) + '</div>';
					return false;
				});
				photosLink.follow(function (link, submissionData, request) {
					html += '<div class="facebook-user-section-title">Photos of ' + context.renderHtml(data.property("first_name")) + '</div>';
					html += '<div class="facebook-user-section">' + context.renderHtml(request) + '</div>';
					return false;
				});
				return html;
			}
		},
		"updates": {
			title: "Updates",
			renderHtml: function (data, context) {
				var postsLink = data.links('posts')[0];
				var html = "";
				postsLink.follow(function (link, submissionData, request) {
					html += context.renderHtml(request);
					return false;
				});
				return html;
			}
		},
		"tagged": {
			title: "Tagged",
			renderHtml: function (data, context) {
				var taggedLink = data.links('tagged')[0];
				var html = "";
				taggedLink.follow(function (link, submissionData, request) {
					html += context.renderHtml(request);
					return false;
				});
				return html;
			}
		}
	},
	tabOrder: ["about", "feed", "friends", "photos", "updates", "tagged"],
	renderHtml: function (data, context) {
		var uiState = context.uiState;
		if (uiState.tab == undefined) {
			uiState.tab = this.tabOrder[0];
		}
	
		// Render header
		var result = '<div class="facebook-user">';
		var pictureLink = data.links("picture")[0];
		result += '<img class="facebook-user-picture" src="' + pictureLink.href + '">';
		result += '<div class="facebook-user-name">' + context.renderHtml(data.property("name")) + '</div>';
		result += '<div class="facebook-user-update-time">last updated ' + context.renderHtml(data.property("updated_time")) + '</div>';

		// Render the tab switcher
		result += '<div class="facebook-user-tabs">';
		for (var i = 0; i < this.tabOrder.length; i++) {
			var tabKey = this.tabOrder[i];
			var selected = (tabKey == uiState.tab) ? ' selected' : '';
			var tabHtml = '<div class="facebook-user-tab' + selected + '">' + this.tabs[tabKey].title + '</div>';
			result += context.actionHtml(tabHtml, "select-tab", tabKey);
		}
		result += '</div>';
		// Render the actual tab data
		result += '<div class="facebook-user-tab-content">' + this.tabs[uiState.tab].renderHtml(data, context) + '<div style="clear: both"></div></div>';

		result += '</div>';
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
