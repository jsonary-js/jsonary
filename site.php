<?php

include "php/common.php";
include INCLUDE_ROOT.'json-utils.php';

$pathInfo = $_SERVER['PATH_INFO'];
$pathInfo = str_replace(".", "_", $pathInfo);
$filename = "site{$pathInfo}.json";
$jsonData = json_decode(file_get_contents($filename));

if (substr($filename, 0, strlen("site/pages/")) == "site/pages") {
	json_exit($jsonData, SITE_ROOT."site/schemas/site.json");
} else {
	header("Link: <#>;rel=\"edit\"");
	json_exit($jsonData, SITE_ROOT."site/schemas/page.json");
}

?>