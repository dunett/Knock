const pool = require('./dbConnection');

class Report {
}

/**
 * Save the report to the database
 * Params:
 *  - arg: {}
 *    - r_id: room id
 *    - sender: bad user id
 *    - message: chat message
 */
Report.saveReport = (arg, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    const sql = 'INSERT INTO Report(r_id, sender, message) VALUES(?, ?, ?)';
    conn.query(sql, [arg.r_id, arg.sender, arg.message], (err, rows) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      conn.release();
      return callback(null, { msg: 'Success' });
    });
  });
};

module.exports = Report;