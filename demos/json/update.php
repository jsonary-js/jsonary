<?php
	if (isset($_GET["schema"])) {
		header("Content-Type: application/json; profile=http://json-schema.org/hyper-schema");
?>

{
	"default": <?php
		if (file_exists("data.json")) {
			readfile("data.json");
		} else {
			echo '{}';
		}
	 ?>,
	 "extends": {
	 	"$ref": "view.php?schema"
	 }
}
	
<?php
	} else {
		$postData = file_get_contents("php://input");
		if ($postData != "") {
			$jsonData = json_decode($postData);
			if ($jsonData != NULL) {
				file_put_contents("data.json", json_encode($jsonData));
			}
			header("Location: view.php");
		} else {
			echo json_encode("Invalid data supplied");
		}
	}
?>

