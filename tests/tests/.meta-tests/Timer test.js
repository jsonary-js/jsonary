      tests.add("Succeed instantly", function() {
        var thisTest = this;
        return true;
      });
      tests.add("Fail after 1500ms", function() {
        var thisTest = this;
        setTimeout(function() {
          thisTest.fail();
        }, 1500);
      });
      tests.add("Pass after 1000ms", function() {
        var thisTest = this;
        setTimeout(function() {
          thisTest.pass();
        }, 1000);
      });
      tests.add("Fail with message \"Comparisons\" after 1000ms", function() {
        var thisTest = this;
        setTimeout(function() {
            thisTest.assert(1 > 2, "Comparisons");
            thisTest.pass();
        }, 1000);
      });

