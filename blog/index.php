<?php
	require_once('config.php');
	
	if ($_SERVER['REQUEST_METHOD'] == "POST" && $isAdministrator) {
		$postData = json_decode(file_get_contents("php://input"));
		if ($postData != null) {
			$newPostData = array(
				"author" => $postData->author,
				"title" => $postData->title,
				"content" => $postData->content,
				"date" => date(DATE_ISO8601)
			);
			$safeAuthor = rawurlencode(substr($newPostData['author'], 0, 10));
			$newPostFilename = POST_DIR.$newPostData['date'].$safeAuthor.".json";
			if (!file_put_contents($newPostFilename, json_encode($newPostData))) {
				die('{"error": "Error saving post"}');
			}
		}
	}

	$page = 0;
	if (isset($_GET['page'])) {
		$page = (int)$_GET['page'];
		if ($page < 0) {
			$page = 0;
		}
	}
	
	$jsonData = array(
		"title" => "The Jsonary Blog",
		"page" => $page
	);
	if ($page > 0) {
		$jsonData['prev'] = "?page=".($page - 1);
	}
	
	$posts = array();
	$filenames = scandir(POST_DIR);
	sort($filenames);
	$filenames = array_reverse($filenames);

	$remainingToSkip = POSTS_PER_PAGE*$page;
	$remainingToShow = POSTS_PER_PAGE;
	foreach ($filenames as $filename) {
		if ($filename[0] == "." || is_dir($filename)) {
			continue;
		}
		if ($remainingToSkip-- > 0) {
			continue;
		}
		if ($remainingToShow-- <= 0) {
			break;
		}
		$postData = json_decode(file_get_contents(POST_DIR.$filename));
		$posts[] = array(
			"postId" => substr($filename, 0, strlen($filename) - 5),
			"title" => $postData->title,
			"author" => $postData->author,
			"date" => $postData->date
		);
	}
	$jsonData['posts'] = $posts;
	
	if (count($posts) == POSTS_PER_PAGE) {
		$jsonData["next"] = "?page=".($page + 1);
	}
	
	if ($isAdministrator) {
		header("Content-Type: application/json; profile=schemas/index-administrator.json");
	} else {
		header("Content-Type: application/json; profile=schemas/index.json");
	}
	echo (json_encode($jsonData));
?>
