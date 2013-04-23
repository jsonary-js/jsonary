<?php

include "php/json-utils.php";

$pathInfo = $_SERVER['PATH_INFO'];
$pathInfo = str_replace(".", "_", $pathInfo);
$filename = "site{$pathInfo}.json";
$jsonData = json_decode(file_get_contents($filename));

if (substr($filename, 0, strlen("site/pages/")) == "site/pages") {
	json_exit($jsonData, "/~geraint/jsonary/site/schemas/site.json");
} else {
	json_exit($jsonData, "/~geraint/jsonary/site/schemas/page.json");
}

?>