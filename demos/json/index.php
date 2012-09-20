<?php
	if (isset($_GET["schema"])) {
		// Output the schema
		header("Content-Type: application/json; profile=http://json-schema.org/hyper-schema");
		?>
			{
				"properties": {
					"Title": {
						"title": "Title"
					}
				},
				"links": [
					{
						"href": "update.php",
						"rel": "update",
						"method": "POST",
						"schema": {
							"$ref": "update.php?schema"
						}
					},
					{
						"href": "view.php",
						"rel": "data"
					}
				]
			}
		<?php
	} else {
		// Output the data
		header("Content-Type: application/json; profile=?schema");
		?>
			{
				"Title": "The main page",
				"Explanation": "A basic test of the Render.Jsonary library."
			}
		<?php
	}
?>
