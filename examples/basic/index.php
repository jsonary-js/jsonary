<?php

include "../../php/json-utils.php";

$data = array(
	"stringProperty" => "Some example data",
	"integerProperty" => 5
);

json_exit($data, "schema.json");

?>