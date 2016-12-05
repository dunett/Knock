var async = require('async');
const pool = require('./dbConnection');

class Menu{

}

Menu.showNotice = function(cb){
    pool.getConnection(function(err, conn){
        const sql = 'SELECT title, description, contents, date FROM Notice order by date desc';
        conn.query(sql, function(err, results){
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            return cb(null, {msg: 'Success', list: results});
        })
    })
}

Menu.addNotice = function(info, cb){
    pool.getConnection(function(err, conn){
        const sql = 'INSERT INTO Notice SET ?'
        conn.query(sql, info, (err, result) =>{
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            conn.commit();
            conn.release();
            return cb(null, {msg: 'Success'});
        })
    })
}

Menu.showBoard = function(id, cb){
    pool.getConnection(function(err, conn){
        const sql = 'SELECT u.name, b.question, b.answer, b.q_date, b.a_date FROM Board b, User u WHERE b.writer = ? AND b.writer = u.u_id order by b.q_date desc';
        conn.query(sql, id, function(err, results){
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            return cb(null, {msg: 'Success', list: results});
        })
    })
}

Menu.showQuestion = function(cb){
    pool.getConnection(function(err, conn){
        const sql = 'SELECT b.b_id, u.alias, b.question FROM User u, Board b WHERE u.u_id = b.writer AND b.answer is null order by q_date asc limit 1';
        conn.query(sql,function(err, results){
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            return cb(null, results);
        })
    })
}

Menu.addQuestion = function(info, cb){
    pool.getConnection(function(err, conn){
        const sql = 'INSERT INTO Board SET ?';
        conn.query(sql, info, (err, result) =>{
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            conn.commit();
            conn.release();
            return cb(null, {msg : "Success"});
        });
    })
}

Menu.addAnswer = function(ans, id, cb){
    pool.getConnection(function(err, conn){
        const sql = 'UPDATE Board SET answer = ?, a_date = now() WHERE b_id = ?';
        conn.query(sql, [ans, id], (err, result) =>{
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            conn.commit();
            conn.release();
            return cb(null, {msg : "Success"});
        })
    })
}

Menu.showAnalysis = function(cb){
    pool.getConnection(function(err, conn){
        const sql = 'SELECT c.type , count(*) as count FROM User u, Characters c WHERE u.c_id=c.c_id group by u.c_id';
        conn.query(sql,function(err, results){
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            return cb(null, results);
        })
    })
}

Menu.showAlarm = function(id, cb){
    pool.getConnection(function(err, conn){
        const sql = 'SELECT alarm1, alarm2, alarm3 FROM User WHERE u_id = ?';
        conn.query(sql,id,function(err, results){
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            return cb(null, {msg: 'Success', data:results});
        })
    })
}

Menu.chgAlarm = function(info, id, cb){
    pool.getConnection(function(err, conn){
        const sql = 'UPDATE User SET ? WHERE u_id = ?';
        conn.query(sql, [info, id], (err, result) =>{
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            conn.commit();
            conn.release();
            return cb(null, {msg : "Success"});
        })
    })
}

Menu.showReport = function(cb){
    pool.getConnection(function(err, conn){
        const sql = 'SELECT r.r_id, u.alias , r.sender, r.message FROM User u, Report r WHERE u.u_id = r.sender AND r.process = 0 order by r.date desc limit 5';
        conn.query(sql,function(err, results){
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            return cb(null, results);
        })
    })
}

Menu.blockUser = function(rid, uid, check, cb){
    //console.log(check);
    if(check==1){
        pool.getConnection(function(err, conn){
        const sql = 'UPDATE User SET status = 2 WHERE u_id = ?';
        conn.query(sql, uid, (err, result) =>{
            if(err){
                err.code = 500;
                conn.rollback();
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            const sql = 'UPDATE Report SET process = 1 WHERE r_id = ?';
            conn.query(sql, rid, (err,result) =>{
                if(err){
                    conn.rollback();
                    conn.release();
                    return cb(err, {msg: 'Failure'});
                }
                conn.commit();
                conn.release();
                return cb(null, {msg : "Success"});
            })
        })
    })
    }else{
        pool.getConnection(function(err, conn){
            const sql = 'UPDATE Report SET process = 1 WHERE r_id = ?';
            conn.query(sql, rid, (err,result) =>{
                if(err){
                    conn.release();
                    return cb(err, {msg: 'Failure'});
                }
                conn.commit();
                conn.release();
                return cb(null, {msg : "Success"});
            });
        })
    }
    
}

Menu.showNew = function(id, cb){
    pool.getConnection(function(err,conn){
        async.series(
            [
                function task1(done) {
                    const sql = 'SELECT count(*) as count FROM Relation WHERE (sender = ? AND relation = 1 AND see = 1) OR (receiver = ? AND relation = 1 AND see = 1) OR (relation = 0 AND receiver = ? AND see = 1)';
                        conn.query(sql, [id, id, id], function(err, result){
                            if(err){
                                return done(err);
                            }
                            if(result[0].count > 0){
                                //New
                                return done(null, {right: 1});
                            }else{
                                return done(null, {right: 0});
                            }
                        })
                },
                function task2(done) {
                    const sql = 'SELECT count(*) as count FROM Destiny WHERE sender = ? AND see = 1';
                        conn.query(sql, id, (err, result)=>{
                            if(err){
                                return done(err);
                            }
                            if(result[0].count > 0){
                                //New
                                return done(null, {left: 1});
                            }else{
                                return done(null, {left: 0});
                            }
                        })
                }
            ],
            function(err, results){
               if(err){
                    return cb(err, err.message);
                }
                conn.release();
                return cb(null, {new: results);
            }
        );
    });
}

Menu.leftClear = function(id, cb){
    pool.getConnection(function(err, conn){
        const sql = 'UPDATE Destiny SET see = 0, s_date = now() WHERE see = 1 AND sender = ?';
        conn.query(sql, id, function(err, result){
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            conn.commit();
            conn.release();
            return cb(null, {msg : "Success"});
        })
    })
}    

Menu.rightClear = function(id, cb){
    pool.getConnection(function(err, conn){
        const dql = 'UPDATE Relation SET see = 0, s_date = now() WHERE r_id = ?';
        conn.query(sql, id, function(err, result){
            if(err){
                err.code = 500;
                conn.release();
                return cb(err, {msg: 'Failure'});
            }
            conn.commit();
            conn.release();
            return cb(null, {msg : "Success"});
        })
    })
}

module.exports = Menu;