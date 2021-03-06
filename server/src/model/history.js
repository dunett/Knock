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
        const sql = 'SELECT r_id, u_id, age, alias, image, favor_r as favor, see, gender FROM User u, Relation r, Characters c WHERE u.u_id in (SELECT receiver FROM Relation WHERE sender = ? AND relation = 1) AND u.u_id = r.receiver AND u.c_id = c.c_id union SELECT r_id, u_id, age, alias, image, favor_s as favor, see, gender FROM User u, Relation r, Characters c WHERE u.u_id in (SELECT sender FROM Relation WHERE receiver = ? AND relation = 1) AND u.u_id = r.sender AND u.c_id = c.c_id';
        conn.query(sql, [id, id], (err, results) =>{
            var three;
            const cnt = results.length;
            if(cnt == 0){
                return cb(err, {msg: 'No result'});
            }
            for(var i=0; i<results.length; i++){
                if(results[i].gender == 1){
                    results[i].image = 'https://s3.ap-northeast-2.amazonaws.com/tacademy-knock/image/man_icn/thumbnail/'+results[i].image;
                }else{
                    results[i].image = 'https://s3.ap-northeast-2.amazonaws.com/tacademy-knock/image/woman_icn/thumbnail/'+results[i].image;
                }
            }
            var three = results.slice(0,3);
            var other = results.slice(3,results.length);
            conn.release();
            return cb(null, {msg: "Success", data: {count: cnt, one: three, two: other}});
        })
    })
}
//나에게 노크한 사람
History.meHistory = function(id, cb){
    pool.getConnection(function(err, conn){
        //const sql = 'SELECT u_id, age, alias, thumbnail FROM User WHERE u_id in (SELECT sender FROM Relation WHERE receiver = ? AND relation = 0)';
        const sql = 'SELECT r_id, u_id, age, alias, image, gender, see FROM User u, Relation r, Characters c WHERE u_id in (SELECT sender FROM Relation WHERE receiver = ? AND relation = 0) and u.u_id = r.sender and u.c_id = c.c_id order by r.date desc'
        conn.query(sql, id, (err, results) =>{
            var three = "[{";
            const cnt = results.length;
            if(cnt == 0){
                return cb(err, {msg: 'No result'});
            }
            for(var i=0; i<results.length; i++){
                if(results[i].gender == 1){
                    results[i].image = 'https://s3.ap-northeast-2.amazonaws.com/tacademy-knock/image/man_icn/thumbnail/'+results[i].image;
                }else{
                    results[i].image = 'https://s3.ap-northeast-2.amazonaws.com/tacademy-knock/image/woman_icn/thumbnail/'+results[i].image;
                }
            }
            var three = results.slice(0,3);
            var other = results.slice(3,results.length);
            conn.release();
            return cb(null, {msg: "Success", data: {count: cnt, one: three, two: other}});
        })
    })
}
//너에게 노크한 사람
History.youHistory = function(id, cb){
    pool.getConnection(function(err, conn){
        //const sql = 'SELECT u_id, age, alias, thumbnail FROM User WHERE u_id in (SELECT receiver FROM Relation WHERE sender = 1 AND relation = 0)';
        const sql = 'SELECT r_id, u_id, age, alias, image, gender FROM User u, Relation r, Characters c WHERE u_id in (SELECT receiver FROM Relation WHERE sender = ? AND relation = 0) and u.u_id = r.receiver and u.c_id = c.c_id order by r.date desc'
        conn.query(sql, id, (err, results) =>{
            const cnt = results.length;
            if(cnt == 0){
                return cb(err, {msg: 'No result'});
            }
            for(var i=0; i<results.length; i++){
                if(results[i].gender == 1){
                    results[i].image = 'https://s3.ap-northeast-2.amazonaws.com/tacademy-knock/image/man_icn/thumbnail/'+results[i].image;
                }else{
                    results[i].image = 'https://s3.ap-northeast-2.amazonaws.com/tacademy-knock/image/woman_icn/thumbnail/'+results[i].image;
                }
            }
            var three = results.slice(0,3);
            var other = results.slice(3,results.length);
            conn.release();
            return cb(null, {msg: "Success", data: {count: cnt, one: three, two: other}});
        })
    })
}
//지나간 사람
History.pastHistory = function(id, cb){
    pool.getConnection(function(err, conn){
        const sql = 'SELECT r_id, u_id, age, alias, image, favor_r as favor, see, gender FROM User u, Relation r, Characters c WHERE u.u_id in (SELECT receiver FROM Relation WHERE sender = ? AND relation = 1) AND u.u_id = r.receiver AND u.c_id = c.c_id union SELECT r_id, u_id, age, alias, image, favor_s as favor, see, gender FROM User u, Relation r, Characters c WHERE u.u_id in (SELECT sender FROM Relation WHERE receiver = ? AND relation = 1) AND u.u_id = r.sender AND u.c_id = c.c_id';
        conn.query(sql, [id, id, id], (err, results) =>{
            const cnt = results.length;
            if(cnt == 0){
                return cb(err, {msg: 'No result'});
            }
            for(var i=0; i<results.length; i++){
                if(results[i].gender == 1){
                    results[i].image = 'https://s3.ap-northeast-2.amazonaws.com/tacademy-knock/image/man_icn/thumbnail/'+results[i].image;
                }else{
                    results[i].image = 'https://s3.ap-northeast-2.amazonaws.com/tacademy-knock/image/woman_icn/thumbnail/'+results[i].image;
                }
            }
            var three = results.slice(0,3);
            var other = results.slice(3,results.length);
            conn.release();
            return cb(null, {msg: "Success", data: {count: cnt, one: three, two: other}});
        })
    })
}
module.exports = History;