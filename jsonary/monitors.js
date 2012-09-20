function MonitorSet(context) {
	this.contents = {};
	this.keyOrder = [];
	this.context = context;
}
MonitorSet.prototype = {
	add: function (monitorKey, monitor) {
		if (typeof monitorKey != "string" && typeof monitorKey != "number") {
			throw new Error("First argument must be a monitorKey, obtained using getMonitorKey()");
		}
		this.contents[monitorKey] = monitor;
		this.addKey(monitorKey);
	},
	addKey: function (monitorKey) {
		var i;
		for (i = 0; i < this.keyOrder.length; i++) {
			var key = this.keyOrder[i];
			if (key == monitorKey) {
				return;
			}
			if (Utils.keyIsVariant(monitorKey, key)) {
				this.keyOrder.splice(i, 0, monitorKey);
				return;
			}
		}
		this.keyOrder.push(monitorKey);
	},
	remove: function (monitorKey) {
		delete this.contents[monitorKey];
		this.removeKey(monitorKey);
		var prefix = monitorKey + ".";
		for (var key in this.contents) {
			if (key.substring(0, prefix.length) == prefix) {
				this.removeKey(key);
				delete this.contents[key];
			}
		}
	},
	removeKey: function (monitorKey) {
		var index = this.keyOrder.indexOf(monitorKey);
		if (index >= 0) {
			this.keyOrder.splice(index, 1);
		}
	},
	notify: function () {
		var notifyArgs = arguments;
		for (var i = 0; i < this.keyOrder.length; i++) {
			var key = this.keyOrder[i];
			var monitor = this.contents[key];
			monitor.apply(this.context, notifyArgs);
		}
	},
	isEmpty: function () {
		var key;
		for (key in this.contents) {
			if (this.contents[key].length !== 0) {
				return false;
			}
		}
		return true;
	}
};

function ListenerSet(context) {
	this.listeners = [];
	this.context = context;
}
ListenerSet.prototype = {
	add: function (listener) {
		this.listeners[this.listeners.length] = listener;
	},
	notify: function () {
		var listenerArgs = arguments;
		while (this.listeners.length > 0) {
			var listener = this.listeners.shift();
			listener.apply(this.context, listenerArgs);
		}
	},
	isEmpty: function () {
		return this.listeners.length === 0;
	}
};
