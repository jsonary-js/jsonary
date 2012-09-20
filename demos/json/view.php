<?php
	if (isset($_GET["schema"])) {
		header("Content-Type: application/json; profile=http://json-schema.org/hyper-schema");
		?>
			{
				"type": "object",
				"properties": {
					"message": {
						"type": "string",
						"default": "message text"
					},
					"dangerRating": {
						"type": "integer",
						"default": 0
					}
				}
			}
		<?php
	} else {
		header("Content-Type: application/json; profile=?schema");
		if (file_exists("data.json")) {
			readfile("data.json");
		} else {
			echo json_encode("No data");
		}
	}
?>
