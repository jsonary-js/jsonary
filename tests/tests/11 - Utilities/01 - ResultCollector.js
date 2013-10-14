tests.add("ResultCollector sync use", function () {
	var thisTest = this;
	
	var resultArr = [];
	var results = Jsonary.ResultCollector(function (value) {
		resultArr.push(value);
	});
	
	var inputObj = {
		a: "A",
		b: "B"
	};
	for (var key in inputObj) {
		(function (key, value) {
			results.wait();
			results.result(value);
		})(key, inputObj[key]);
	}

	var called = false;
	results.whenDone(function () {
		called = true;
		thisTest.assert(resultArr.length == 2, "should have two results");
	});
	this.assert(called, "callback called");
	this.assert(results.done === true, "results.done === true");
	return true;
});

tests.add("ResultCollector async use", function () {
	var thisTest = this;
	
	var resultArr = [];
	var results = Jsonary.ResultCollector(function (value) {
		resultArr.push(value);
	});
	
	var inputObj = {
		a: "A",
		b: "B"
	};
	for (var key in inputObj) {
		(function (key, value) {
			results.wait();
			setTimeout(function () {
				results.result(value);
			}, 10);
		})(key, inputObj[key]);
	}
	
	results.whenDone(function () {
		thisTest.assert(resultArr.length == 2, "should have two results");
		thisTest.pass();
	});
	
	this.assert(results.done === false, "results.done should be false");

	setTimeout(function () {
		thisTest.fail('timeout');
	}, 200)
});

tests.add("ResultCollector async use with keys (1)s", function () {
	var thisTest = this;
	
	var results = Jsonary.ResultCollector();
	
	var inputObj = {
		a: "A",
		b: "B"
	};
	for (var key in inputObj) {
		(function (key, value) {
			results.wait();
			setTimeout(function () {
				results.resultForKey(key, value);
			}, 10);
		})(key, inputObj[key]);
	}
	
	results.whenDone(function (obj) {
		console.log(typeof obj);
		console.log(obj);
		thisTest.assert(obj.a === 'A', 'A match');
		thisTest.assert(obj.b === 'B', 'B match');
		thisTest.pass();
	});
	
	setTimeout(function () {
		thisTest.fail('timeout');
	}, 200)
});

tests.add("ResultCollector async use with keys (2)", function () {
	var thisTest = this;
	
	var results = Jsonary.ResultCollector();
	
	var inputObj = {
		a: "A",
		b: "B"
	};
	for (var key in inputObj) {
		(function (key, value) {
			results.wait();
			var callback = results.forKey(key);
			setTimeout(function () {
				callback(value);
			}, 10);
		})(key, inputObj[key]);
	}
	
	results.whenDone(function (obj) {
		thisTest.assert(obj.a === 'A', 'A match');
		thisTest.assert(obj.b === 'B', 'B match');
		thisTest.pass();
	});
	
	setTimeout(function () {
		thisTest.fail('timeout');
	}, 200)
});