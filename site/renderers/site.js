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
	enhance2: function (element, data, context) {
		element.innerHTML = "";
		var iframe = document.createElement("iframe");
		iframe.setAttribute("width", "100%");
		iframe.setAttribute("height", "60px");
		iframe.style.visibility = "hidden";
		iframe.style.border = "none";
		element.appendChild(iframe);
		
		var callbackName = "gist_resize_" + Math.floor(Math.random()*100000000);
		window[callbackName] = function (height) {
			console.log(arguments);
			delete window[callbackName];
			iframe.style.height = height + "px";
			iframe.style.visibility = "visible";
		};
		
		var iframeCode = '<html>'
						+ '<body onload="parent.' + callbackName + '(document.body.scrollHeight)">'
							+ '<script type="text/javascript" src="https://gist.github.com/' + data.propertyValue("gist") + '.js"></script>'
							+ '<style>td, th {font-size: 0.8em} .gist {font-size: 0.8em}</style>'
						+ '</body>'
					+ '</html>';
		var gistFrameDoc = iframe.document;
		if (iframe.contentDocument) {
			gistFrameDoc = iframe.contentDocument;
		} else if (iframe.contentWindow) {
			gistFrameDoc = iframe.contentWindow.document;
		}
		gistFrameDoc.open();
		gistFrameDoc.writeln(iframeCode);
		gistFrameDoc.close();

	},
	filter: function (data, schemas) {
		return schemas.containsUrl("schemas/page.json#/definitions/gist");
	}
});