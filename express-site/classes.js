var myJson = require('my-json');

module.exports = myJson.group({
	Page: {
		table: 'jsonary_pages',
		keyColumn: 'string/name',
		columns: {
			'string/name': 'name',
			'json': 'json'
		}
	},
	Api: {
		table: 'jsonary_api',
		keyColumn: 'string/apiName',
		columns: {
			'string/apiName': 'name',
			'json': 'json'
		}
	}
});