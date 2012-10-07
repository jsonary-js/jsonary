var currentUrl = ""
var interval = setInterval(function() {
	var hash = window.location.hash.substring(1);
	if (hash != currentUrl) {
		navigateTo(hash);
	}
}, 100);

$('#go').click(function () {
	var itemUrl = $('#url-bar').val();
	navigateTo(itemUrl);
});

function navigateTo(itemUrl, req) {
	currentUrl = itemUrl;
	window.location = "#" + itemUrl;
	$('#url-bar').val(itemUrl);
	
	if (req == undefined) {
		req = Jsonary.getData(itemUrl);
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

// Navigate straight to the initial URL
if (window.location.hash == "#" || window.location.hash == "") {
	window.location.replace("#" + $('#url-bar').val());
} else {
	var url = window.location.hash.substring(1);
	$('#url-bar').val(url);
}
$('#go').click();

