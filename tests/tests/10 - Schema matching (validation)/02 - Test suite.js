if (typeof require === 'undefined' || typeof __dirname === 'undefined') {
	tests.add("TODO: Full test suite not available in browser", function () {
		return true;
	})
} else {
	var fs = require('fs');
	var path = require('path');
	
	var remoteDir = 'test-suite/remotes';
	var remoteUrl = 'http://localhost:1234';
	function addRemotes(dir) {
		var files = fs.readdirSync(path.join(__dirname, remoteDir, dir));
		for (var i = 0; i < files.length; i++) {
			var filename = files[i];
			var stats = fs.statSync(path.join(__dirname, remoteDir, dir, filename));
			if (stats.isDirectory()) {
				addRemotes(dir + '/' + filename);
			} else if (/\.json$/i.test(filename)) {
				var fileContents = JSON.parse(fs.readFileSync(path.join(__dirname, remoteDir, dir, filename)));
				Jsonary.addToCache(remoteUrl + dir + '/' + filename, fileContents);
			}
		}
	}
	addRemotes('');
	
	var testDirs = ['test-suite/tests/draft3', 'test-suite/tests/draft4'];
	var ignoreTests = ['test-suite/tests/draft3/ref.json']; // Relies on draft-03 meta-schema, which we don't have
	for (var i = 0; i < ignoreTests.length; i++) {
		ignoreTests[i] = path.join(__dirname, ignoreTests[i]);
	}
	for (var i = 0; i < testDirs.length; i++) {
		var testDir = path.join(__dirname, testDirs[i]);
		var files = fs.readdirSync(testDir);
		files.sort();
		for (var j = 0; j < files.length; j++) {
			var filename = path.join(testDir, files[j]);
			if (!filename.match(/\.json$/i)) {
				continue;
			}
			if (ignoreTests.indexOf(filename) !== -1) {
				continue;
			}
			addTests(filename);
		}
	}
	
	function addTests(filename) {
		var jsonTests = JSON.parse(fs.readFileSync(filename));
		for (var i = 0; i < jsonTests.length; i++) {
			(function (schemaTest) {
				tests.add(path.basename(filename) + ": " + schemaTest.description, function () {
					var schema = Jsonary.createSchema(schemaTest.schema);
					
					for (var i = 0; i < schemaTest.tests.length; i++) {
						var test = schemaTest.tests[i];
						var data = Jsonary.create(test.data).addSchema(schema);
						var failText = "Schema: " + JSON.stringify(schemaTest.schema, null, 4) + "\nData: " + JSON.stringify(test.data, null, 4);
						if (test.valid) {
							this.assert(data.valid() === true, "Should be valid: " + test.description + "\n" + failText);
						} else {
							this.assert(data.valid() === false, "Should be invalid: " + test.description + "\n" + failText);
						}
					}
					return true;
				});
			})(jsonTests[i]);
		}
	}
}