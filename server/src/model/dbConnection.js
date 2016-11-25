var mysql = require('mysql');
var dbConfig = {
	host : 'knock.c1b9zpiw5mtx.ap-northeast-2.rds.amazonaws.com',
	user : 'admin',
	password : 'tjsdydwns',
	port : 3306,
	database : 'Knock',
	timezone : 'KST',
	connectionLimit : 1000,
    connectTimeout  : 60 * 60 * 1000,
    aquireTimeout   : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000
};
var dbPool = mysql.createPool(dbConfig);

module.exports = dbPool;