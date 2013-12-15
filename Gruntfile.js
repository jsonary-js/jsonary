var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-compress');

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		'hacky-tests': {
			core: 'tests/tests',
			render: 'tests/render-tests'
		},
		compress: {
			'get-started-bundle': {
				options: {
					archive: 'express-site/get-started.zip',
					pretty: true
				},
				files: [{
					expand: true,
					cwd: 'node-package/',
					src: ['core/**', 'plugins/**', 'renderers/**', 'super-bundle/**', 'index.html', 'LICENSE.txt', 'example.json']
				}]
			}
		}
	});

	grunt.registerTask('assemble-package', 'Assemble the Node package', function () {
		require('./assemble-package.js');
	});

	// Hacky adapter around the test-suite format
	grunt.registerMultiTask('hacky-tests', 'Assemble and test', function () {
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
				grunt.log.writeln(' done');
				grunt.log.ok('\n' + this.tests.length + ' tests completed');
				grunt.file.delete('test-bundle.js');
				thisTaskDone();
			},
			addSection: function (title) {
				if (title.length > 60) {
					title = "..." + title.substring(title.length - 57);
				}
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
						var thisTest = this;
						this.timeout = setTimeout(function () {
							thisTest.fail('Timeout - test did not terminate in 2sec');
						}, 2000);
						this.pass = function () {
							clearTimeout(thisTest.timeout);
							this.pass = this.fail = function () {};
							grunt.verbose.writeln('\t\t\tpassed');
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
						clearTimeout(this.timeout);
						grunt.log.writeln('');
						grunt.log.error("Test failed: " + title);
						grunt.log.writeln(reason + "\n");
						if (reason && reason.stack) {
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
					grunt.verbose.subhead(test.title);
					grunt.log.notverbose.write('.');
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
					try {
						var fileFunction = new Function('tests', 'recursiveCompare', 'Jsonary', 'require', '__filename', '__dirname', code);
						var Jsonary = jsonaryBundle.instance();
						Jsonary.ajaxFunction = function (params, callback) {
							process.nextTick(function () {
								callback(null, {"test": "Test data"}, "Content-Type: application/json");
							});
						};
						fileFunction(testSet, recursiveCompare, Jsonary, require, resolvedFilename, resolvedDir);
					} catch (e) {
						console.log("Error in test file: " + resolvedFilename);
						console.log(e.stack || e);
						grunt.fail.warn("Invalid test file: " + resolvedFilename);
					}
				}
			});
		}
		
		walkForTests(this.data);
		grunt.log.writeln(this.target + ": " + testSet.tests.length + " tests in " + this.data);
		testSet.run();
	});
	
	grunt.registerTask('assemble', ['assemble-package']);
	grunt.registerTask('test-core', ['hacky-tests:core']);
	grunt.registerTask('test-render', ['hacky-tests:render']);

	grunt.registerTask('test', ['assemble-package', 'hacky-tests']);
	// Default task(s).
	grunt.registerTask('default', ['test', 'compress']);

};