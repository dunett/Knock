const pool = require('./dbConnection');

class Relation {
}

/**
 * Get r_id and u_id of other party from my u_id
 * Params:
 *  - u_id: [1, 2, 3, 4, 5]
 * Return:
 *  - {r_id: 1, u_id: 3}
 */
Relation.getRoomOtherUidByMyUid = (u_id, callback) => {
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

/**
 * Toggle the state of wish list
 * Change
 * Params:
 *  - r_id: relation id
 *  - u_id: u_id of other party
 */
Relation.toggleToWishlist = (r_id, u_id, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    // Check whether the other party's ID is sender or receiver.
    const sql_isSender = 'SELECT sender, receiver, favor_s, favor_r FROM Relation WHERE r_id = ?';
    conn.query(sql_isSender, [r_id], (err, rows) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      if (rows.length < 1) {
        conn.release();
        return callback(new Error(`Not found relation ${r_id}`));
      }

      // Toggle the favor state to 0 or 1
      const relation = rows[0];

      let sql_update_favor = 'UPDATE Relation set ';
      let isSender = relation.sender == u_id;
      let isReceiver = relation.receiver == u_id;
      let nextFavor = 0;

      if (isSender) {
        nextFavor = (relation.favor_s === 0) ? 1 : 0;
        sql_update_favor += `favor_s = ${nextFavor} WHERE r_id = ?`;
      } else if (isReceiver) {
        nextFavor = (relation.favor_r === 0) ? 1 : 0;
        sql_update_favor += `favor_r = ${nextFavor} WHERE r_id = ?`;
      } else {
        conn.release();
        return callback(new Error('Not found user id'));
      }

      conn.query(sql_update_favor, [r_id], (err, rows) => {
        if (err) {
          conn.release();
          return callback(err);
        }

        conn.release();
        return callback(null, { msg: 'Success' });
      });
    });
  });
};

module.exports = Relation;