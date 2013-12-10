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
				var titleContext = context;
				return original.call(functionThis, cellData, titleContext, columnKey);
			}
		},
		wrapCellFunction: function (functionThis, original, columnKey) {
			var thisRenderer = this;
			return function (cellData, context) {
				var cellContext = thisRenderer.cellContext(cellData, context, columnKey);
				return original.call(functionThis, cellData, cellContext, columnKey);
			}
		},
		action: function (context, actionName) {
			var thisRenderer = this;
			if (context.label.substring(0, 3) == "col" && !context.get('cellData')) {
				// Recover cellData when running server-side
				var columnPath = context.label.substring(3);
				var rowContext = context.parent;
				var tableContext = rowContext.parent;
				context.data.items(function (index, rowData) {
					if (thisRenderer.rowContext(rowData, tableContext).uniqueId == rowContext.uniqueId) {
						var cellData = (columnPath == "" || columnPath.charAt(0) == "/") ? rowData.subPath(columnPath) : rowData;
						thisRenderer.cellContext(cellData, rowContext, columnPath); // Sets cellData on the appropriate context
					}
				});
			} else if (context.label.substring(0, 3) == "row" && !context.get('rowData')) {
				// Recover rowData when running server-side
				var tableContext = context.parent;
				context.data.items(function (index, rowData) {
					thisRenderer.rowContext(rowData, tableContext); // Sets rowData on the appropriate context
				});
			}
			if (context.get('cellData')) {
				var columnPath = context.get('columnPath');

				var cellAction = this.config.cellAction[columnPath];
				var newArgs = [context.get('cellData')];
				while (newArgs.length <= arguments.length) {
					newArgs.push(arguments[newArgs.length - 1]);
				}
				return cellAction.apply(this.config, newArgs);
			} else if (context.get('rowData')) {
				var rowAction = this.config.rowAction;
				var newArgs = [context.get('rowData')];
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
			var rowLabel = "row" + context.labelForData(data);
			var subContext = context.subContext(rowLabel);
			subContext.set('rowData', data);
			return subContext;
		},
		cellContext: function (data, context, columnPath) {
			var subContext = context.subContext('col' + columnPath);
			subContext.set('columnPath', columnPath);
			subContext.set('cellData', data);
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
		update: function (element, data, context, operation) {
			if (this.config.update) {
				this.config.defaultUpdate = this.config.defaultUpdate || this.defaultUpdate;
				return this.config.update.apply(this, arguments);
			}
			return this.defaultUpdate.apply(this, arguments);
		},
		linkHandler: function () {
			if (this.config.linkHandler) {
				return this.config.linkHandler.apply(this.config, arguments);
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
			return '<td data-column="' + Jsonary.escapeHtml(columnPath) + '">' + context.renderHtml(cellData, columnPath) + '</td>';
		},
		cellAction: {},
		rowRenderHtml: function (rowData, context) {
			var result = "<tr>";
			for (var i = 0; i < this.columns.length; i++) {
				var columnPath = this.columns[i];
				var cellData = (columnPath == "" || columnPath.charAt(0) == "/") ? rowData.subPath(columnPath) : rowData;
				var cellRenderHtml = this.cellRenderHtml[columnPath];
				result += this.cellRenderHtml[columnPath](cellData, context, columnPath);
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
				var rowData = data.item(rowOrder[i]);
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
		this.name = config.name || "FancyTableRenderer";

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
		
		if (typeof config.rowsPerPage !== 'function') {
			if (config.serverSide && config.serverSide.rowsPerPage) {
				config.rowsPerPage = function () {
					var value = this.serverSide.rowsPerPage.apply(this, arguments);
					if (!value) {
						return [];
					}
					return Array.isArray(value) ? value : [value];
				};
			} else {
				var rowsPerPageStaticValue = config.rowsPerPage || [];
				if (!Array.isArray(rowsPerPageStaticValue)) {
					rowsPerPageStaticValue = [rowsPerPageStaticValue];
				}
				config.rowsPerPage = function () {
					return rowsPerPageStaticValue.slice(0);
				};
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
		
		// Delete column for editable items
		this.addConditionalColumn(function (data) {
			return !data.readOnly() && data.length() > data.schemas().minItems();
		}, "remove", "", function (data, context) {
			var result = '<td class="json-array-table-remove">';
			
			// Check whether a delete is appropriate
			var arrayData = data.parent();
			var tupleTypingLength = arrayData.schemas().tupleTypingLength();
			var minItems = arrayData.schemas().minItems();
			var index = parseInt(data.parentKey());
			if ((index >= tupleTypingLength || index == arrayData.length() - 1)
				&& arrayData.length() > minItems) {
				result += context.actionHtml('<span class="json-array-delete">X</span>', 'remove');
			}
			return result + '</td>';
		});
		config.cellAction.remove = function (data, context, actionName) {
			if (actionName == "remove") {
				data.remove();
				return false;
			}
		};

		// Move column for editable items
		this.addConditionalColumn(function (data) {
			return !data.readOnly() && data.length() > (data.schemas().tupleTypingLength() + 1);
		}, "move", function (data, tableContext) {
			if (tableContext.uiState.moveRow != undefined) {
				return '<th style="padding: 0; text-align: center">'
					+ tableContext.actionHtml('<div class="json-array-move-cancel" style="float: left">cancel</div>', 'move-cancel')
					+ '</th>';
			}
			return '<th></th>';
		}, function (data, context) {
			var result = '<td class="json-array-table-move">';
			var tableContext = context.parent.parent;
			
			// Check whether a move is appropriate
			var arrayData = data.parent();
			var tupleTypingLength = arrayData.schemas().tupleTypingLength();
			var index = parseInt(data.parentKey());
			if (index >= tupleTypingLength) {
				if (tableContext.uiState.moveRow == undefined) {
					result += tableContext.actionHtml('<div class="json-array-move json-array-move-start">move</div>', 'move-start', index);
				} else if (tableContext.uiState.moveRow == index) {
					result += tableContext.actionHtml('<div class="json-array-move json-array-move-cancel">cancel</div>', 'move-cancel');
				} else if (tableContext.uiState.moveRow > index) {
					result += tableContext.actionHtml('<div class="json-array-move json-array-move-select json-array-move-up">to here</div>', 'move', tableContext.uiState.moveRow, index);
				} else {
					result += tableContext.actionHtml('<div class="json-array-move json-array-move-select json-array-move-down">to here</div>', 'move', tableContext.uiState.moveRow, index);
				}
			}
			return result + '</td>';
		});
	}
	FancyTableRenderer.prototype = Object.create(TableRenderer.prototype);
	FancyTableRenderer.prototype.addConditionalColumn = function (condition, key, title, renderHtml) {
		var titleAsFunction = (typeof title == 'function') ? title : function (data, context) {
			return '<th>' + Jsonary.escapeHtml(title) + '</th>';
		};
		if (!renderHtml) {
			renderHtml = function (data, context) {
				return this.defaultCellRenderHtml(data, context);
			};
		}
		var titleFunction = function (data, context) {
			if (!condition.call(this, data, context)) {
				return '<th style="display: none"></th>';
			} else {
				return titleAsFunction.call(this, data, context);
			}
		};
		var renderFunction = function (data, cellContext) {
			var tableContext = cellContext.parent.parent;
			if (!condition.call(this, tableContext.data, tableContext)) {
				return '<td style="display: none"></td>';
			} else {
				return renderHtml.call(this, data, cellContext, key);
			}
		};
		this.addColumn(key, titleFunction, renderFunction);
	};
	FancyTableRenderer.prototype.addLinkColumn = function (path, linkRel, title, linkHtml, activeHtml, confirmHtml) {
		var subPath = ((typeof path == "string") && path.charAt(0) == "/") ? path : "";
		if (typeof linkRel == "string") {
			var columnName = "link" + path + "$" + linkRel;
			
			this.addColumn(columnName, title, function (data, context) {
				if (!context.data.readOnly()) {
					return '<td></td>';
				}
				var result = '<td>';
				if (!context.parent.uiState.linkRel) {
					var link = data.subPath(subPath).links(linkRel)[0];
					if (link && data.readOnly()) {
						var html = (typeof linkHtml == 'function') ? linkHtml.call(this, data, context, link) : linkHtml;
						result += context.parent.actionHtml(html, 'link', linkRel, 0, subPath || undefined);
					}
				} else if (activeHtml) {
					var activeLink = data.subPath(subPath).links(context.parent.uiState.linkRel)[context.parent.uiState.linkIndex || 0];
					if (activeLink && activeLink.rel == linkRel) {
						if (typeof confirmHtml == 'string') {
							var html = (typeof confirmHtml == 'function') ? confirmHtml.call(this, data, context, activeLink) : confirmHtml;
							result += context.parent.actionHtml(confirmHtml, 'link-confirm', context.parent.uiState.linkRel, context.parent.uiState.linkIndex, subPath || undefined);
							if (activeHtml) {
								var html = (typeof activeHtml == 'function') ? activeHtml.call(this, data, context, activeLink) : activeHtml;
								result += context.parent.actionHtml(html, 'link-cancel');
							}
						} else if (confirmHtml) {
							var html = (typeof activeHtml == 'function') ? activeHtml.call(this, data, context, activeLink) : activeHtml;
							result += context.parent.actionHtml(html, 'link-confirm', context.parent.uiState.linkRel, context.parent.uiState.linkIndex, subPath || undefined);
						} else if (activeHtml) {
							var html = (typeof activeHtml == 'function') ? activeHtml.call(this, data, context, activeLink) : activeHtml;
							result += context.parent.actionHtml(html, 'link-cancel');
						}
					}
				}
				return result + '</td>';
			});
		} else {
			var linkDefinition = linkRel;
			linkRel = linkDefinition.rel();
			var columnName = "link" + path + "$" + linkRel + "$";
			this.addColumn(columnName, title, function (data, context) {
				var result = '<td>';
				if (!context.parent.uiState.linkRel) {
					var links = data.subPath(subPath).links(linkRel);
					for (var i = 0; i < links.length; i++) {
						var link = links[i];
						if (link.definition = linkDefinition) {
							var html = (typeof linkHtml == 'function') ? linkHtml.call(this, data, context, link) : linkHtml;
							result += context.parent.actionHtml(html, 'link', linkRel, 0, subPath || undefined);
						}
					}
				} else if (activeHtml) {
					var activeLink = data.subPath(subPath).links(context.parent.uiState.linkRel)[context.parent.uiState.linkIndex || 0];
					if (activeLink.definition == linkDefinition) {
						if (typeof confirmHtml == 'string') {
							var html = (typeof confirmHtml == 'function') ? confirmHtml.call(this, data, context, activeLink) : confirmHtml;
							result += context.parent.actionHtml(confirmHtml, 'link-confirm', context.parent.uiState.linkRel, context.parent.uiState.linkIndex, subPath || undefined);
							if (activeHtml) {
								var html = (typeof activeHtml == 'function') ? activeHtml.call(this, data, context, activeLink) : activeHtml;
								result += context.parent.actionHtml(html, 'link-cancel');
							}
						} else if (confirmHtml) {
							var html = (typeof confirmHtml == 'function') ? confirmHtml.call(this, data, context, activeLink) : confirmHtml;
							result += context.parent.actionHtml(html, 'link-confirm', context.parent.uiState.linkRel, context.parent.uiState.linkIndex, subPath || undefined);
						} else if (activeHtml) {
							var html = (typeof activeHtml == 'function') ? activeHtml.call(this, data, context, activeLink) : activeHtml;
							result += context.parent.actionHtml(html, 'link-cancel');
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
		// TODO: "natural" sort
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
		serverSide: {},
		rowOrder: function (data, context) {
			var thisConfig = this;
			
			if (thisConfig.serverSide && thisConfig.serverSide.currentSort) {
				var sortResult = thisConfig.serverSide.currentSort.call(this, data, context);
				if (Array.isArray(sortResult)) {
					context.uiState.sort = sortResult;
				} else if (typeof sortResult === 'string') {
					context.uiState.sort = [sortResult];
				}
				var result = [];
				var length = data.length();
				while (result.length < length) {
					result.push(result.length);
				}
				return result;
			}
			
			var sortFunctions = [];
			context.uiState.sort = context.uiState.sort || [];
			
			function addSortFunction(sortIndex, sortKey) {
				var direction = sortKey.split('/')[0];
				var path = sortKey.substring(direction.length);
				var multiplier = (direction == "desc") ? -1 : 1;
				sortFunctions.push(function (a, b) {
					var valueA = a.get(path);
					var valueB = b.get(path);
					var comparison = (typeof thisConfig.sort[path] == 'function') ? thisConfig.sort[path](valueA, valueB) : thisConfig.defaultSort(valueA, valueB);
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
		pages: function (rowOrder, data, context) {
			if (this.serverSide && this.serverSide.currentPage && this.serverSide.totalPages) {
				var current = this.serverSide.currentPage.call(this, data, context) || 1;
				var total = this.serverSide.totalPages.call(this, data, context);
				if (typeof total !== 'undefined') {
					context.uiState.page = current;
					var result = [];
					for (var i = 1; !(i > total); i++) {
						if (i === current) {
							result.push(rowOrder);
						} else {
							result.push([]);
						}
					}
					return result;
				}
			}

			var rowsPerPage = context.uiState.rowsPerPage || this.rowsPerPage(data, context)[0];
			if (!rowsPerPage) {
				return [rowOrder];
			}
			var pages = [];
			while (rowOrder.length) {
				pages.push(rowOrder.splice(0, rowsPerPage));
			}
			return pages;
		},
		tableHeadRenderHtml: function (data, context) {
			var result = '<thead>';
			var rowOrder = this.rowOrder(data, context);
			var pages = this.pages(rowOrder, data, context);

			var rowsPerPageOptions = this.rowsPerPage(data, context);
			if (pages.length > 1 || rowsPerPageOptions.length > 1) {
				var page = context.uiState.page || 1;
				result += '<tr><th colspan="' + this.columns.length + '" class="json-array-table-pages">';
				// Left arrows
				if (page > 1) {
					result += context.actionHtml('<span class="button">&lt;&lt;</span>', 'page', 1);
					result += context.actionHtml('<span class="button">&lt;</span>', 'page', page - 1);
				} else {
					result += '<span class="button disabled">&lt;&lt;</span>';
					result += '<span class="button disabled">&lt;</span>';
				}
				
				// Page selector
				result += 'page <select name="' + context.inputNameForAction('page') + '">';
				for (var i = 1; i <= pages.length; i++) {
					if (i == page) {
						result += '<option value="' + i + '" selected>' + i + '</option>';
					} else {
						result += '<option value="' + i + '">' + i + '</option>';
					}
				}
				result += '</select>/' + pages.length;

				// Rows-per-page selector
				if (rowsPerPageOptions.length > 1) {
					context.uiState.rowsPerPage = context.uiState.rowsPerPage || rowsPerPageOptions[0];
					result += ', <select name="' + context.inputNameForAction('rowsPerPage') + '">';
					rowsPerPageOptions.sort(function (a, b) {return a - b});
					for (var i = 0; i < rowsPerPageOptions.length; i++) {
						if (rowsPerPageOptions[i] === rowsPerPageOptions[i - 1]) {
							continue;
						}
						var iHtml = Jsonary.escapeHtml(rowsPerPageOptions[i]);
						var selected = (rowsPerPageOptions[i] == context.uiState.rowsPerPage) ? ' selected' : '';
						result += '<option value="' + iHtml + '"' + selected + '>' + iHtml + '</option>';
					}
					result += '</select> per page';
				}

				// Right arrows
				if (page < pages.length) {
					result += context.actionHtml('<span class="button">&gt;</span>', 'page', page + 1);
					result += context.actionHtml('<span class="button">&gt;&gt;</span>', 'page', pages.length);
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
			var result = '<tbody>';
			var rowOrder = this.rowOrder(data, context);

			var pages = this.pages(rowOrder, data, context);
			if (!pages.length) {
				pages = [[]];
			}
			var page = context.uiState.page || 1;
			var pageRows = pages[page - 1];
			if (!pageRows) {
				pageRows = pages[0] || [];
				context.uiState.page = 0;
			}
			for (var i = 0; i < pageRows.length; i++) {
				var rowData = data.item(pageRows[i]);
				result += this.rowRenderHtml(rowData, context);
			}
			if (page == pages.length && !data.readOnly()) {
				if (data.schemas().maxItems() == null || data.schemas().maxItems() > data.length()) {
					result += '<tr><td colspan="' + this.columns.length + '" class="json-array-table-add">';
					result += context.actionHtml('+ add', 'add');
					result += '</td></tr>';
				}
			}
			return result + '</tbody>';
		},
		action: function (data, context, actionName, arg1, arg2) {
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
				if (this.serverSide && this.serverSide.action) {
					return this.serverSide.action.apply(this, arguments);
				}
				return true;
			} else if (actionName == "page") {
				context.uiState.page = parseInt(arg1, 10);
				if (this.serverSide && this.serverSide.action) {
					return this.serverSide.action.apply(this, arguments);
				}
				return true;
			} else if (actionName == "rowsPerPage") {
				var oldRowsPerPage = context.uiState.rowsPerPage;
				var newRowsPerPage = parseInt(arg1, 10);
				if (oldRowsPerPage) {
					context.uiState.page = Math.round(((context.uiState.page || 1) - 1)*oldRowsPerPage/newRowsPerPage) + 1;
				}
				context.uiState.rowsPerPage = newRowsPerPage;
				if (this.serverSide && this.serverSide.action) {
					return this.serverSide.action.apply(this, arguments);
				}
				return true;
			} else if (actionName == "move-select") {
				var index = arg1;
				context.uiState.moveRow = index;
				return true;
			} else if (actionName == "move-cancel") {
				delete context.uiState.moveRow;
				return true;
			} else if (actionName == "move") {
				var fromIndex = arg1;
				var toIndex = arg2;
				delete context.uiState.moveRow;
				data.item(fromIndex).moveTo(data.item(toIndex));
				return false;
			}
			return TableRenderer.defaults.action.apply(this, arguments);
		},
		defaultTitleHtml: function (data, context, columnKey) {
			if (data.readOnly()) {
				var result = '<th>';
				context.uiState.sort = context.uiState.sort || [];
				var titleHtml = Jsonary.escapeHtml(this.titles[columnKey] != undefined ? this.titles[columnKey] : columnKey);
				if (context.uiState.sort[0] == "asc" + columnKey) {
					result += '<div class="json-array-table-sort-asc">';
					result += context.actionHtml(titleHtml, 'sort', columnKey);
					result += '<span class="json-array-table-sort-text">up</span>';
					result += '</div>';
				} else if (context.uiState.sort[0] == "desc" + columnKey) {
					result += '<div class="json-array-table-sort-desc">';
					result += context.actionHtml(titleHtml, 'sort', columnKey);
					result += '<span class="json-array-table-sort-text">down</span>';
					result += '</div>';
				} else if (columnKey.charAt(0) == "/" && this.sort[columnKey]) {
					result += '<div class="json-array-table-sort">';
					result += context.actionHtml(titleHtml, 'sort', columnKey);
					result += '</div>';
				} else {
					return TableRenderer.defaults.defaultTitleHtml.call(this, data, context, columnKey);
				}
				return result + '</th>'
			}
			return TableRenderer.defaults.defaultTitleHtml.call(this, data, context, columnKey);
		},
		rowExpandRenderHtml: function (data, context, expand) {
			result = '<td class="json-array-table-full" colspan="' + this.columns.length + '">';
			if (expand === true) {
				result += context.renderHtml(data, 'expand');
			} else {
				result += context.renderHtml(expand, 'expand');
			}
			return result + '</td>';
		},
		rowRenderHtml: function (data, context) {
			var result = '';
			if (context.uiState.expand) {
				result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
				result += this.rowExpandRenderHtml(data, context, context.uiState.expand);
			} else if (context.uiState.linkRel) {
				var link = data.subPath(context.uiState.linkPath || '').links(context.uiState.linkRel)[context.uiState.linkIndex || 0];
				if (context.uiState.linkData) {
					if (link.rel == "edit" && link.submissionSchemas.length == 0) {
						result += TableRenderer.defaults.rowRenderHtml.call(this, context.uiState.linkData, context);
					} else {
						result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
						result += '<td class="json-array-table-full" colspan="' + this.columns.length + '">';
						result += '<div class="json-array-table-full-title">' + Jsonary.escapeHtml(link.title || link.rel) + '</div>';
						result += '<div class="json-array-table-full-buttons">';
						result += context.actionHtml('<span class="button action">confirm</span>', 'link-confirm', context.uiState.linkRel, context.uiState.linkIndex, context.uiState.linkPath);
						result += context.actionHtml(' <span class="button action">cancel</span>', 'link-cancel');
						result += '</div>';
						result += context.renderHtml(context.uiState.linkData, 'linkData');
						result += '</td>';
					}
				} else {
					result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
					result += '<td class="json-array-table-full" colspan="' + this.columns.length + '">';
					result += '<div class="json-array-table-full-title">' + Jsonary.escapeHtml(link.title || link.rel) + '</div>';
						result += '<div class="json-array-table-full-buttons">';
					result += context.actionHtml('<span class="button action">confirm</span>', 'link-confirm', context.uiState.linkRel, context.uiState.linkIndex, context.uiState.linkPath);
					result += context.actionHtml(' <span class="button action">cancel</span>', 'link-cancel');
						result += '</div>';
					result += '</td>';
				}
			} else {
				result += TableRenderer.defaults.rowRenderHtml.call(this, data, context);
			}
			return result;
		},
		rowAction: function (data, context, actionName, arg1, arg2, arg3) {
			thisConfig = this;
			delete context.parent.uiState.moveRow;
			if (actionName == "expand") {
				if (context.uiState.expand && !arg1) {
 					delete context.uiState.expand;
 				} else {
					context.uiState.expand = arg1 || true;
				}
				return true;
			} else if (actionName == "link") {
				var linkRel = arg1, linkIndex = arg2, subPath = arg3 || '';
				var link = data.subPath(subPath).links(linkRel)[linkIndex || 0];
				if (link.submissionSchemas.length) {
					context.uiState.linkRel = linkRel;
					context.uiState.linkIndex = linkIndex;
					var linkData = link.createSubmissionData(undefined, true);
					context.uiState.linkData = linkData;
					if (subPath) {
						context.uiState.linkPath = subPath;
					} else {
						delete context.uiState.linkPath;
					}
					delete context.uiState.expand;
				} else if (link.rel == "edit") {
					context.uiState.linkRel = linkRel;
					context.uiState.linkIndex = linkIndex;
					if (subPath) {
						context.uiState.linkPath = subPath;
					} else {
						delete context.uiState.linkPath;
					}
					context.uiState.linkData = data.subPath(subPath).editableCopy();
					delete context.uiState.expand;
				} else if (link.method != "GET") {
					context.uiState.linkRel = linkRel;
					context.uiState.linkIndex = linkIndex;
					if (subPath) {
						context.uiState.linkPath = subPath;
					} else {
						delete context.uiState.linkPath;
					}
					delete context.uiState.linkData;
					delete context.uiState.expand;
				} else {
					/*
					link.follow();
					return;
					*/
					var targetExpand = (link.rel == "self") ? true : link.href;
					if (context.uiState.expand == targetExpand) {
						delete context.uiState.expand;
					} else {
						context.uiState.expand = targetExpand;
					}
				}
				return true;
			} else if (actionName == "link-confirm") {
				var linkRel = arg1, linkIndex = arg2, subPath = arg3 || '';
				var link = data.subPath(subPath).links(linkRel)[linkIndex || 0];
				if (link) {
					link.follow(context.uiState.linkData);
				}
				delete context.uiState.linkRel;
				delete context.uiState.linkIndex;
				delete context.uiState.linkPath;
				delete context.uiState.linkData;
				delete context.uiState.expand;
				return true;
			} else if (actionName == "link-cancel") {
				delete context.uiState.linkRel;
				delete context.uiState.linkIndex;
				delete context.uiState.linkPath;
				delete context.uiState.linkData;
				delete context.uiState.expand;
				return true;
			}
			return TableRenderer.defaults.rowAction.apply(this, arguments);
		},
		update: function (element, data, context, operation) {
			if (context.uiState.moveRow != undefined) {
				delete context.uiState.moveRow;
				return true;
			}
			return this.defaultUpdate(element, data, context, operation);
		},
		linkHandler: function () {}
	};
	
	Jsonary.plugins = Jsonary.plugins || {};
	Jsonary.plugins.TableRenderer = TableRenderer;
	Jsonary.plugins.FancyTableRenderer = FancyTableRenderer;
})(Jsonary);