// Same examples from the spec as in "Basic tests"
var examples = {
	"{+var}": "value",
	"{+hello}": "Hello%20World!",
	"{+path}/here": "/foo/bar/here",
	"here?ref={+path}": "here?ref=/foo/bar",
	"X{#var}": "X#value",
	"X{#hello}": "X#Hello%20World!",
	"map?{x,y}": "map?1024,768",
	"{x,hello,y}": "1024,Hello%20World%21,768",
	"{#x,hello,y}": "#1024,Hello%20World!,768",
	"{+path,x}/here": "/foo/bar,1024/here",
	"X{.var}": "X.value",
	"X{.x,y}": "X.1024.768",
	"{/var}": "/value",
	"{/var,x}/here": "/value/1024/here",
	"{;x,y}": ";x=1024;y=768",
	"{;x,y,empty}": ";x=1024;y=768;empty",
	"{?x,y}": "?x=1024&y=768",
	"{?x,y,empty}": "?x=1024&y=768&empty=",
	"?fixed=yes{&x}": "?fixed=yes&x=1024",
	"{&x,y,empty}": "&x=1024&y=768&empty=",
	"{var:3}": "val",
	"{var:30}": "value",
	"{list}": "red,green,blue",
	"{list*}": "red,green,blue",
	"{keys}": "semi,%3B,dot,.,comma,%2C",
	"{keys*}": "semi=%3B,dot=.,comma=%2C",
	"{+path:6}/here": "/foo/b/here",
	"{+list}": "red,green,blue",
	"{+list*}": "red,green,blue",
	"{+keys}": "semi,;,dot,.,comma,,",
	"{+keys*}": "semi=;,dot=.,comma=,",
	"{#path:6}/here": "#/foo/b/here",
	"{#list}": "#red,green,blue",
	"{#list*}": "#red,green,blue",
	"{#keys}": "#semi,;,dot,.,comma,,",
	"{#keys*}": "#semi=;,dot=.,comma=,",
	"X{.var:3}": "X.val",
	"X{.list}": "X.red,green,blue",
	"X{.list*}": "X.red.green.blue",
	"X{.keys}": "X.semi,%3B,dot,.,comma,%2C",
	"X{.keys*}": "X.semi=%3B.dot=..comma=%2C",
	"{/var:1,var}": "/v/value",
	"{/list}": "/red,green,blue",
	"{/list*}": "/red/green/blue",
	"{/list*,path:4}": "/red/green/blue/%2Ffoo",
	"{/keys}": "/semi,%3B,dot,.,comma,%2C",
	"{/keys*}": "/semi=%3B/dot=./comma=%2C",
	"{;hello:5}": ";hello=Hello",
	"{;list}": ";list=red,green,blue",
	"{;list*}": ";list=red;list=green;list=blue",
	"{;keys}": ";keys=semi,%3B,dot,.,comma,%2C",
	"{;keys*}": ";semi=%3B;dot=.;comma=%2C",
	"{?var:3}": "?var=val",
	"{?list}": "?list=red,green,blue",
	"{?list*}": "?list=red&list=green&list=blue",
	"{?keys}": "?keys=semi,%3B,dot,.,comma,%2C",
	"{?keys*}": "?semi=%3B&dot=.&comma=%2C",
	"{&var:3}": "&var=val",
	"{&list}": "&list=red,green,blue",
	"{&list*}": "&list=red&list=green&list=blue",
	"{&keys}": "&keys=semi,%3B,dot,.,comma,%2C",
	"{&keys*}": "&semi=%3B&dot=.&comma=%2C"
};
for (var sub in examples) {
	(function (sub, expected) {
		tests.add(sub, function () {
			var template = new Jsonary.UriTemplate(sub);
			var value = template.fromUri(expected);

			// We don't have checks for the original values - but we *can* check that it re-templates into the same thing
			
			var reconstructed = template.fillFromObject(value);

			this.assert(reconstructed == expected, JSON.stringify(reconstructed) + " != " + JSON.stringify(expected));
			return true;
		});
	})(sub, examples[sub]);
}