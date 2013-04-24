Jsonary.loadTemplates();

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
	JS Code:
	<?/javascript?>
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