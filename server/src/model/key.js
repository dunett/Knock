const pool = require('./dbConnection');

class Key {
}

// 머니변동내역
Key.chgKey = function(info, cb){
    pool.getConnection(function (err, conn) {
        conn.beginTransaction(function (err) {
            const sql1 = 'SELECT money FROM User where u_id = ?';
            conn.query(sql1, info.u_id, function (err, results){
                if (err) {
                    err.code = 500;
                    conn.release();
                    return cb(err, {msg: 'Failure'});
                }
                if (results.length == 0) {
                    conn.release();
                    return cb(err, {msg: 'No result'});
                }
                const key = results[0].money;
                if(key+info.cost>=0){
                    key = key + info.cost;
                }else{
                    return cb(err, {msg: 'No money'});
                }
                info.rest = key;
                const sql2 = 'UPDATE User SET money = ? where u_id = ?';
                conn.query(sql2, [info.rest , info.u_id], function (err, results){
                    console.log("test")
                    if (err) {
                        err.code = 500;
                        conn.rollback();
                        conn.release();
                        return cb(err, {msg: 'Failure'});
                    }
                    const sql3 = "INSERT INTO History SET ?"
                    conn.query(sql3, info, function(err, results){
                        if (err) {
                            err.code = 500;
                            conn.rollback();
                            conn.release();
                            return cb(err, {msg: 'Failure'});
                        }
                        conn.commit();
                        conn.release();
                        return cb(null, {msg : 'Success.'});
                    });
                });
            });
        });
   });
}
module.exports = Key;