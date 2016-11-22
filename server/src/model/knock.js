var pool = require('./dbConnection');

class Knock {
}
// 관계만들기
Knock.addRel = function(info, cb){
    pool.getConnection(function (err, conn) {
        var sql = "INSERT INTO Relation SET ?";
        conn.query(sql, info, function(err, results){
            if (err) {
                err.code = 500;
                conn.rollback();
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            conn.commit();
            conn.release();
            return cb(err, {msg : 'Success'});
        });
   });
}
// 관계연결하기
Knock.chgRel = function(id, cb){
    pool.getConnection(function (err, conn){
        var sql = "UPDATE Relation SET relation = 1 where r_id = ?";
        conn.query(sql, id, function(err, results){
            if(err){
                err.code = 500;
                conn.rollback();
                conn.release();
                return cb(err, {msg: "Failure"});
            }
            conn.commit();
            conn.release();
            return cb(err, {msg : 'Success'});
        })
    })
}

module.exports = Knock;