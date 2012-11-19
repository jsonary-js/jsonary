Jsonary.TableRenderer = function () {
	var columns = [];
	
	this.addColumn = function (key, title) {
		columns.push({key: key, title: title});
	};
	
	this.renderHtml = function (data, context, uiState) {
		var html = '<table>';
		html += '<thead><tr>';
		var columnCount = columns.length;
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			html += '<th>' + column.title + '</th>';
		}
		html += '</tr></thead>';
		html += '<tbody>';
		data.indices(function (index, subData) {
			html += '<tr>';
			for (var i = 0; i < columns.length; i++) {
				var column = columns[i];
				html += '<td>' + context.renderHtml(subData.property(column.key)) + '</td>';
			}
			html += '</tr>';
		});
		html += '</tbody>';
		if (!data.readOnly()) {
			html += '<tfoot><tr><td colspan=' + columnCount + '>';
			html += this.actionHtml("add", data, "+ add", context);
			html += '</td></tr></tfoot>';
		}
		html += '</table>';
		return html;
	};
	
	this.action = function (actionName, data) {
		if (actionName == "add") {
			var index = data.length();
			data.schemas().createValueForIndex(index, function (newValue) {
				data.index(index).setValue(newValue);
			});
		} else {
			alert("Unknown action: " + actionName);
		}
	};
};
