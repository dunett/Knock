var pool = require('./dbConnection');

class User {
}

User.isExistedUser = (u_id, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    const sql = 'SELECT COUNT(*) as count from User WHERE u_id = ?';
    conn.query(sql, [u_id], (err, rows) => {
      if(err) {
        conn.release();
        return callback(err);
      }

      conn.release();
      return callback(null, rows[0]);
    });
  });
};

module.exports = User;