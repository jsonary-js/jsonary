tests.add("API exists", function() {
    return Jsonary !== undefined;
});

tests.add("create() exists", function() {
    return Jsonary.create !== undefined;
});

tests.add("createSchema() exists", function() {
    return Jsonary.createSchema !== undefined;
});

tests.add("keyIsVariant", function() {
    this.assert(Jsonary.keyIsVariant("2", "2") == true, "2 is a variant of 2");
    this.assert(Jsonary.keyIsVariant("2.1", "2") == true, "2.1 is a variant of 2");
    this.assert(Jsonary.keyIsVariant("2", "2.1") == false, "2 is not a variant of 2.1");
    this.assert(Jsonary.keyIsVariant("2", "3") == false, "2 is not a variant of 3");
    return true;
});

tests.add("config", function() {
    this.assert(Jsonary.config !== undefined);
    return true;
});

