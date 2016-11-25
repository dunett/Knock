var mysql = require('mysql');
var dbConfig = {
	host : 'knock.c1b9zpiw5mtx.ap-northeast-2.rds.amazonaws.com',
	user : 'admin',
	password : 'tjsdydwns',
	port : 3306,
	database : 'Knock',
	timezone : 'KST'	
};
var dbPool = mysql.createPool(dbConfig);

module.exports = dbPool;