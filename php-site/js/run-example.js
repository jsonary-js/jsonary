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
		var varNames = [];
		var varValues = [];
		if (typeof targetVar == "object") {
			for (var key in targetVar) {
				varNames.push(key);
				varValues.push(targetVar[key]);
			}
		} else {
			var targetElement;
			if (!targetElementId) {
				targetElement = document.createElement('div');
				targetElement.className = 'example-target';
				if (codeElement.nextSibling) {
					codeElement.parentNode.insertBefore(targetElement, codeElement.nextSibling);
				} else {
					codeElement.parentNode.appendChild(targetElement);
				}
			} else {
				targetElement = document.getElementById(targetElementId);
			}
			varNames.push(targetVar || 'targetElement');
			varValues.push(targetElement);
		}
		var compiledFunc = new Function(varNames, code);

		compiledFunc.apply(null, varValues);
	}
	
	global.runExample = runExample;
})(this);