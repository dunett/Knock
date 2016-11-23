const pool = require('./dbConnection');

class Chat {
}

/**
 * Get r_id and u_id of other party from my u_id
 * Params:
 *  - u_id: [1, 2, 3, 4, 5]
 * Return:
 *  - {r_id: 1, u_id: 3}
 */
Chat.getRoomOtherUidByMyUid = (u_id, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    const sql = 'SELECT r_id, sender, receiver FROM Relation WHERE sender = ? OR receiver = ?';
    conn.query(sql, [u_id, u_id], (err, relations) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      let result = [];

      // Extract the other uid from the result
      for (let relation of relations) {
        let youId = (relation.sender == u_id) ? relation.receiver : relation.sender;

        result.push({
          'r_id': relation['r_id'],
          'u_id': youId,
        });
      }

      conn.release();
      return callback(null, result);
    });
  });
};


module.exports = Chat;