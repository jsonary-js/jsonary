var currentUrl = "";
function navigateTo(itemUrl, request) {
	currentUrl = itemUrl;
	window.location = "#" + itemUrl;
	$('#url-bar').val(itemUrl);
	
	if (request == undefined) {
		request = Jsonary.getData(itemUrl);
	}
	request.getData(function(data, request) {
		$('#main').renderJson(data);
	});
}

Jsonary.addLinkHandler(function(link, data, request) {
	navigateTo(link.href, request);
	return true;
});

$('#go').click(function () {
	var itemUrl = $('#url-bar').val();
	navigateTo(itemUrl);
});

var interval = setInterval(function() {
	var hash = window.location.hash.substring(1);
	if (hash != currentUrl) {
		navigateTo(hash);
	}
}, 100);

// Navigate straight to the initial URL
if (window.location.hash == "#" || window.location.hash == "") {
	window.location.replace("#" + $('#url-bar').val());
} else {
	var url = window.location.hash.substring(1);
	$('#url-bar').val(url);
}
$('#go').click();
