var pool = require('./dbConnection');

class Key {
}

Key.showKey = function(id, cb){
    pool.getConnection(function (err, conn) {
      var sql = 'SELECT money FROM User where u_id = ?';
      conn.query(sql, id,  function (err, results) {
         if (err) {
            err.code = 500;
            conn.release();
            return cb(err, {msg:"failure"});
         }

         if (results.length == 0) {
            return cb(err, {msg:"no result"});
         }
         var money = results[0];
         money.msg = "success";
         conn.release();
         return cb(err, money); 
      });
   });
}

Key.cngkey = function(id, info, cb){
    pool.getConnection(function (err, conn) {
      var sql = 'SELECT money FROM User where u_id = ?';
      conn.query(sql, id,  function (err, results) {
         if (err) {
            err.code = 500;
            conn.release();
            return next(err);
         }

         if (results.length == 0) {
            res.status(404).send({ msg: 'Not Found' });
            conn.release();
            return;
         }

         var key = results[0];
         info[rest]=key;
         
         (err,conn) =>{
            if(err){
                err = 500;
                return next(err);
            }
            var sql = "INSERT INTO History SET ?";
            conn.query(sql, info, (err, result) =>{
                conn.release();
                return cb(null, {msg : "success"});
            });
        }
      });
   });
}

module.exports = Key;