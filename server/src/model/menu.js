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

module.exports = Menu;