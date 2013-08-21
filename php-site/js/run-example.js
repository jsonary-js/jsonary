(function (global) {
	function getText(node) {
		if (node.nodeType == '3') {
			return node.nodeValue;
		} else if (node.childNodes) {
			var result = '';
			for (var i = 0; i < node.childNodes.length; i++) {
				result += getText(node.childNodes[i]);
			}
			return result;
		}
		return '';
	}

	function runExample(elementId, targetVar, targetElementId) {
		var codeElement = document.getElementById(elementId);
		var code = getText(codeElement);
		var compiledFunc = new Function(targetVar || 'targetElement', code);

		if (!targetElementId) {
			var targetElement = document.createElement('div');
			targetElement.className = 'example-target';
			if (codeElement.nextSibling) {
				codeElement.parentNode.insertBefore(targetElement, codeElement.nextSibling);
			} else {
				codeElement.parentNode.appendChild(targetElement);
			}
		} else {
			targetElement = document.getElementById(targetElementId);
		}
		compiledFunc(targetElement);
	}
	
	global.runExample = runExample;
})(this);