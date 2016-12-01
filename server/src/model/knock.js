var async = require('async');
var pool = require('./dbConnection');

class Knock {
}
// 관계만들기
Knock.addRel = function(info, cb){
    pool.getConnection(function (err, conn) {
        var sql = "INSERT INTO Relation SET ?";
        conn.query(sql, info, function(err, results){
            if (err) {
                //err.code = 500;
                conn.rollback();
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            conn.commit();
            conn.release();
            return cb(null, {msg : 'Success'});
        });
   });
}
// 관계연결하기
Knock.chgRel = function(id, cb){
    pool.getConnection(function (err, conn){
        var sql = "UPDATE Relation SET relation = 1 where r_id = ?";
        conn.query(sql, id, function(err, results){
            if(err){
                //err.code = 500;
                conn.rollback();
                conn.release();
                return cb(err, {msg: "Failure"});
            }
            conn.commit();
            conn.release();
            return cb(null, {msg : 'Success'});
        });
    });
}

Knock.today = function(id, cb){
    pool.getConnection(function (err, conn){
        const sql = "SELECT receiver as u_id, c.type, d.type as favor FROM Destiny d, Characters c, User u WHERE d.sender = ? AND d.receiver = u.u_id AND u.c_id = c.c_id order by d.date desc limit 3";
        conn.query(sql, id, function(err, results){
            if (err) {
                //err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            
            conn.release();
            return cb(null, {msg : 'Success', data: results});
        });
    });
}

function selection1(id, conn, td){
    //const sql1 = "SELECT u.u_id FROM User u, Characters c WHERE u.c_id = c.c_id AND u_id != ? AND u.c_id = (SELECT c_id FROM User WHERE u_id = ?) AND u.u_id NOT IN (SELECT receiver FROM Destiny WHERE sender = ?) AND u.age BETWEEN (SELECT age_max FROM User WHERE u_id = ?) AND (SELECT age_min FROM User WHERE u_id = ?) order by rand() limit 1";
    const sql1 = "SELECT u.u_id FROM User u, Characters c WHERE u.c_id = c.c_id AND u_id != ? AND u.c_id = (SELECT c_id FROM User WHERE u_id = ?) AND u.u_id NOT IN (SELECT receiver FROM Destiny WHERE sender = ?) order by rand() limit 1";
    conn.query(sql1, [id, id, id], (err, result) =>{
        if(err){
            //err.code = 500;
            return td(err, {msg: 'Failure'});
        }
        if(result.length == 0){
            //err.code = 404;
            return td(null, {msg: 'No result'});
        }else{
            const u_id = result[0].u_id;
            //console.log(u_id);
            const sql2 = "INSERT INTO Destiny SET sender = ?, receiver = ?, type = '성향이 같은'";
            conn.query(sql2, [id, u_id], (err, result) =>{
                if(err){
                    //err.code = 500;
                    conn.rollback();
                    return td(err, {msg: 'Failure'});
                }
                return td(null);
            });
        }
    });
}

function selection2(id, conn, td){
    const sql1 = "SELECT u.u_id, c.type FROM User u, Characters c WHERE u.c_id = c.c_id AND u.c_id IN (SELECT id FROM Other WHERE c_id= (SELECT c_id FROM User WHERE u_id= ?) AND similar=1 order by rand()) AND u.u_id NOT IN (SELECT receiver FROM Destiny WHERE sender = ?) order by rand() limit 1";
    conn.query(sql1, [id, id], (err, result) =>{
        if(err){
           //err.code = 500;
            return td(err, {msg: 'Failure'});
        }
        if(result.length == 0){
            //err.code = 404;
            return td(null, {msg: 'No result'});
        }else{
            const u_id = result[0].u_id;
            const sql2 = "INSERT INTO Destiny SET sender = ?, receiver = ?, type = '성향이 비슷한'";
            conn.query(sql2, [id, u_id], (err, result) =>{
                if(err){
                    //err.code = 500;
                    conn.rollback();
                    return td(err, {msg: 'Failure'});
                }
                return td(null);
            });
        }
    });
}

function selection3(id, conn, td){
    const sql1 = "SELECT u.u_id, c.type FROM User u, Characters c WHERE u.c_id = c.c_id AND u.c_id IN (SELECT id FROM Other WHERE c_id= (SELECT c_id FROM User WHERE u_id= ?) AND similar=0 order by rand()) AND u.u_id NOT IN (SELECT receiver FROM Destiny WHERE sender = ?) order by rand() limit 1";
    conn.query(sql1, [id, id], (err, result) =>{
        if(err){
            //err.code = 500;
            return td(err, {msg: 'Failure'});
        }
        if(result.length == 0){
            //err.code = 404;
            return td(null, {msg: 'No result'});
        }else{
            const u_id = result[0].u_id;
            const sql2 = "INSERT INTO Destiny SET sender = ?, receiver = ?, type = '성향이 다른'";
            conn.query(sql2, [id, u_id], (err, result) =>{
                if(err){
                    //err.code = 500;
                    conn.rollback();
                    return td(err, {msg: 'Failure'});
                }
                return td(null);
            });
        }
    });
}

Knock.refresh = function(id, cb){
    pool.getConnection(function (err, conn){
        async.series(
            [
                function task1(done) {
                    selection1(id, conn, function(err){
                        if(err){
                            done(err);
                        }else{
                            done(null);
                        }
                    });
                },
                function task2(done) {
                    selection2(id, conn, function(err){
                        if(err){
                            done(err,null);
                        }else{
                            done(null);
                        }
                    });
                },
                function task3(done) {
                    selection3(id, conn, function(err){
                        if(err){
                            done(err,null);
                        }else{
                            done(null);
                        }
                    });
                },
                function task4(done) {
                    Knock.today(id, function(err, result){
                        if(err){
                            done(err,null);
                        }else{
                            done(null,result);
                        }
                    })
                }
            ],
            function(err, result){
                if(err){
                    return cb(err, err.message);
                }
                conn.commit();
                conn.release();
                return cb(null, result[3]);
            }
        );
    });
}


module.exports = Knock;