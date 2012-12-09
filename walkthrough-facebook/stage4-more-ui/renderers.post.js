Jsonary.render.register({
	messageTagsHtml: function(context, messageData, tagsData) {
		var messageString = messageData.value();
		var splits = [];
		var firstSplit = messageString.length;
		tagsData.properties(function (key, tagData) {
			key = parseInt(key);
			splits.push(key);
			if (key < firstSplit) {
				firstSplit = key;
			}
		});
		var messageParts = [messageString.substring(0, firstSplit)]; // TODO: escape the HTML
		for (var i = 0; i < splits.length; i++) {
			var tagInfo = tagsData.property(splits[i]).itemValue(0);
			var extract = messageString.substring(tagInfo.offset, tagInfo.offset + tagInfo.length);
			var linkHtml = context.actionHtml(extract, tagInfo.id);
			messageParts.push(linkHtml);
			var remainder = messageString.substring(tagInfo.offset + tagInfo.length, splits[i + 1]);
			messageParts.push(remainder); // TODO: escape the HTML
		}
		return messageParts.join("");
	},
//	component: [Jsonary.render.Components.RENDERER, Jsonary.render.Components.LIST_LINKS],
	renderHtml: function (data, context) {
		var result = JSON.stringify(data.keys());
		result += '<br>' + data.json();
		result += '<div class="facebook-post">';
		result += '<div class="facebook-post-toFrom>';
		result += context.renderHtml(data.property("from"));
		if (data.property("to").defined() && data.property("to").property("data").length() > 0) {
			result += " to " + context.renderHtml(data.property("to"));
		}
		result += '</div>';
		result += '<div class="facebook-post-created">'
			+ context.renderHtml(data.property("created_time"))
			+ '</div>';
		if (data.property("message").defined()) {
			result += '<div class="facebook-post-message">'
				+ this.messageTagsHtml(context, data.property("message"), data.property("message_tags"))
				+ '</div>';
		}
		if (data.property("story").defined()) {
			result += '<div class="facebook-post-message">'
				+ this.messageTagsHtml(context, data.property("story"), data.property("story_tags"))
				+ '</div>';
		}
		if (data.property("link").defined()) {
			var pictureLink = data.links('picture')[0];
			result += '<div class="facebook-post-link">'
				+ '<img src="' + pictureLink.href + '" class="facebook-post-link-picture">'
				+ '<a class="facebook-post-link-title" href="' + data.propertyValue("link") + '">'
				+ context.renderHtml(data.property('name'))
				+ '</a><div class="facebook-post-link-caption">'
				+ context.renderHtml(data.property('caption'))
				+ '</div><div class="facebook-post-link-description">'
				+ context.renderHtml(data.property('description'))
				+ '</div><div style="clear: both"></div>'
				+ '</div>';
		}
		var comments = data.property("comments");
		var commentCount = parseInt(comments.propertyValue("count"));
		if (commentCount > 0) {
			result += '<div class="facebook-post-comments">';
			if (context.uiState.allComments) {
				var commentsLink = data.links('comments')[0];
				commentsLink.follow(function (link, submissionData, request) {
					result += context.renderHtml(request);
					return false;
				});
			} else {
				comments.property("data").items(function (index, subData) {
					result += context.renderHtml(subData);
				});
				if (commentCount > comments.property("data").length()) {
					result += '<div class="facebook-post-comment-count">'
						+ context.actionHtml("show all " + commentCount + " comments", "all-comments")
						+ '</div>';
				}
			}
			result += '</div>';
		}
		if (data.property("actions").defined()) {
			result +='<div class="facebook-post-actions">';
			data.property("actions").items(function (index, subData) {
				var actionName = subData.propertyValue("name");
				result += context.actionHtml('<span class="facebook-post-action">' + actionName + '</a>', "action-" + actionName);
			});
			if (context.uiState.inputComment) {
				var commentLink = data.links('comment')[0];
				var data = commentLink.createSubmissionData();
				result += context.renderHtml(data);
			}
			result += '</div>';
		}
		result += '</div>';
		return result;
	},
	action: function (context, actionName, arg1) {
		var data = context.data;
		if (actionName == "follow-link") {
			data.links('full')[0].follow();
		} else if (actionName == "all-comments") {
			context.uiState.allComments = true;
			return true;
		} else if (actionName = "action-Comment") {
			context.uiState.inputComment = true;
			return true;
		} else {
			alert("Unknown action: " + actionName);
		}
	},
	filter: function (data, schemas, uiState) {
		return schemas.containsUrl("post.json") && data.readOnly();
	}
});