function Patch(prefix) {
	this.operations = [];
	if (prefix == undefined) {
		prefix = "";
	}
	this.prefix = prefix;
}
Patch.prototype = {
	isEmpty: function () {
		return this.operations.length == 0;
	},
	each: function (callback) {
		for (var i = 0; i < this.operations.length; i++) {
			callback.call(this, i, this.operations[i]);
		}
		return this;
	},
	plain: function () {
		var result = [];
		for (var i = 0; i < this.operations.length; i++) {
			result[i] = this.operations[i].plain();
		}
		return result;
	},
	condense: function () {
		// Replace operations with shorter sequence, if possible
		return;
	},
	filterImmediate: function () {
		var subPatch = new Patch(this.prefix);
		for (var i = 0; i < this.operations.length; i++) {
			var operation = this.operations[i];
			if (operation.immediateChild(this.prefix)) {
				subPatch.operations.push(operation);
			}
		}
		return subPatch;
	},
	filter: function (prefix) {
		prefix = this.prefix + prefix;
		var subPatch = new Patch(prefix);
		for (var i = 0; i < this.operations.length; i++) {
			var operation = this.operations[i];
			if (operation.hasPrefix(prefix)) {
				subPatch.operations.push(operation);
			}
		}
		return subPatch;
	},
	filterRemainder: function (prefix) {
		prefix = this.prefix + prefix;
		var subPatch = new Patch(this.prefix);
		for (var i = 0; i < this.operations.length; i++) {
			var operation = this.operations[i];
			if (!operation.hasPrefix(prefix)) {
				subPatch.operations.push(operation);
			}
		}
		return subPatch;
	},
	replace: function (path, value) {
		var operation = new PatchOperation("replace", path, value);
		this.operations.push(operation);
		return this;
	},
	add: function (path, value) {
		var operation = new PatchOperation("add", path, value);
		this.operations.push(operation);
		return this;
	},
	remove: function (path) {
		var operation = new PatchOperation("remove", path);
		this.operations.push(operation);
		return this;
	},
	inverse: function () {
		var result = new Patch(this.prefix);
		for (var i = 0; i < this.operations.length; i++) {
			result.operations[i] = this.operations[i].inverse();
		}
		result.operations.reverse();
		return result;
	}
};

function PatchOperation(patchType, subject, value) {
	this._patchType = patchType;
	this._subject = subject;
	this._oldSubjectValue = undefined;
	if (patchType == "move") {
		this._target = value;
	} else {
		this._value = value;
	}
}
PatchOperation.prototype = {
	action: function () {
		return this._patchType;
	},
	value: function () {
		return this._value;
	},
	subject: function () {
		return this._subject;	
	},
	setOldSubjectValue: function (value) {
		this._oldSubjectValue = value;
		return this;
	},
	inverse: function () {
		switch (this._patchType) {
			case "replace":
				return new PatchOperation("replace", this._subject, this._oldSubjectValue);
			case "add":
				return (new PatchOperation("remove", this._subject)).setOldSubjectValue(this._value);
			case "remove":
				return (new PatchOperation("add", this._subject, this._oldSubjectValue));
			case "move":
				return (new PatchOperation("move", this._target, this._subject));
			default:
				throw new Error("Unrecognised patch type for inverse: " + this._patchType);
		}
	},
	depthFrom: function (path) {
		path += "/";
		var minDepth = NaN;
		if (this._subject.substring(0, path.length) == path) {
			var remainder = this._subject.substring(path.length);
			if (remainder == 0) {
				minDepth = 0;
			} else {
				minDepth = remainder.split("/").length;
			}
		}
		if (this._target != undefined) {
			if (this._target.substring(0, path.length) == path) {
				var targetDepth;
				var remainder = this._target.substring(path.length);
				if (remainder == 0) {
					targetDepth = 0;
				} else {
					targetDepth = remainder.split("/").length;
				}
				if (!(targetDepth > minDepth)) {
					minDepth = targetDepth;
				}
			}
		}
		return minDepth;
	},
	subjectEquals: function (path) {
		return this._subject == path;
	},
	subjectChild: function (path) {
		path += "/";
		if (this._subject.substring(0, path.length) == path) {
			var remainder = this._subject.substring(path.length);
			if (remainder.indexOf("/") == -1) {
				return decodeURIComponent(remainder);
			}
		}
		return false;
	},
	subjectRelative: function (path) {
		path += "/";
		if (this._subject.substring(0, path.length) == path) {
			return this._subject.substring(path.length - 1);
		}
		return false;
	},
	target: function () {
		return this._target;
	},
	targetEquals: function (path) {
		return this._target == path;
	},
	targetChild: function (path) {
		path += "/";
		if (this._target.substring(0, path.length) == path) {
			var remainder = this._target.substring(path.length);
			if (remainder.indexOf("/") == -1) {
				return decodeURIComponent(remainder);
			}
		}
		return false;
	},
	targetRelative: function (path) {
		path += "/";
		if (this._target.substring(0, path.length) == path) {
			return this._target.substring(path.length - 1);
		}
		return false;
	},
	plain: function () {
		var result = {};
		result[this._patchType] = this._subject;
		if (this._patchType == "remove") {
		} else if (this._patchType == "move") {
			result.to = this._target;
		} else {
			result.value = this._value;
		}
		return result;
	},
	matches: function (prefix) {
		if (this._subject == prefix) {
			return true;
		} else if (this._patchType == "move" && this._target == prefix) {
			return true;
		}
		return false;
	},
	hasPrefix: function (prefix) {
		if (this.matches(prefix)) {
			return true;
		}
		prefix += "/";
		if (this._subject.substring(0, prefix.length) == prefix) {
			return true;
		} else if (this._patchType == "move" && this._target.substring(0, prefix.length) == prefix) {
			return true;
		}
		return false;
	}
};


