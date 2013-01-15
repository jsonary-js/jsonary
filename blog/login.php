<?php
	require_once('config.php');
	require_once('password.php');

	if ($_SERVER['REQUEST_METHOD'] == "POST") {
		$jsonData = json_decode(file_get_contents("php://input"));
		if ($jsonData == PASSWORD) {
			$_SESSION[ADMINISTRATOR_FLAG] = TRUE;
			header("Content-Type: application/json; profile=?schema");
			die('{"home": "./", "logout": "?logout"}');
		}
	}
	
	if (isset($_GET["logout"])) {
		$_SESSION[ADMINISTRATOR_FLAG] = FALSE;
	}
	
	if (isset($_GET['schema'])) {
?>
{
	"title": "Login page",
	"links": [
		{"rel": "login", "href": "{+login}", "method": "POST", "schema":{"type": "string"}},
		{"rel": "logout", "href": "{+logout}"},
		{"rel": "home", "href": "{+home}"}
	]
}
<?php } else {
		if ($isAdministrator) {
			header("Content-Type: application/json; profile=?schema");
			die('{"home": "./", "logout": "?logout"}');
		}
		header("Content-Type: application/json; profile=?schema");
 ?>
{
	"login": "?login"
}
<?php } ?>
