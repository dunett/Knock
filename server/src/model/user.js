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
      if (err) {
        conn.release();
        return callback(err);
      }

      conn.release();
      return callback(null, rows[0]);
    });
  });
};

/**
 * Get Alias and thumbnail of multi user
 * Params:
 *  - u_ids: [{r_id: 1, u_id: 2}, ...]
 * Return:
 *  - [{u_id: 3, alias: 'KK', thumbnail: 'url'}, ...]
 */
User.getProfilesByUid = (u_ids, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    const sql = 'SELECT u_id, alias, thumbnail FROM User WHERE u_id IN (?)';
    conn.query(sql, [u_ids], (err, profiles) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      conn.release();
      return callback(null, profiles);
    });
  });
};

module.exports = User;