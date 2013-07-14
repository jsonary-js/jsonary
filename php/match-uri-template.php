function matchUriTemplate($template, $pathInfo=NULL, $stripQuery=TRUE) {
	$params = array();
	if ($pathInfo == NULL) {
		$pathInfo = $_SERVER['PATH_INFO'];
	}
	if ($stripQuery) {
		$pos = strpos($pathInfo, "?");
		if ($pos !== FALSE) {
			$pathInfo = substr($pathInfo, 0, $pos);
		}
	}
	
	while (true) {
		$pos = strpos($template, "{");
		if ($pos === FALSE) {
			if ($pathInfo == $template) {
				return $params;
			} else {
				return FALSE;
			}
		}
		$extractA = substr($pathInfo, 0, $pos);
		$extractB = substr($template, 0, $pos);
		if ($extractA != $extractB) {
			return FALSE;
		}
		
		// Extract the variable name
		$template = substr($template, $pos + 1);
		$pathInfo = substr($pathInfo, $pos);

		$endPos = strpos($template, "}");
		$varName = substr($template, 0, $endPos);
		$template = substr($template, $endPos + 1);

		// Find the next section
		$nextPos = strpos($template, "{");
		$nextExtract = ($nextPos === FALSE) ? $template : substr($template, 0, $nextPos);
		
		if ($nextExtract == "") {
			$params[$varName] = $pathInfo;
			return $params;
		}
		
		$endOfValuePos = strpos($pathInfo, $nextExtract);
		if ($endOfValuePos === FALSE) {
			return FALSE;
		}
		$value = substr($pathInfo, 0, $endOfValuePos);
		$params[$varName] = $value;
		
		$pathInfo = substr($pathInfo, $endOfValuePos);
	}
}