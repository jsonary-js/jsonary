(function (Jsonary) {

	function TableRenderer (config) {
		if (!(this instanceof TableRenderer)) {
			return new TableRenderer(config);
		}
		var thisRenderer = this;
		
		config = config || {};
		this.config = config;
		
		for (var key in TableRenderer.defaults) {
			if (!config[key]) {
				if (typeof TableRenderer.defaults[key] == "function") {
					config[key] = TableRenderer.defaults[key];
				} else {
					config[key] = JSON.parse(JSON.stringify(TableRenderer.defaults[key]));
				}
			}
		}
		
		for (var i = 0; i < config.columns.length; i++) {
			var columnPath = config.columns[i];
			config.cellRenderHtml[key] = config.cellRenderHtml[key] || config.defaultCellRenderHtml;
			config.titleHtml[key] = config.titleHtml[key] || config.defaultTitleHtml;
		}
		
		config.rowRenderHtml = this.wrapRowFunction(config, config.rowRenderHtml);
		for (var key in config.cellRenderHtml) {
			config.cellRenderHtml[key] = this.wrapCellFunction(config, config.cellRenderHtml[key], key);
		}
		for (var key in config.titleHtml) {
			config.titleHtml[key] = this.wrapTitleFunction(config, config.titleHtml[key], key);
		}

		if (config.filter) {
			this.filter = function (data, schemas) {
				return config.filter(data, schemas);
			};
		}
		
		this.addColumn = function (key, title, renderHtml) {
			config.columns.push(key);
			if (typeof title == 'function') {
				config.titleHtml[key] = thisRenderer.wrapTitleFunction(config, title, key);
			} else {
				if (title != undefined) {
					config.titles[key] = title;
				}
				config.titleHtml[key] = thisRenderer.wrapTitleFunction(config, config.defaultTitleHtml, key);
			}
			renderHtml = renderHtml || config.defaultCellRenderHtml;
			config.cellRenderHtml[key] = thisRenderer.wrapCellFunction(config, renderHtml, key);
			return this;
		}
		
		this.component = config.component;
	};
	TableRenderer.prototype = {
		wrapRowFunction: function (functionThis, original) {
			var thisRenderer = this;
			return function (rowData, context) {
				var rowContext = thisRenderer.rowContext(rowData, context);
				return original.call(functionThis, rowData, rowContext);
			};
		},
		wrapTitleFunction: function (functionThis, original, columnKey) {
			var thisRenderer = this;
			return function (cellData, context) {
//				var titleContext = context.subContext('title' + columnKey);
//				titleContext.columnPath = titleContext;
				var titleContext = context;
				return original.call(functionThis, cellData, titleContext, columnKey);
			}
		},
		wrapCellFunction: function (functionThis, original, columnKey) {
			var thisRenderer = this;
			return function (cellData, context) {
				var cellContext = thisRenderer.cellContext(cellData, context, columnKey);
				return original.call(functionThis, cellData, cellContext);
			}
		},
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
			var newArgs = [context.data];
			while (newArgs.length <= arguments.length) {
				newArgs.push(arguments[newArgs.length - 1]);
			}
			return this.config.action.apply(this.config, newArgs);
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
			return this.config.tableRenderHtml(data, context);
		},
		rowRenderHtml: function (data, context) {
			var config = this.config;
			return config.rowRenderHtml(data, context);
		},
		enhance: function (element, data, context) {
			if (this.config.enhance) {
				return this.config.enhance(element, data, context);
			} else if (this.config.render) {
				return this.config.render(element, data, context);
			}
		},
		register: function(filterFunction) {
			if (filterFunction) {
				this.filter = filterFunction;
			}
			return Jsonary.render.register(this);
		}
	};
	TableRenderer.defaults = {
		columns: [],
		titles: {},
		titleHtml: {},
		defaultTitleHtml:  function (data, context, columnPath) {
			return '<th>' + Jsonary.escapeHtml(this.titles[columnPath] != undefined ? this.titles[columnPath] : columnPath) + '</th>';
		},
		cellRenderHtml: {},
		defaultCellRenderHtml: function (cellData, context, columnPath) {
			return '<td>' + context.renderHtml(cellData) + '</td>';
		},
		cellAction: {},
		rowRenderHtml: function (rowData, context) {
			var result = "<tr>";
			for (var i = 0; i < this.columns.length; i++) {
				var columnPath = this.columns[i];
				var cellData = (columnPath == "" || columnPath.charAt(0) == "/") ? rowData.subPath(columnPath) : rowData;
				var cellRenderHtml = this.cellRenderHtml[columnPath];
				result += this.cellRenderHtml[columnPath](cellData, context);
			}
			result += '</tr>';
			return result;
		},
		rowAction: function (data, context, actionName) {
			throw new Error("Unknown row action: " + actionName);
		},
		tableRenderHtml: function (data, context) {
			var result = '';
			result += '<table class="json-array-table">';
			result += this.tableHeadRenderHtml(data, context);
			result += this.tableBodyRenderHtml(data, context);
			result += '</table>';
			return result;
		},
		tableHeadRenderHtml: function (data, context) {
			var result = '<thead><tr>';
			for (var i = 0; i < this.columns.length; i++) {
				var columnPath = this.columns[i];
				result += this.titleHtml[columnPath](data, context);
			}
			return result + '</tr></thead>';
		},
		rowOrder: function (data, context) {
			var result = [];
			var length = data.length;
			while (result.length < length) {
				result[result.length] = result.length;
			}
			return result;
		},
		tableBodyRenderHtml: function (data, context) {
			var config = this.config;
			var result = '<tbody>';
			
			var rowOrder = this.rowOrder(data, context);
			for (var i = 0; i < rowOrder.length; i++) {
				var rowData = data.item(currentPage[i]);
				result += this.rowRenderHtml(rowData, context);
			}
			
			if (!data.readOnly()) {
				if (data.schemas().maxItems() == null || data.schemas().maxItems() > data.length()) {
					result += '<tr><td colspan="' + this.columns.length + '" class="json-array-table-add">';
					result += context.actionHtml('+ add', 'add');
					result += '</td></tr>';
				}
			}
			return result + '</tbody>';
		},
		action: function (data, context, actionName) {
			if (actionName == "add") {
				var index = data.length();
				var schemas = data.schemas().indexSchemas(index);
				schemas.createValue(function (value) {
					data.push(value);
				});
				return false;
			}
		}
	};
	
	/** Fancy tables with sorting and links **/
	function FancyTableRenderer(config) {
		if (!(this instanceof FancyTableRenderer)) {
			return new FancyTableRenderer(config);
		}
		config = config || {};

		for (var key in FancyTableRenderer.defaults) {
			if (!config[key]) {
				if (typeof FancyTableRenderer.defaults[key] == "function") {
					config[key] = FancyTableRenderer.defaults[key];
				} else {
					config[key] = JSON.parse(JSON.stringify(FancyTableRenderer.defaults[key]));
				}
			}
		}
		
		for (var key in config.sort) {
			if (typeof config.sort[key] !== 'function') {
				config.sort[key] = config.defaultSort;
			}
		}

		TableRenderer.call(this, config);
		
		var prevAddColumn = this.addColumn;
		this.addColumn = function (key, title, renderHtml, sorting) {
			if (sorting) {
				config.sort[key] = (typeof sorting == 'function') ? sorting : config.defaultSort;
			}
			return prevAddColumn.call(this, key, title, renderHtml);
		};
	}
	FancyTableRenderer.prototype = Object.create(TableRenderer.prototype);
	FancyTableRenderer.prototype.addLinkColumn = function (linkRel, title, linkHtml, activeHtml, isConfirm) {
		if (typeof linkRel == "string") {
			var columnName = "link$" + linkRel;
			
			this.addColumn(columnName, title, function (data, context) {
				if (!context.data.readOnly()) {
					return '<td></td>';
				}
				var result = '<td>';
				if (!context.parent.uiState.linkRel) {
					var link = data.links(linkRel)[0];
					if (link) {
						result += context.parent.actionHtml(linkHtml, 'link', linkRel);
					}
				} else if (activeHtml) {
					var activeLink = data.links(context.parent.uiState.linkRel)[context.parent.uiState.linkIndex || 0];
					if (activeLink.rel == linkRel) {
						if (isConfirm) {
							result += context.parent.actionHtml(activeHtml, 'link-confirm', context.parent.uiState.linkRel, context.parent.uiState.linkIndex);
						} else {
							result += context.parent.actionHtml(activeHtml, 'link-cancel');
						}
					}
				}
				return result + '</td>';
			});
		} else {
			var linkDefinition = linkRel;
			linkRel = linkDefinition.rel();
			var columnName = "link$" + linkRel + "$" + linkHtml;
			this.addColumn(columnName, title, function (data, context) {
				var result = '<td>';
				if (!context.parent.uiState.linkRel) {
					var links = data.links(linkRel);
					for (var i = 0; i < links.length; i++) {
						var link = links[i];
						if (link.definition = linkDefinition) {
							result += context.parent.actionHtml(linkHtml, 'link', linkRel, i);
						}
					}
				} else if (activeHtml) {
					var activeLink = data.links(context.parent.uiState.linkRel)[context.parent.uiState.linkIndex || 0];
					if (activeLink.definition == linkDefinition) {
						if (isConfirm) {
							result += context.parent.actionHtml(activeHtml, 'link-confirm', context.parent.uiState.linkRel, context.parent.uiState.linkIndex);
						} else {
							result += context.parent.actionHtml(activeHtml, 'link-cancel');
						}
					}
				}
				return result + '</td>';
			});
		}
		return this;
	};

	FancyTableRenderer.defaults = {
		sort: {},
		defaultSort: function (a, b) {
			if (a == null) {
				return (b == null) ? 0 : -1;
			} else if (b == null || a > b) {
				return 1;
			} else if (a < b) {
				return -1;
			}
			return 0;
		},
		rowOrder: function (data, context) {
			var thisConfig = this;
			var sortFunctions = [];
			context.uiState.sort = context.uiState.sort || [];
			
			function addSortFunction(sortIndex, sortKey) {
				var direction = sortKey.split('/')[0];
				var path = sortKey.substring(direction.length);
				var multiplier = (direction == "desc") ? -1 : 1;
				sortFunctions.push(function (a, b) {
					var valueA = a.get(path);
					var valueB = b.get(path);
					var comparison = thisConfig.sort[path] ? thisConfig.sort[path](valueA, valueB) : thisConfig.defaultSort(valueA, valueB);
					return multiplier*comparison;
				});
			}
			for (var i = 0; i < context.uiState.sort.length; i++) {
				addSortFunction(i, context.uiState.sort[i]);
			}
			var indices = [];
			var length = data.length();
			while (indices.length < length) {
				indices[indices.length] = indices.length;
			}
			var maxSortIndex = -1;
			indices.sort(function (a, b) {
				for (var i = 0; i < sortFunctions.length; i++) {
					var comparison = sortFunctions[i](data.item(a), data.item(b));
					if (comparison != 0) {
						maxSortIndex = Math.max(maxSortIndex, i);
						return comparison;
					}
				}
				maxSortIndex = sortFunctions.length;
				return a - b;
			});
			// Trim sort conditions list, for smaller UI state
			context.uiState.sort = context.uiState.sort.slice(0, maxSortIndex + 1);
			return indices;
		},
		rowsPerPage: null,
		pages: function (rowOrder) {
			if (this.rowsPerPage == null) {
				return [rowOrder];
			}
			var pages = [];
			while (rowOrder.length) {
				pages.push(rowOrder.splice(0, this.rowsPerPage));
			}
			return pages;
		},
		tableHeadRenderHtml: function (data, context) {
			var result = '<thead>';
			var rowOrder = this.rowOrder(data, context);
			var pages = this.pages(rowOrder);
			if (pages.length > 1) {
				var page = context.uiState.page || 0;
				result += '<tr><th colspan="' + this.columns.length + '" class="json-array-table-pages">';
				if (page > 0) {
					result += context.actionHtml('<span class="button">&lt;&lt;</span>', 'page', 0);
					result += context.actionHtml('<span class="button">&lt;</span>', 'page', page - 1);
				} else {
					result += '<span class="button disabled">&lt;&lt;</span>';
					result += '<span class="button disabled">&lt;</span>';
				}
				result += 'page <select name="' + context.inputNameForAction('page') + '">';
				for (var i = 0; i < pages.length; i++) {
					if (i == page) {
						result += '<option value="' + i + '" selected>' + i + '</option>';
					} else {
						result += '<option value="' + i + '">' + i + '</option>';
					}
				}
				result += '</select>';
				if (page < pages.length - 1) {
					result += context.actionHtml('<span class="button">&gt;</span>', 'page', page + 1);
					result += context.actionHtml('<span class="button">&gt;&gt;</span>', 'page', pages.length - 1);
				} else {
					result += '<span class="button disabled">&gt;</span>';
					result += '<span class="button disabled">&gt;&gt;</span>';
				}
				result += '</tr>';
			}
			result += '<tr>';
			for (var i = 0; i < this.columns.length; i++) {
				var columnKey = this.columns[i];
				result += this.titleHtml[columnKey](data, context);
			}
			result += '</tr>';
			return result + '</thead>';
		},
		tableBodyRenderHtml: function (data, context) {
			var config = this.config;
			var result = '<tbody>';
			var rowOrder = this.rowOrder(data, context);

			var pages = this.pages(rowOrder);
			var page = context.uiState.page || 0;
			var pageRows = pages[page];
			if (!pageRows) {
				pageRows = pages[0] || [];
				context.uiState.page = 0;
			}
			for (var i = 0; i < pageRows.length; i++) {
				var rowData = data.item(pageRows[i]);
				result += this.rowRenderHtml(rowData, context);
			}
			if (page == pages.length - 1 && !data.readOnly()) {
				if (data.schemas().maxItems() == null || data.schemas().maxItems() > data.length()) {
					result += '<tr><td colspan="' + this.columns.length + '" class="json-array-table-add">';
					result += context.actionHtml('+ add', 'add');
					result += '</td></tr>';
				}
			}
			return result + '</tbody>';
		},
		action: function (data, context, actionName, arg1) {
			if (actionName == "sort") {
				delete context.uiState.page;
				var columnKey = arg1;
				context.uiState.sort = context.uiState.sort || [];
				if (context.uiState.sort[0] == "asc" + columnKey) {
					context.uiState.sort[0] = "desc" + arg1;
				} else {
					if (context.uiState.sort.indexOf("desc" + columnKey) != -1) {
						context.uiState.sort.splice(context.uiState.sort.indexOf("desc" + columnKey), 1);
					} else if (context.uiState.sort.indexOf("asc" + columnKey) != -1) {
						context.uiState.sort.splice(context.uiState.sort.indexOf("asc" + columnKey), 1);
					}
					context.uiState.sort.unshift("asc" + arg1);
				}
				return true;
			} else if (actionName == "page") {
				context.uiState.page = parseInt(arg1);
				return true;
			}
			return TableRenderer.defaults.action.apply(this, arguments);
		},
		defaultTitleHtml: function (data, context, columnKey) {
			if (data.readOnly() && columnKey.charAt(0) == "/" && this.sort[columnKey]) {
				var result = '<th>';
				context.uiState.sort = context.uiState.sort || [];
				result += context.actionHtml(Jsonary.escapeHtml(this.titles[columnKey]), 'sort', columnKey);
				if (context.uiState.sort[0] == "asc" + columnKey) {
					result += ' <span class="json-array-table-sort-asc">up</span>'
				} else if (context.uiState.sort[0] == "desc" + columnKey) {
					result += ' <span class="json-array-table-sort-desc">down</span>'
				}
				return result + '</th>'
			}
			return TableRenderer.defaults.defaultTitleHtml.call(this, data, context, columnKey);
		},
		rowRenderHtml: function (data, context) {
			var result = '';
			if (context.uiState.expand) {
				result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
				result += '<td class="json-array-table-full" colspan="' + this.columns.length + '">';
				if (context.uiState.expand === true) {
					result += context.renderHtml(data);
				} else {
					result += context.renderHtml(context.uiState.expand);
				}
				result += '</td>';
			} else if (context.uiState.linkRel) {
				var link = data.links(context.uiState.linkRel)[context.uiState.linkIndex || 0];
				if (context.uiState.linkData) {
					if (link.rel == "edit" && link.submissionSchemas.length == 0) {
						result += TableRenderer.defaults.rowRenderHtml.call(this, context.uiState.linkData, context);
					} else {
						result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
						result += '<td class="json-array-table-full" colspan="' + this.columns.length + '">';
						result += '<div class="json-array-table-full-title">' + Jsonary.escapeHtml(link.title || link.rel) + '</div>';
						result += '<div class="json-array-table-full-buttons">';
						result += context.actionHtml('<span class="button action">confirm</span>', 'link-confirm', context.uiState.linkRel, context.uiState.linkIndex);
						result += context.actionHtml(' <span class="button action">cancel</span>', 'link-cancel');
						result += '</div>';
						result += context.renderHtml(context.uiState.linkData);
						result += '</td>';
					}
				} else {
					result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
					result += '<td class="json-array-table-full" colspan="' + this.columns.length + '">';
					result += '<div class="json-array-table-full-title">' + Jsonary.escapeHtml(link.title || link.rel) + '</div>';
						result += '<div class="json-array-table-full-buttons">';
					result += context.actionHtml('<span class="button action">confirm</span>', 'link-confirm', context.uiState.linkRel, context.uiState.linkIndex);
					result += context.actionHtml(' <span class="button action">cancel</span>', 'link-cancel');
						result += '</div>';
					result += '</td>';
				}
			} else {
				result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
			}
			return result;
		},
		rowAction: function (data, context, actionName, arg1, arg2) {
			if (actionName == "expand") {
				if (context.uiState.expand) {
					delete context.uiState.expand;
				} else {
					context.uiState.expand = true;
				}
				return true;
			} else if (actionName == "link") {
				var linkRel = arg1, linkIndex = arg2
				var link = data.links(linkRel)[linkIndex || 0];
				if (link.submissionSchemas.length) {
					context.uiState.linkRel = linkRel;
					context.uiState.linkIndex = linkIndex;
					var linkData = Jsonary.create();
					linkData.addSchema(link.submissionSchemas);
					context.uiState.linkData = linkData;
					link.submissionSchemas.createValue(function (value) {
						linkData.setValue(value);
					});
					delete context.uiState.expand;
				} else if (link.rel == "edit") {
					context.uiState.linkRel = linkRel;
					context.uiState.linkIndex = linkIndex;
					context.uiState.linkData = data.editableCopy();
					delete context.uiState.expand;
				} else if (link.method != "GET") {
					context.uiState.linkRel = linkRel;
					context.uiState.linkIndex = linkIndex;
					delete context.uiState.linkData;
					delete context.uiState.expand;
				} else {
					var targetExpand = (link.rel == "self") ? true : link.href;
					if (context.uiState.expand == targetExpand) {
						delete context.uiState.expand;
					} else {
						context.uiState.expand = targetExpand;
					}
				}
				return true;
			} else if (actionName == "link-confirm") {
				var linkRel = arg1, linkIndex = arg2
				var link = data.links(linkRel)[linkIndex || 0];
				if (link) {
					link.follow(context.uiState.linkData, this.linkHandler);
				}
				delete context.uiState.linkRel;
				delete context.uiState.linkIndex;
				delete context.uiState.linkData;
				delete context.uiState.expand;
				return true;
			} else if (actionName == "link-cancel") {
				delete context.uiState.linkRel;
				delete context.uiState.linkIndex;
				delete context.uiState.linkData;
				delete context.uiState.expand;
				return true;
			}
			return TableRenderer.defaults.rowAction.apply(this, arguments);
		},
		linkHandler: function () {}
	};
	
	Jsonary.plugins = Jsonary.plugins || {};
	Jsonary.plugins.TableRenderer = TableRenderer;
	Jsonary.plugins.FancyTableRenderer = FancyTableRenderer;
})(Jsonary);