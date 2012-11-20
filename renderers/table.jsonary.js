Jsonary.TableRenderer = function () {
	this.columns = [];
	this.style = {
		tableClass: "",
		addClass: "",
		addHtml: "+ add",
		removeClass: "",
		removeHtml: "X"
	};
	
};
Jsonary.TableRenderer.prototype = {
	renderHtml: function (data, context, uiState) {
		var columns = this.columns;
		var thisRenderer = this;
		var html = '<table class="' + this.style.tableClass + '">';
		html += '<thead><tr>';
		if (!data.readOnly()) {
			html += '<th></th>';
		}
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			html += '<th>' + column.title + '</th>';
		}
		html += '</tr></thead>';
		html += '<tbody>';
		data.indices(function (index, subData) {
			html += '<tr>';
			if (!data.readOnly()) {
				html += '<td class="' + thisRenderer.style.removeClass + '">' + thisRenderer.actionHtml("remove", subData, thisRenderer.style.removeHtml, context) + '</td>';
			}
			for (var i = 0; i < columns.length; i++) {
				var column = columns[i];
				html += '<td>' + context.renderHtml(subData.property(column.key)) + '</td>';
			}
			html += '</tr>';
		});
		html += '</tbody>';
		if (!data.readOnly()) {
			html += '<tfoot><tr><td class="' + this.style.addClass + '" colspan=' + (columns.length + 1) + '>';
			html += this.actionHtml("add", data, this.style.addHtml, context);

		html += '</td></tr></tfoot>';
		}
		html += '</table>';
		return html;
	},
	action: function (actionName, data) {
		if (actionName == "add") {
			var index = data.length();
			data.schemas().createValueForIndex(index, function (newValue) {
				data.index(index).setValue(newValue);
			});
		} else if (actionName == "remove") {
			data.remove();
		} else {
			alert("Unknown action: " + actionName);
		}
	},
	addColumn: function (key, title) {
		this.columns.push({key: key, title: title});
	},
	update: function (element, data, context, operation) {
		if (operation.depthFrom(data.pointerPath()) <= 2) {
			this.render(element, data, context);
		}
	},
};
