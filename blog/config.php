<?php
	session_start();

	define('POST_DIR', "posts/");
	define('COMMENT_DIR', "comments/");
	define('POSTS_PER_PAGE', 5);
	define('ADMINISTRATOR_FLAG', 'demo_blog_administrator');
	
	$isAdministrator = isset($_SESSION[ADMINISTRATOR_FLAG]) && $_SESSION[ADMINISTRATOR_FLAG];
?>
