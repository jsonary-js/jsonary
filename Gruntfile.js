var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
	});

	grunt.registerTask('assemble', 'Assemble the bundles', function () {
		require('./assemble-bundles.js');
	});

	// Hacky adapter around the test-suite format
	grunt.registerTask('test', 'Assemble and test', function () {
		var thisTask = this;
		thisTaskDone = this.async();
	
		var jsonaryBundle = require('./node-package/jsonary-bundle');
		jsonaryBundle.writeJs('test-bundle.js');
		
		function recursiveCompare(a, b) {
			if (Array.isArray(a)) {
				if (!Array.isArray(b) || a.length != b.length) {
					return false;
				}
				for (var i = 0; i < a.length; i++) {
					if (!recursiveCompare(a[i], b[i])) {
						return false;
					}
				}
				return true;
			} else if (typeof a == "object") {
				for (var key in a) {
					if (b[key] === undefined && a[key] !== undefined) {
						return false;
					}
				}
				for (var key in b) {
					if (a[key] === undefined && b[key] !== undefined) {
						return false;
					}
				}
				for (var key in a) {
					if (!recursiveCompare(a[key], b[key])) {
						return false;
					}
				}
				return true;
			}
			return a === b;
		}

		var testSet = {
			tests: [],
			allTestsDone: function () {
				grunt.log.writeln('\n' + this.tests.length + ' tests completed');
				thisTaskDone();
			},
			addSection: function (title) {
				this.tests.push({
					title: "\t" + title + ":",
					run: function (onComplete) {
						onComplete();
					}
				});
			},
			add: function (title, execFunction) {
				var test = {
					title: "\t\t" + title,
					assert: function (shouldBeTrue, failReason) {
						if (!shouldBeTrue) {
							this.fail(failReason);
						}
					},
					run: function (onComplete) {
						this.pass = function () {
							this.pass = this.fail = function () {};
							grunt.log.writeln('\t\t\tpassed');
							process.nextTick(onComplete);
						};
						try {
							var result = execFunction.call(this);
						} catch (e) {
							this.fail(e);
						}
						if (typeof result !== 'undefined') {
							if (result) {
								this.pass();
							} else {
								this.fail("(no reason given)");
							}
						}
					},
					fail: function (reason) {
						console.log("Test failed: " + title);
						console.log(reason + "\n");
						if (reason.stack) {
							console.log(reason.stack);
						}
						grunt.fail.warn("Test failed (" + title + ")");
					}
				}
				this.tests.push(test)
			},
			run: function () {
				var thisTestSet = this;
				var tests = this.tests;
				var testIndex = 0;
				function runNextTest() {
					if (testIndex >= tests.length) {
						return thisTestSet.allTestsDone();
					}
					var test = tests[testIndex++];
					grunt.log.subhead(test.title);
					test.run(runNextTest);
				};
				runNextTest();
			}
		};
		
		function walkForTests(dir) {
			var resolvedDir = dir;
			var files = fs.readdirSync(resolvedDir);
			files.sort();
			files.forEach(function (filename) {
				if (filename.match(/^\./)) {
					return;
				}
				var resolvedFilename = path.join(resolvedDir, filename);
				var stats = fs.statSync(resolvedFilename);
				if (stats.isDirectory()) {
					walkForTests(resolvedFilename);
				} else if (filename.match(/\.js$/i)) {
					testSet.addSection(resolvedFilename);
					var code = grunt.file.read(resolvedFilename);
					var fileFunction = new Function('tests', 'recursiveCompare', 'Jsonary', code);
					var Jsonary = jsonaryBundle.instance();
					Jsonary.ajaxFunction = function (params, callback) {
						process.nextTick(function () {
							callback(null, {"test": "Test data"}, "Content-Type: application/json");
						});
					};
					fileFunction(testSet, recursiveCompare, Jsonary);
				}
			});
		}
		
		walkForTests('tests/tests');
		grunt.log.writeln(testSet.tests.length + " tests");
		testSet.run();
	});

	// Default task(s).
	grunt.registerTask('default', ['assemble', 'test']);

};