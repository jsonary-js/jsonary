//Tidying
// TODO: check all " == undefined", in case they should be " === undefined" instead (null-safety)
// TODO: profile memory consumption - you're throwing closures around the place, it might go wrong
// TODO: try/catch clauses for all listeners/monitors
// TODO: document everything
// TODO: does the assigned baseUrl/fragment of data change when it's removed or assigned?
// TODO: various things are indexed by keys, and might have multiple entries - if we allow an entry to have more than one key, we need to do fewer calculations, and there is less duplication.  This will also help speed up schema matching, as we won't have any duplicates.

//Features:
// TODO: Speculative schema matching (independent of applied schemas)
// TODO: something about types - list of uniqueIds for the data object defining the type?
// TODO: as long as we keep a request in the cache, keep a map of all custom-defined fragments
// TODO: have monitors return boolean, saying whether they are interested in future updates (undefined means true)
// TODO: re-structure monitor keys
// TODO: separate schema monitors from type monitors?

var configData = publicApi.create({
	intelligentLinks: true,
	intelligentPut: true
});
publicApi.config = configData;