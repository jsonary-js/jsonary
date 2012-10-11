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
		$('#main').removeClass("loading").empty().renderJson(data.editableCopy());
	});
}

Jsonary.addLinkHandler(function(link, data, request) {
	navigateTo(link.href, request);
	return true;
});

Jsonary.getSchema("json/?schema", function(schema) {
	var updateLink = schema.getLink("update");
	updateLink.addHandler(function () {
		Jsonary.invalidate("json/view.php");
		Jsonary.invalidate("json/update.php?schema");
	});
});

