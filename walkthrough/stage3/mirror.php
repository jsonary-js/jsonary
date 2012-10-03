<?php

if (isset($_SERVER['CONTENT_TYPE'])) {
	$contentType = $_SERVER['CONTENT_TYPE'];
} else {
	$contentType = $_SERVER['HTTP_CONTENT_TYPE'];
}

die(json_encode(array(
	"Query" => $_SERVER['QUERY_STRING'],
	"Content-Type" => $contentType,
	"POST data" => file_get_contents("php://input"),
)));

?>
