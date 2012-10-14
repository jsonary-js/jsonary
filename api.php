<?php

	$source = $_SERVER['PATH_INFO'];
	if ($source == "") {
		$source = $_SERVER['ORIG_PATH_INFO'];
	}
	if ($source == "/api-schema.json") {
		header("Content-Type: application/json; profile=http://json-schema.org/hyper-schema");
		readfile("api/api-schema.json");
		exit();
	}
	if ($source == "/") {
		$source = "jsonary.json";
	}
	$source = str_replace("..", "_", $source);
	$source = "api/".$source;
	
	if ($_SERVER['REQUEST_METHOD'] == "PUT") {
		$jsonData = file_get_contents("php://input");
		file_put_contents($source, $jsonData);
	}
	
	header("Content-Type: application/json; profile=api-schema.json");
	
	if (file_exists($source)) {
		readfile($source);
	} else {
		die("{}");
	}
?>
