const pool = require('./dbConnection');

class Quiz {
}

Quiz.getQuiz = function(cb){
    pool.getConnection(function (err, conn) {
      const sql = 'SELECT q_id, question1, question2, answer1, answer2 FROM Quiz where date = current_date();';
      conn.query(sql, function (err, results) {
         if (err) {
            err.code = 500;
            conn.release();
            return cb(err, {msg: 'Failure'});
         }

         if (results.length == 0) {
            conn.release();
            return cb(err, {msg: 'No result'});
         }

         const quiz = results[0];
         quiz.msg="Success";
         //console(quiz);
         conn.release();
         return cb(null, quiz); 
      });
   });
}

Quiz.addQuiz = function(info, cb){
    pool.getConnection((err,conn) =>{
        if(err){
            err = 500;
            return cb(err, {msg: 'Failure..'});
        }
        const sql = "INSERT INTO Quiz SET ?";
        conn.query(sql, info, (err, result) =>{
            conn.commit();
            conn.release();
            return cb(null, {msg : "Success"});
        });
    });
}


Quiz.addAnswer = function(info, cb){
    pool.getConnection((err,conn) =>{
        if(err){
            err = 500;
            return cb(err, {msg: 'Failure.'});
        }
        const sql = "INSERT INTO Answer SET ?";
        conn.query(sql, info, (err, result) =>{
            conn.commit();
            conn.release();
            return cb(null, {msg : "Success"});
        });
    });
}

module.exports = Quiz;