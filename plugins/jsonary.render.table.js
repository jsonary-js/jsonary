(function (Jsonary) {
	
	function TableRenderer (config) {
		var thisRenderer = this;
		this.config = config;
		
		config.columns = config.columns || [""];
		config.titles = config.titles || {};
		config.titleHtml = config.titleHtml || {};
		config.cellRenderHtml = config.cellRenderHtml || {};
		config.defaultCellRenderHtml = config.defaultCellRenderHtml || function (cellData, context) {
			return '<td>' + context.renderHtml(cellData) + '</td>';
		};
		config.tableRenderHtml = function (data, context) {
			return thisRenderer.tableRenderHtml(data, context);
		}

		config.classes = config.classes || {};
		config.classes.table = config.classes.table || "json-array-table";
		
		this.component = config.component;
	};
	TableRenderer.prototype = {
		action: function (context, actionName) {
			var columnPath = context.columnPath;
			if (columnPath == undefined) {
				return this.config.action.apply(this.config, arguments);
			}
			var cellAction = this.config.cellAction[columnPath];
			var newArgs = [context.cellData];
			while (newArgs.length <= arguments.length) {
				newArgs.push(arguments[newArgs.length - 1]);
			}
			var result = cellAction.apply(this.config, newArgs);
			return result;
		},
		filter: function (data, schemas) {
			return this.config.filter(data, schemas);
		},
		cellContext: function (data, context, columnPath) {
			var subContext = context.subContext(data);
			subContext.columnPath = columnPath;
			subContext.cellData = data;
			return subContext;
		},
		renderHtml: function (data, context) {
			var config = this.config;
			result = "";
			if (config.renderHtml) {
				return config.renderHtml(data, context);
			}
			return this.tableRenderHtml(data, context);
		},
		tableRenderHtml: function (data, context) {
			var thisRenderer = this;
			var config = this.config;
			var result = '';
			result += '<table class="' + config.classes.table + '">';
			result += '<thead><tr>';
			for (var i = 0; i < config.columns.length; i++) {
				var columnPath = config.columns[i];
				var titleHtml = config.titleHtml[columnPath] || Jsonary.escapeHtml(config.titles[columnPath] || columnPath);
				if (typeof titleHtml == 'function') {
					var titleContext = context.subContext('title' + columnPath);
					titleHtml = titleHtml.call(config, data, titleContext);
				} else {
					titleHtml = '<th>' + titleHtml + '</th>';
				}
				result += titleHtml;
			}
			result += '</tr></thead>';
			result += '<tbody>'
			data.items(function (index, rowData) {
				result += '<tr>';
				for (var i = 0; i < config.columns.length; i++) {
					var columnPath = config.columns[i];
					var cellData = (columnPath == "" || columnPath.charAt(0) == "/") ? rowData.subPath(columnPath) : rowData;
					var cellRenderHtml = config.cellRenderHtml[columnPath] || config.defaultCellRenderHtml;
					result += cellRenderHtml(cellData, thisRenderer.cellContext(cellData, context, columnPath));
				}
				result += '</tr>';
			});
			result += '</tbody>';
			result += '</table>';
			return result;
		},
		enhance: function (element, data, context) {
			if (this.config.enhance) {
				return this.config.enhance(element, data, context);
			} else if (this.config.render) {
				return this.config.render(element, data, context);
			}
		}
	};
	
	TableRenderer.register = function (obj) {
		var renderer = new TableRenderer(obj);
		Jsonary.render.register(renderer);
	};
	
	Jsonary.plugins = Jsonary.plugins || {};
	Jsonary.plugins.TableRenderer = TableRenderer;
})(Jsonary);