<?php
	require_once('config.php');
	
	$postId = $_GET['postId'];
	$postId = str_replace("/", "_", $postId);
	
	$postData = json_decode(file_get_contents(POST_DIR.$postId.".json"));
	$postData->postId = $postId;
	
	$commentDir = COMMENT_DIR.$postId."/";
	if (!file_exists($commentDir)) {
		mkdir($commentDir, 0777, TRUE);
	}
	
	if ($_SERVER['REQUEST_METHOD'] == "POST") {
		$submittedData = json_decode(file_get_contents("php://input"));
		if ($submittedData != null) {
			$author = $submittedData->author;
			$message = $submittedData->message;
			if (!is_string($author) || !is_string($message) || strlen($author) > 25 || strlen($message) > 200 || strlen($author) == 0 || strlen($message) == 0) {
				die('{"error": "Invalid parameters"}');
			} else {
				$newComment = array(
					"author" => $author,
					"message" => $message,
					"date" => date(DATE_ISO8601)
				);
				$safeAuthor = rawurlencode(substr($author, 0, 10));
				$newCommentFilename = $commentDir.$newComment['date'].$safeAuthor.".json";
				if (!file_put_contents($newCommentFilename, json_encode($newComment))) {
					die('{"error": "Error saving comment"}');
				}
			}
		}
	}

	$comments = array();
	$commentFilenames = scandir($commentDir);
	sort($commentFilenames);
	foreach ($commentFilenames as $filename) {
		if ($filename[0] == "." || is_dir($filename)) {
			continue;
		}
		$commentData = json_decode(file_get_contents($commentDir.$filename));
		$comments[] = $commentData;
	}
	$postData->comments = $comments;

	header("Content-Type: application/json; profile=schemas/post.json");
	echo (json_encode($postData));
?>
