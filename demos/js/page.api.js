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
		req = Jsonary.getData(itemUrl, null);
	}
	$('#main').empty().addClass("loading");
	window.scrollTo(0, 0);
	req.getData(function(data, request) {
		data.addSchema("../api/api-schema.json");
		data.whenSchemasStable(function () {
			$('#main').removeClass("loading").empty().renderJson(data);
		});
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

