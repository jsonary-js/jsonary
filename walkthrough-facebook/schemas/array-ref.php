<?php
	header("Content-Type: application/json");
	if (!isset($_GET["type"])) {
		die('{"title": "Facebook array"}');
	}
?>
{
	"title": "User array",
	"type": "object",
	"properties": {
		"data": {
			"title": "Array data",
			"type": "array",
			"items": {"$ref": <?php echo json_encode($_GET["type"].".json#/definitions/reference"); ?>}
		},
		"paging": {
			"title": "Paging",
			"type": "object",
			"properties": {
				"previous": {"type": "string"},
				"next": {"type": "string"}
			},
			"links": [
				{"rel": "previous", "href": "{+previous}", "targetSchema": {"$ref": "#"}},
				{"rel": "next", "href": "{+next}", "targetSchema": {"$ref": "#"}}
			]
		}
	},
	"required": ["data"],
	"allOf": [{"$ref": "array.php"}]
}
