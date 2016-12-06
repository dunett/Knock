const pool = require('./dbConnection');

class Report {
}

/**
 * Save the report to the database
 * Params:
 *  - arg: {}
 *    - sender: bad user id
 *    - message: chat message
 */
Report.saveReport = (arg, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    const sql = 'INSERT INTO Report(sender, message) VALUES(?, ?)';
    conn.query(sql, [arg.sender, arg.message], (err, rows) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      conn.release();
      return callback(null, { msg: 'Success' });
    });
  });
};

/**
 * This is function for unit test 
 */
Report.deleteTestReport = () => {
  pool.getConnection((err, conn) => {
    if (err) {
      return ;
    }

    const sql = 'DELETE FROM Report WHERE sender = 10000';
    conn.query(sql, (err, result) => {
      conn.release();
    });
  });
};

module.exports = Report;