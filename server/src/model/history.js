const pool = require('./dbConnection');

class History{

}

// History.totalHistory = function(id, num, cb){
//     pool.getConnection(function(err, conn){
//         async.series(
//             [
//                 function(done){
//                     const sql1 = 'SELECT u_id, age, alias, thumbnail FROM User WHERE u_id in (SELECT receiver FROM Relation WHERE sender = ? AND relation = 1 union SELECT sender FROM Relation WHERE receiver = ? AND relation = 1) limit ?';

//                 }

//             ],function (err, results){

//             }
//         );
//         const sql = ''
//     })
// }

//서로에게 노크한 사람
History.eachHistory = function(id, cb){
    pool.getConnection(function(err, conn){
        if(err){
            console.log(err);
        }
        const sql = 'SELECT u_id, age, alias, thumbnail FROM User WHERE u_id in (SELECT receiver FROM Relation WHERE sender = ? AND relation = 1 union SELECT sender FROM Relation WHERE receiver = ? AND relation = 1)';
        conn.query(sql, [id, id], (err, results) =>{
            const cnt = results.length;
            if(cnt == 0){
                return cb(err, {msg: 'No result'});
            }
            return cb(null, {meg: 'Success', count: cnt, me: results});
        })
    })
}
//나에게 노크한 사람
History.meHistory = function(id, cb){
    pool.getConnection(function(err, conn){
        const sql = 'SELECT u_id, age, alias, thumbnail FROM User WHERE u_id in (SELECT sender FROM Relation WHERE receiver = ? AND relation = 0)';
        conn.query(sql, id, (err, results) =>{
            const cnt = results.length;
            if(cnt == 0){
                return cb(err, {msg: 'No result'});
            }
            return cb(null, {msg: 'Success', count: cnt, me: results});
        })
    })
}
//너에게 노크한 사람
History.youHistory = function(id, cb){
    pool.getConnection(function(err, conn){
        const sql = 'SELECT u_id, age, alias, thumbnail FROM User WHERE u_id in (SELECT receiver FROM Relation WHERE sender = 1 AND relation = 0)';
        conn.query(sql, id, (err, results) =>{
            const cnt = results.length;
            if(cnt == 0){
                return cb(err, {msg: 'No result'});
            }
            return cb(null, {msg: 'Success', count: cnt, me: results});
        })
    })
}
//지나간 사람
History.pastHistory = function(id, cb){
    pool.getConnection(function(err, conn){
        const sql = 'SELECT u_id, age, alias, thumbnail FROM User WHERE u_id in (SELECT receiver FROM (SELECT receiver FROM Destiny WHERE sender = ? AND DATEDIFF(now(),date) < 7) A LEFT JOIN (SELECT receiver as sender FROM Relation WHERE sender = ? union SELECT sender FROM Relation WHERE receiver = ?) B ON A.receiver = B.sender)';
        conn.query(sql, [id, id, id], (err, results) =>{
            const cnt = results.length;
            if(cnt == 0){
                return cb(drr, {msg: 'No result'});
            }
            return cb(null, {msg: 'Success', count: cnt, past: results});
        })
    })
}
module.exports = History;