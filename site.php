<?php

session_start();

include "php/common.php";
include INCLUDE_ROOT.'json-utils.php';

$pathInfo = $_SERVER['PATH_INFO'];
$pathInfo = str_replace(".", "_", $pathInfo);
$method = $_SERVER['REQUEST_METHOD'];
$filename = "site{$pathInfo}.json";

if ($method == "PUT" && $_SESSION[ADMINISTRATOR_FLAG]) {
	$newData = json_decode(file_get_contents("php://input"));
	if ($newData != NULL) {
		file_put_contents($filename, json_encode($newData));
	}
}

$jsonData = json_decode(file_get_contents($filename));

if (substr($filename, 0, strlen("site/pages/")) == "site/pages") {
	json_exit($jsonData, SITE_ROOT."site/schemas/site.json");
} else {
	if ($_SESSION[ADMINISTRATOR_FLAG]) {
		header("Link: <#>;rel=\"edit\"");
	}
	json_exit($jsonData, SITE_ROOT."site/schemas/page.json");
}

?>