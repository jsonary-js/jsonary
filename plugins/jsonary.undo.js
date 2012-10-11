(function (global) {
	var modKeyDown = false;
	var shiftKeyDown = false;

	window.onkeydown = function (e) {
		var keyCode = (window.event != null) ? window.event.keyCode : e.keyCode;
		if (keyCode == 17) {
			modKeyDown = true;
		}
		if (keyCode == 16) {
			shiftKeyDown = true;
		}
		if (keyCode == 90) {	// Z
			if (modKeyDown) {
				if (shiftKeyDown) {
					Jsonary.redo();
				} else {
					Jsonary.undo();
				}
			}
		}
		if (keyCode == 89) {	// Y
			if (modKeyDown && !shiftKeyDown) {
				Jsonary.redo();
			}
		}
	};
	window.onkeyup = function (e) {
		var keyCode = (window.event != null) ? window.event.keyCode : e.keyCode;
		if (keyCode == 17) {
			modKeyDown = false;
		}
		if (keyCode == 16) {
			shiftKeyDown = false;
		}
	};
	
	var undoList = [];
	var redoList = [];
	var ignoreChanges = 0;
	
	Jsonary.registerChangeListener(function (patch, document) {
		console.log(JSON.stringify(patch.plain()));
		if (ignoreChanges > 0) {
			ignoreChanges--;
			return;
		}
		undoList.push({patch: patch, document: document});
		while (undoList.length > Jsonary.undo.historyLength) {
			undoList.shift();
		}
		if (redoList.length > 0) {
			redoList = [];
		}
	});
	
	Jsonary.extend({
		undo: function () {
			var lastChange = undoList.pop();
			if (lastChange != undefined) {
				ignoreChanges++;
				redoList.push(lastChange);
				lastChange.document.patch(lastChange.patch.inverse());
			}
		},
		redo: function () {
			var nextChange = redoList.pop();
			if (nextChange != undefined) {
				ignoreChanges++;
				undoList.push(nextChange);
				nextChange.document.patch(nextChange.patch);
			}
		}
	});
	Jsonary.undo.historyLength = 10;
})(this);