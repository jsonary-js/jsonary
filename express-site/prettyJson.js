module.exports = prettyJson;

function prettyJson(data, indent) {
	var indent = indent || '\t';
	if (Array.isArray(data)) {
		if (data.length === 0) {
			return '[]';
		} else if (data.length === 1) {
			return '[' + prettyJson(data[0], indent) + ']';
		} else {
			var singleLine = true;
			var parts = [];
			for (var i = 0; i < data.length; i++) {
				var subJson = prettyJson(data[i], indent);
				parts[i] = subJson;
				if (subJson.indexOf('\n') !== -1) {
					singleLine = false;
				}
			}
			if (singleLine && parts.length <= 5) {
				return '[' + parts.join(', ') + ']';
			} else {
				var result = '[';
				for (var i = 0; i < parts.length; i++) {
					if (i > 0) {
						result += ',';
					}
					result += '\n' + indent + parts[i].replace(/\n/g, '\n' + indent);
				}
				return result + '\n]';
			}
		}
	} else if (data && typeof data === 'object') {
		var keys = Object.keys(data);
		if (keys.length === 0) {
			return '{}';
		}
		if (keys.length > 10) {
			keys.sort();
		}
		if (keys.length === 1) {
			var part = prettyJson(data[keys[0]], indent);
			if (part.indexOf('\n') === -1) {
				return '{' + JSON.stringify(keys[0]) + ": " + part + '}';
			} else {
				return '{\n' + indent + JSON.stringify(keys[0]) + ": " + part.replace(/\n/g, '\n' + indent); + '\n}';
			}
		} else {
			var result = "{";
			for (var i = 0; i < keys.length; i++) {
				if (i > 0) {
					result += ',';
				}
				result += '\n' + indent + JSON.stringify(keys[i]);
				result += ': ' + prettyJson(data[keys[i]], indent).replace(/\n/g, '\n' + indent);
			}
			return result + '\n}';
		}
	}
	return JSON.stringify(data, null, '\t');
};