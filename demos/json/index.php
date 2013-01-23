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
				"Explanation": "A basic test of Jsonary's ability to adapt to data/hyper-schemas supplied by the server.\n\nWhen you click the \"update\" link, you are prompted to enter data (according to a schema supplied by the server), which is then POSTed back and stored."
			}
		<?php
	}
?>
