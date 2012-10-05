(function (global) {
	var hashJsonaryData = Jsonary.create(null);

	function updateHash() {
		var hashString = window.location.hash;
		if (hashString.length > 0 && hashString.charAt(0) == "#") {
			hashString = hashString.substring(1);
		}
		if (hashString == lastHash) {
			return;
		}
		lastHash = hashString;
		
		var hashData = hashString;
		try {
			hashData = Jsonary.decodeData(hashString, "application/x-www-form-urlencoded");
		} catch (e) {
			console.log(e);
		}
		hashJsonaryData.setValue(hashData);
	}
	
	var lastHash = null;
	setInterval(updateHash, 100);
	updateHash();

	Jsonary.extend({
		hash: hashJsonaryData
	});	
	
})(this);
