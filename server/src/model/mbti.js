var pool = require('./dbConnection');

class Mbti {
}

Mbti.getMbtiTest = (callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    const sql = 'SELECT question, answer1, answer2 from Inspect';
    conn.query(sql, (err, rows) => {
      if (err) {
        return callback(err);
      }    
      
      let result = {};
      let datas = [];
      
      // split question into two parts
      rows.forEach(item => {
        let questions = item.question.split('_');
        datas.push({
          question1: questions[0],
          question2: questions[1],
          answer1: item.answer1,
          answer2: item.answer2
        });
      });

      conn.release();

      result = {
        msg: 'Success',
        data: datas
      };

      return callback(null, result);
    });
  });
};

Mbti.editCharacterOfUser = (callback) => {
  pool.getConnection((err, conn) => {
    if(err) {
      return callback(err);
    }

    const sql = 'SELECT ';
  });
};

module.exports = Mbti;