var mysql = require('mysql');

module.exports = mysql.createPool({
	host: MYSQL_HOST,
	user: MYSQL_USER,
	database: MYSQL_DATABASE,
	password: MYSQL_PASSWORD
});