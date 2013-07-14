(function (Jsonary) {
	
	function TableRenderer (config) {
		var thisRenderer = this;
		this.config = config;
		
		config.columns = config.columns || [""];
		config.titles = config.titles || {};
		config.titleHtml = config.titleHtml || {};
		config.defaultTitleHtml = config.defaultTitleHtml || function (data, context, columnPath) {
			var title = columnPath;
			if (columnPath == "" || columnPath.charAt(0) == "/") {
				var schemas = data.schemas().indexSchemas(0).getFull(); // Assume first row is representative
				var parts = Jsonary.splitPointer(columnPath);
				while (parts.length) {
					schemas = schemas.propertySchemas(parts.shift()).getFull();
				}
				var title = schemas.title() || title;
			}
			return '<th>' + Jsonary.escapeHtml(title) + '</th>';
		};
		config.cellRenderHtml = config.cellRenderHtml || {};
		config.defaultCellRenderHtml = config.defaultCellRenderHtml || function (cellData, context) {
			return '<td>' + context.renderHtml(cellData) + '</td>';
		};
		config.defaultRenderHtml = function (data, context) {
			return thisRenderer.tableRenderHtml(data, context);
		}
		config.defaultRowRenderHtml = function (rowData, context) {
			var result = "<tr>";
			for (var i = 0; i < config.columns.length; i++) {
				var columnPath = config.columns[i];
				var cellData = (columnPath == "" || columnPath.charAt(0) == "/") ? rowData.subPath(columnPath) : rowData;
				var cellRenderHtml = config.cellRenderHtml[columnPath] || config.defaultCellRenderHtml;
				result += cellRenderHtml(cellData, thisRenderer.cellContext(cellData, context, columnPath));
			}
			result += '</tr>';
			return result;
		};

		config.classes = config.classes || {};
		config.classes.table = config.classes.table || "json-array-table";
		
		this.component = config.component;
	};
	TableRenderer.prototype = {
		action: function (context, actionName) {
			if (context.cellData) {
				var columnPath = context.columnPath;
				var cellAction = this.config.cellAction[columnPath];
				var newArgs = [context.cellData];
				while (newArgs.length <= arguments.length) {
					newArgs.push(arguments[newArgs.length - 1]);
				}
				return cellAction.apply(this.config, newArgs);
			} else if (context.rowData) {
				var rowAction = this.config.rowAction;
				var newArgs = [context.rowData];
				while (newArgs.length <= arguments.length) {
					newArgs.push(arguments[newArgs.length - 1]);
				}
				return rowAction.apply(this.config, newArgs);
			}
			return this.config.action.apply(this.config, arguments);
		},
		filter: function (data, schemas) {
			return this.config.filter(data, schemas);
		},
		rowContext: function (data, context) {
			var subContext = context.subContext(data);
			subContext.rowData = data;
			return subContext;
		},
		cellContext: function (data, context, columnPath) {
			var subContext = context.subContext('col' + columnPath);
			subContext.columnPath = columnPath;
			subContext.cellData = data;
			return subContext;
		},
		renderHtml: function (data, context) {
			var config = this.config;
			if (config.renderHtml) {
				return config.renderHtml(data, context);
			} else {
				return config.defaultRenderHtml(data, context);
			}
		},
		rowRenderHtml: function (data, context) {
			var config = this.config;
			if (config.rowRenderHtml) {
				return config.rowRenderHtml(data, context);
			} else {
				return config.defaultRowRenderHtml(data, context);
			}
		},
		tableRenderHtml: function (data, context) {
			var thisRenderer = this;
			var config = this.config;
			var result = '';
			result += '<table class="' + config.classes.table + '">';
			result += '<thead><tr>';
			for (var i = 0; i < config.columns.length; i++) {
				var columnPath = config.columns[i];
				var titleHtml = config.titleHtml[columnPath];
				if (!titleHtml) {
					if (config.titles[columnPath] != undefined) {
						titleHtml = '<th>' + Jsonary.escapeHtml(config.titles[columnPath]) + '</th>';
					} else {
						titleHtml = config.defaultTitleHtml;
					}
				}
				if (typeof titleHtml == 'function') {
					var titleContext = context.subContext('title' + columnPath);
					titleContext.columnPath = titleContext;
					titleHtml = titleHtml.call(config, data, titleContext, columnPath);
				}
				result += titleHtml;
			}
			result += '</tr></thead>';
			result += '<tbody>'
			data.items(function (index, rowData) {
				var rowContext = thisRenderer.rowContext(rowData, context);
				result += thisRenderer.rowRenderHtml(rowData, rowContext);
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