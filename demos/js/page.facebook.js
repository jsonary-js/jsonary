// Facebook auth
if (window.facebookAppId == undefined) {
	alert("window.facebookAppId is not defined.");
} else if (window.facebookRedirectUri == undefined) {
	alert("window.facebookRedirectUri is not defined.");
} else if (window.facebookPermissions == undefined) {
	alert("window.facebookPermissions is not defined.");
}

var accessToken = null;

function decodeHash() {
	var hashParts = window.location.hash.substring(1).split("&");
	var hashData = {};
	for (var i = 0; i < hashParts.length; i++) {
		if (hashParts[i] != "") {
			var index = hashParts[i].indexOf("=");
			if (index == -1) {
				hashData[hashParts[i]] = "";
			} else {
				var key = hashParts[i].substring(0, index);
				var value = decodeURIComponent(hashParts[i].substring(index + 1));
				hashData[key] = value;
			}
		}
	}
	return hashData;
}

function encodeHash(hashData) {
	var newHash = [];
	for (var key in hashData) {
		if (hashData[key] != "") {
			newHash.push(key + "=" + encodeURIComponent(hashData[key]));
		} else {
			newHash.push(key);
		}
	}
	return "#" + newHash.join("&");
}

$(document).ready(function() {
	var hashData = decodeHash();
	if (hashData.access_token != undefined) {
		accessToken = hashData.access_token;
		delete hashData.access_token;
		delete hashData.expires_in;
		window.location.replace(encodeHash(hashData));
		startBrowsing();
	} else {
		var authUrl = "https://www.facebook.com/dialog/oauth?client_id=" + facebookAppId + "&redirect_uri=" + encodeURIComponent(facebookRedirectUri + window.location.hash) + "&response_type=token&scope=" + facebookPermissions.join(",");
		$('<a>Authorise with Facebook</a>').attr("href", authUrl).appendTo($('#main'));
	}
});

// Add access token to all outgoing requests
Jsonary.addLinkPreHandler(function(link, data) {
	if (accessToken != null) {
		if (data.basicType() == undefined) {
			data.setValue({access_token: accessToken});
		} else if (data.basicType() == "object") {
			data.property("access_token").setValue(accessToken);
		}
	}
});

// Client

var schemaBaseUrl = window.location.toString();
if (schemaBaseUrl.indexOf("#") != -1) {
	schemaBaseUrl = schemaBaseUrl.substring(0, schemaBaseUrl.indexOf("#"))
}
schemaBaseUrl = schemaBaseUrl.substring(0, schemaBaseUrl.lastIndexOf("/")) + "/hints/facebook";

function guessSchema(itemUrl) {
	if (itemUrl.substr(itemUrl.length - 3) == "/me") {
		return schemaBaseUrl + "/me.json";
	}
	if (itemUrl.substr(itemUrl.length - 5) == "/feed" || itemUrl.substr(itemUrl.length - 5) == "/home") {
		return schemaBaseUrl + "/arrays/posts.json";
	}
	if (itemUrl.substr(itemUrl.length - 7) == "/albums") {
		return schemaBaseUrl + "/arrays/albums.json";
	}
	if (itemUrl.substr(itemUrl.length - 7) == "/photos") {
		return schemaBaseUrl + "/arrays/photos.json";
	}
	if (itemUrl.substr(itemUrl.length - 9) == "/comments") {
		return schemaBaseUrl + "/arrays/comments.json";
	}
	if (itemUrl.substr(itemUrl.length - 6) == "/likes") {
		return schemaBaseUrl + "/arrays/likes.json";
	}
}

var currentUrl = ""
function startBrowsing() {
	var interval = setInterval(function() {
		var hashData = decodeHash();
		if (hashData.url == "" || hashData.url == undefined) {
			hashData.url = "https://graph.facebook.com/me";
			window.location.replace(encodeHash(hashData));
		}
		if (hashData.url != currentUrl) {
			navigateTo(hashData.url);
		}
	}, 100);
}

function navigateTo(itemUrl, req) {
	currentUrl = itemUrl;
	var hashData = decodeHash();
	hashData.url = itemUrl;
	window.location = encodeHash(hashData);
	
	if (req == undefined) {
		req = Jsonary.getData({
			url: itemUrl,
			data: {access_token: accessToken}
		}, null, guessSchema(itemUrl));
	}
	$('#main').empty().addClass("loading");
	req.getData(function(data, request) {
		$('#main').removeClass("loading").empty().renderJson(data);
	});
}

Jsonary.addLinkHandler(function(link, data, request) {
	navigateTo(link.href, request);
	return true;
});

