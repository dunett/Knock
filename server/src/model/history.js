var async = require('async');
const pool = require('./dbConnection');

class History{

}

History.totalHistory = function(id, cb){
        async.series(
            [
                function task1(done){
                    History.eachHistory(id, (err, result) =>{
                        if(err){
                            done(err);
                        }else{
                            done(null, result);
                        }
                    })
                },
                function task2(done){
                    History.meHistory(id, (err, result) =>{
                        if(err){
                            done(err);
                        }else{
                            done(null, result);
                        }
                    })
                },
                function task3(done){
                    History.youHistory(id, (err, result) =>{
                        if(err){
                            done(err);
                        }else{
                            done(null, result);
                        }
                    })
                }
                ,function task4(done){
                    History.pastHistory(id, (err, result) =>{
                        if(err){
                            done(err);
                        }else{
                            done(null, result);
                        }
                    })
                }
            ],function (err, results){
                if(err){
                    return cb(err, err.message);
                }
                return cb(null, {total: results});
            }
        );
}

//서로에게 노크한 사람
History.eachHistory = function(id, cb){
    pool.getConnection(function(err, conn){
        if(err){
            console.log(err);
        }
        const sql = 'SELECT u.u_id, u.age, u.alias, u.thumbnail, r.favor_r as favor FROM User u, Relation r WHERE u.u_id in (SELECT receiver FROM Relation WHERE sender = ? AND relation = 1) AND u.u_id = r.receiver union  SELECT u.u_id, u.age, u.alias, u.thumbnail, r.favor_s as favor FROM User u, Relation r WHERE u.u_id in (SELECT sender FROM Relation WHERE receiver = ? AND relation = 1) AND u.u_id = r.sender;';
        conn.query(sql, [id, id], (err, results) =>{
            var three;
            const cnt = results.length;
            if(cnt == 0){
                return cb(err, {msg: 'No result'});
            }
            var three = results.slice(0,3);
            var other = results.slice(3,results.length);
            conn.release();
            return cb(null, {msg: "Success", each: {count: cnt, one: three, two: other}});
        })
    })
}
//나에게 노크한 사람
History.meHistory = function(id, cb){
    pool.getConnection(function(err, conn){
        //const sql = 'SELECT u_id, age, alias, thumbnail FROM User WHERE u_id in (SELECT sender FROM Relation WHERE receiver = ? AND relation = 0)';
        const sql = 'SELECT u_id, age, alias, thumbnail FROM User u, Relation r WHERE u_id in (SELECT sender FROM Relation WHERE receiver = ? AND relation = 0 order by date desc) and u.u_id = r.sender order by r.date desc'
        conn.query(sql, id, (err, results) =>{
            var three = "[{";
            const cnt = results.length;
            if(cnt == 0){
                return cb(err, {msg: 'No result'});
            }
            var three = results.slice(0,3);
            var other = results.slice(3,results.length);
            conn.release();
            return cb(null, {msg: "Success", me: {count: cnt, one: three, two: other}});
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
            var three = results.slice(0,3);
            var other = results.slice(3,results.length);
            conn.release();
            return cb(null, {msg: "Success", you: {count: cnt, one: three, two: other}});
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
                return cb(err, {msg: 'No result'});
            }
            var three = results.slice(0,3);
            var other = results.slice(3,results.length);
            conn.release();
            return cb(null, {msg: "Success", past: {count: cnt, one: three, two: other}});
        })
    })
}
module.exports = History;