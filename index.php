<?php

	include "php/markdown/markdown.php";

	$siteFile = "site/site.json";

	$pageId = isset($_GET['page']) ? $_GET['page'] : 'index';
	$pageId = str_replace(".", "_", $pageId);
	$pageFile = "site/pages/{$pageId}.json";
	$pageUrl = "site.php/pages/{$pageId}";
	
	$siteData = json_decode(file_get_contents($siteFile));
	$pageData = json_decode(file_get_contents($pageFile));
	
	function renderItem($item, $blockLevel=0, $indent="") {
		if (is_string($item)) {
			return renderMarkdown($item, $indent, $blockLevel == 0);
		}
		if (isset($item->title)) {
			return renderBlock($item, $blockLevel, $indent);
		}
		if (isset($item->keyValue)) {
			return renderKeyValue($item, $blockLevel, $indent);
		}
		if (isset($item->gist)) {
			return renderGist($item, $blockLevel, $indent);
		}
		if (isset($item->demoId)) {
			return renderDemo($item, $blockLevel, $indent);
		}
	}
	
	function renderMarkdown($markdown, $indent, $stripSingleParagraph=TRUE) {
		$html = trim(Markdown($markdown));
		if ($stripSingleParagraph && substr_count($html, "<p>") == 1 && substr_count($html, "</p>") == 1) {
			$html = str_replace("<p>", "", str_replace("</p>", "", $html));
		}
		echo $indent.str_replace("\n", $indent, $html);
	}
	
	function renderBlock($block, $blockLevel=0, $indent="\n\t\t\t\t") {
		$needsClose = TRUE;
		$innerIndent = $indent."\t";
		if ($blockLevel === "info") {
			echo $indent.'<div class="info-block">';
		} else if ($blockLevel == 0) {
			echo $indent.'<div class="content-block">';
		} else {
			echo $indent;
			$needsClose = FALSE;
			$innerIndent = $indent;
		}
		if (isset($block->title)) {
			$hlevel = "h".($blockLevel + 3);
			echo $innerIndent."<$hlevel>".htmlentities($block->title)."</$hlevel>";
		}
		foreach ($block->content as $item) {
			renderItem($item, $blockLevel + 1, $innerIndent);
		}
		if ($needsClose) {
			echo $indent.'</div>';
		}
	}
	
	function renderKeyValue($item, $blockLevel=0, $indent="") {
		echo $indent."<table class=\"key-value\">";
		foreach ($item->keyValue as $row) {
			echo $indent."<tr>"
				.$indent."	<td class=\"key\">".htmlentities($row->key)."</td>"
				.$indent."	<td class=\"value\">";
			renderItem($row->value, 0, $indent."\t\t");
			echo $indent."	</td>"
				.$indent."</tr>";
		}
		echo $indent."</table>";
	}
	
	function renderGist($item, $blockLevel=0, $indent="") {
		echo $indent."<script src=\"https://gist.github.com/".htmlentities($item->gist).".js\"></script>";
	}
	
	function renderDemo($item, $blockLevel=0, $indent="") {
		if ($item->demoId) {
			$elementId = $item->demoId."-".rand();
			$item->javascript = str_replace($item->demoId, $elementId, $item->javascript);
			echo $indent."<div id=\"".htmlentities($elementId)."\" class=\"example\">"
			.(isset($item->initialText) ? htmlentities($item->initialText) : "")
			."</div>";
		}
		echo $indent.'<script src="js/onload.js">';
		$code = $item->javascript;
		$indented = $indent."\t".str_replace("\n", $indent."\t", $code);
		echo $indented;
		echo $indent.'</script>';
	}
?>
<html>
	<head>
		<title><?php echo htmlentities($siteData->title); ?> - <?php echo htmlentities($pageData->title); ?></title>
		<script src="js/css3-mediaqueries.js"></script>
		<link rel="stylesheet" href="css/main/main.css" />
		<meta name="viewport" content="width=480,initial-scale=1">

		<script src="jsonary.js"></script>
		<script src="renderers/plain.jsonary.js"></script>
		<script src="renderers/list-links.js"></script>
		<!--<script src="renderers/list-schemas.js"></script>-->
		<link rel="stylesheet"  href="renderers/plain.jsonary.css"></link>
		<link rel="stylesheet"  href="renderers/common.css"></link>

		<script src="plugins/jsonary.undo.js"></script>
		<script src="plugins/jsonary.jstpl.js"></script>
		<script>
			var SITE_ROOT = "";
		</script>
	</head>
	<body>
		<div id="top-fade"></div>
		<div id="page">
			<div id="header">
				<a href=".">
					<h1 id="page-title">
						<span id="logo-container">&nbsp;<img id="logo" src="Jsonary-glow.png"></span>
						<?php echo htmlentities($siteData->title); ?>
					</h1>
				</a>
				<div id="get-started-block"><?php
						renderItem($siteData->tagLine, "\n\t\t\t\t\t");
					?>

				</div>
			</div>
		
			<div id="info">
				<div class="navigation">
					<h3>Navigation</h3>
					<ul><?php
						foreach ($siteData->pages as $page) {
							if ($page->id == $pageId) {
								echo "\n\t\t\t\t\t\t<li class=\"current\">".htmlentities($page->title)."</li>";
							} else {
								echo "\n\t\t\t\t\t\t<li><a href=\"?page=".htmlentities($page->id)."\">".htmlentities($page->title)."</a></li>";
							}
						}
					?>
					
					</ul>
				</div>
				<?php
					foreach ($siteData->blocks as $block) {
						renderBlock($block, "info");
					}
				?>
			</div>
			
			<div id="content">
				<h2><?php echo htmlentities($pageData->title); ?></h2>
				<?php
					foreach ($pageData->blocks as $block) {	
						renderBlock($block);
					}
				?>
			</div>
		</div>
		
		<script src="js/jstpl.js"></script>
		<script src="site/renderers/markdown.js"></script>
		<script src="site/renderers/site.js"></script>
		<script>
			var pageUrl = <?php echo json_encode($pageUrl); ?>;
			Jsonary.render(document.getElementById("content"), pageUrl, {page: pageUrl});
		</script>
	</body>
</html>