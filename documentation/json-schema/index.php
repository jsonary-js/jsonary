<?php
	$exampleCounter = 0;
	$mainHtml = '';
	$navHtml = "";
	$currentDir = "";
	if (isset($_GET["section"])) {
		$currentDir = $_GET["section"];
	}
	function walkDir($directory, $list=NULL) {
		global $currentDir;
		global $navHtml, $mainHtml, $exampleCounter;
		if ($list == NULL) {
			$list = scandir($directory);
		}
		$navHtml .= '<ul>';
		foreach ($list as $filename) {
			if ($filename[0] == ".") {
				continue;
			}
			$origFilename = $filename;
			$filename = $directory."/".$filename;
			if (is_dir($filename)) {
				if (substr($currentDir, 0, strlen($filename)) == $filename) {
					$navHtml .= "<li>$origFilename:";
					$mainHtml .= "<h2>$origFilename</h2>";
					walkDir($filename);
				} else {
					$navHtml .= "<li><a href=\"?section={$filename}\">$origFilename</a>";
				}
				continue;
			}
			$jsonObj = json_decode(file_get_contents($filename));
			$filename = substr($filename, 0, strlen($filename) - 5);
			$navHtml .= '<li><a href="#'.$filename.'">'.$jsonObj->title.'</a>';
			
			$mainHtml .= "<a name=\"$filename\"></a><div class=\"box\"><h3>{$jsonObj->title}</h3>";
			$mainHtml .= "<div class=\"section\"><div class=\"description\">{$jsonObj->description}</div>";
			foreach ($jsonObj->content as $paragraph) {
				if (is_array($paragraph)) {
					$mainHtml .= "<ul>";
					foreach ($paragraph as $bullet) {
						$mainHtml .= "<li>$bullet";
					}
					$mainHtml .= "</ul>";
				} else {
					$mainHtml .= "<p>$paragraph";
				}
			}
			if (isset($jsonObj->exampleSchema)) {
				$exampleNumber = $exampleCounter++;
				
				$mainHtml .= "<pre class=\"example code\" id=\"example-schema{$exampleNumber}\"></pre>";
				$mainHtml .= "<div class=\"example\" id=\"example{$exampleNumber}\"></div>";
				$mainHtml .= "<script>\n";
				$mainHtml .= "var schema = Jsonary.createSchema(".json_encode($jsonObj->exampleSchema).");\n";
				if (isset($jsonObj->exampleData)) {
					$mainHtml .= "var data = Jsonary.create(".json_encode($jsonObj->exampleData).");\n";
				} else {
					$mainHtml .= "var data = Jsonary.create(schema.asList().createValue());\n";
				}
				$mainHtml .= "data.addSchema(schema).renderTo(document.getElementById('example{$exampleNumber}'));\n";
				$mainHtml .= "document.getElementById('example-schema{$exampleNumber}').appendChild(document.createTextNode(JSON.stringify(".json_encode($jsonObj->exampleSchema).", null, 4)));\n";
				$mainHtml .= "</script>";
			}
			$mainHtml .= "</div></div>";
		}
		$navHtml .= "</ul>";
		$mainHtml .= "";
	}
	walkDir("keywords", array(
		"General keywords",
		"Meta-data",
		"Referencing",
		"Object validation",
		"Array validation",
		"Numeric validation",
		"String validation"
	));
?>
<html>
  <head>
		<title>JSON Schema</title>
		<link rel="stylesheet" href="../../css/main.css">
		<link rel="stylesheet" href="../../renderers/basic.jsonary.css">
		<meta name="viewport" content="width=960">
	</head>
	<body>
		<script src="http://ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js"></script>
		<script src="../../jsonary.js"></script>
		<script src="../../renderers/basic.jsonary.js"></script>
		<script src="../../plugins/jsonary.undo.js"></script>
		<div align="center">
			<div id="content">
				<h1>JSON Schema</h1>
				<div class="tagline">&nbsp;</div>

				<div id="nav">
					back to
					<a class="nav-link" href="../../">main page</a>
					<?php if ($currentDir != "") { ?>
						> <a href="?">JSON Schema documentation</a>
					<?php } ?>
					<?php echo $navHtml; ?>
				</div>
				
				<?php if ($currentDir == "") { ?>
					<h2>Introduction to JSON Schemas</h2>
					<div class="section">
						<p>A JSON Schema is always an object.  "Keywords" are properties of this object which have special meaning.
						<p>This page documents the <U>validation</U> keywords defined for JSON Schemas.  The keywords have been grouped into sections, and most keywords have an interactive example.
						<p>This page is currently incomplete.
						<!--<p>If you want to try out writing some schemas of your own, then try <a href="../../demos/index-input.html">this page</a>, which allows you to edit a schema and a data item.-->
					</div>
				<?php } ?>

				<?php echo $mainHtml; ?>
			</div>
		</div>
	</body>
</html>
