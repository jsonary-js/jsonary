/* Template: schemas/site.json
			<div id="header">
				<?js if (data.readOnly()) { ?><a href="."><?js } ?>
					<h1 id="page-title">
						<span id="logo-container">&nbsp;<img id="logo" src="Jsonary-glow.png"></span>
						<?/title?>
					</h1>
				<?js if (data.readOnly()) { ?></a><?js } ?>
				<div id="get-started-block">
					<?/tagLine?>
				</div>
			</div>
		
			<div id="info">
				<div class="navigation">
					<h3>Navigation</h3>
					<?js if (data.readOnly()) {
							context.uiState.pageIndex = context.uiState.pageIndex || 0; ?>
						<ul>
							<?js data.property("pages").items(function (index, subData) {
								var html = escapeHtml(subData.propertyValue("title"));
								if (context.uiState.pageIndex == index) {
									echo('<li class="current">');
									echo(html);
								} else {
									echo('<li>');
									action(html, "page", index);
								}
							}); ?>
						</ul>
					<?js } else { ?>
						<?/pages?>
					<?js } ?>
				</div>
				<?/blocks?>
			</div>
			
			<div id="content">
				<?js
					if (data.readOnly()) {
						var page = data.property("pages").item(context.uiState.pageIndex);
						var pageLink = page.getLink("full");
						render(pageLink.follow());
					}
				?>
			</div>
			
			<div id="footer"></div>
*/
Jsonary.render.register({
	renderHtml: Jsonary.template("schemas/site.json"),
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/site.json");
	},
	action: function (context, actionName, arg1) {
		if (actionName == "page") {
			context.uiState.pageIndex = arg1;
			return true;
		}
	}
});

/* Template: schemas/site.json#/definitions/page-link
<li><?js
	var title = escapeHtml(data.propertyValue("title"));
	action(title, "follow");
?></li>
*/
Jsonary.render.register({
	renderHtml: Jsonary.template("schemas/site.json#/definitions/page-link"),
	filter: function (data, schemas) {
		return false;
		return data.readOnly() && schemas.containsUrl("schemas/site.json#/definitions/page-link");
	},
	action: function (context, actionName) {
		if (actionName == "follow") {
			var fullLink = context.data.links("full")[0];
			if (fullLink) {
				fullLink.follow();
			}
		}
	}
});

// PAGE //

/* Template: schemas/page.json
<h2><?/title?></h2>
<?/blocks?>
*/
Jsonary.render.register({
	renderHtml: Jsonary.template("schemas/page.json"),
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json");
	}
});

/* Template: schemas/page.json#/definitions/block
<div class="content-block">
	<?js if (want('/title')) { ?>
		<h3><?/title?></h3>
	<?js } ?>
	<?/content?>
</div>
*/
Jsonary.render.register({
	renderHtml: Jsonary.template("schemas/page.json#/definitions/block"),
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json#/definitions/block");
	}
});

/* Template: schemas/page.json#/definitions/section
<h4><?/title?></h4>
<?/content?>
*/
Jsonary.render.register({
	renderHtml: Jsonary.template("schemas/page.json#/definitions/section"),
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json#/definitions/section");
	}
});

/* Template: schemas/page.json#/definitions/demo
<div class="example" id="<?js echo(data.get("/demoId"));?>">
	<?/initialText?>
</div>
<?js if (!data.readOnly()) { ?>
	<div>
		JS Code:
		<?/javascript?>
	</div>
	<div>
		Element Id:
		<?/demoId?>
	</div>
<?js } ?>
<?/content?>
*/
Jsonary.render.register({
	renderHtml: Jsonary.template("schemas/page.json#/definitions/demo"),
	enhance: function (element, data, context) {
		if (data.readOnly()) {
			var jsCode = data.get("/javascript");
			eval(jsCode);
		}
	},
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json#/definitions/demo");
	}
});

/* Template: schemas/page.json#/definitions/gist
<?js if (!data.readOnly()) { ?>
	Gist ID:
	<?/gist?>
<?js } else {?>
	<p><a href="https://gist.github.com/<%gist%>">view as Gist</a></p>
<?js } ?>
*/
Jsonary.render.register({
	renderHtml: Jsonary.template("schemas/page.json#/definitions/gist"),
	enhance: function (element, data, context) {
		if (data.readOnly()) {
			var gistId = data.propertyValue("gist");
			var callbackName = "gist_callback_" + Math.floor(Math.random()*100000000);
			window[callbackName] = function (gistData) {
				try {
					delete window[callbackName];
				} catch (e) {
					// Why, IE, why?
					window[callbackName] = undefined;
				}
				var html = gistData.div;
				element.innerHTML = html;
				// We can't just add it via HTML, because of IE
				var linkElement = document.createElement("link");
				element.appendChild(linkElement);
				linkElement.setAttribute("rel", "stylesheet");
				linkElement.setAttribute("type", "text/css");
				linkElement.setAttribute("href", gistData.stylesheet);
				script.parentNode.removeChild(script);
			};
			var script = document.createElement("script");
			script.setAttribute("src", "https://gist.github.com/" + gistId + ".json?callback=" + callbackName);
			document.body.appendChild(script);
		}
	},
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json#/definitions/gist");
	}
});

/* Template: schemas/page.json#/definitions/keyValue
<?js if (data.readOnly()) { ?>
	<table class="key-value">
		<?js data.property("keyValue").items(function (index, subData) { ?>
			<tr>
				<td class="key"><?js render(subData.property("key")); ?></td>
				<td class="value"><?js render(subData.property("value")); ?></td>
			</tr>
		<?js }); ?>
	</table>
<?js } else { ?>
	<?/keyValue?>
<?js } ?>
*/
Jsonary.render.register({
	renderHtml: Jsonary.template("schemas/page.json#/definitions/keyValue"),
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json#/definitions/keyValue");
	}
});

/* Template: schemas/page.json#/definitions/keyValue/properties/keyValue/items
<table class="key-value">
	<tr>
		<td class="key"><?/key?></td>
		<td class="value"><?/value?></td>
	</tr>
</table>
*/
Jsonary.render.register({
	renderHtml: Jsonary.template("schemas/page.json#/definitions/keyValue/properties/keyValue/items"),
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json#/definitions/keyValue/properties/keyValue/items");
	}
});