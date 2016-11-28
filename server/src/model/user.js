var pool = require('./dbConnection');

const Quiz_Limit_Count = 7;
const Status_Normal = 1;
const Status_Sleep = 3;

class User {
}

/**
 * Check if the alias exists 
 */
User.isExistedAlias = (alias, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    const sql = 'SELECT COUNT(*) as count from User where alias = ?';
    conn.query(sql, [alias], (err, count) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      conn.release();
      return callback(null, count[0]);
    });
  });
};

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
 * Add new user to database
 * Params:
 *  - user: email, alias, gender, area, age, job, faith, hobby
 */
User.addUser = (user, callback) => {
  pool.getConnection((err, conn) => {
    if(err) {
      return callback(err);
    }

    // TODO: Not finish
    const sql = 'INSERT INTO User SET ?';
  });
};

/**
 * Get Alias and thumbnail of multi user
 * Params:
 *  - u_ids: [{r_id: 1, u_id: 2}, ...]
 * Return:
 *  - [{u_id: 3, alias: 'KK', thumbnail: 'url'}, ...]
 */
User.getAliasAndThumbnailByUid = (u_ids, callback) => {
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

/**
 * Get user profile
 * Params:
 *  - u_id: user id
 */
User.getProfileByUid = (u_id, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    // 1. select user profile
    const sql_profile = 'SELECT name, alias, age, area, thumbnail, profile, job, height, fit, faith, hobby, status, type, description from User as U, Characters as C WHERE U.c_id = C.c_id and U.u_id = ?';
    conn.query(sql_profile, [u_id], (err, profiles) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      if (profiles.length === 0) {
        conn.release();
        return callback(new Error('Not found user'));
      }

      // 2. select quiz answer as limit count
      const sql_quiz = `SELECT question1, question2, answer1, answer2, answer FROM Quiz, Answer WHERE Answer.q_id = Quiz.q_id and Answer.u_id = ? order by Answer.date desc limit ${Quiz_Limit_Count}`;
      conn.query(sql_quiz, [u_id], (err, rows) => {
        if (err) {
          conn.release();
          return callback(err);
        }

        // Combine profile and quiz
        const profile = profiles[0];
        profile.msg = 'Success';
        profile.quiz = rows;

        conn.release();
        return callback(null, profile);
      });
    });
  });
};

/**
 * Update user profile 
 * Params:
 *  - args:
 *     - u_id, job, height, fit, faith, hobby, profile, thumbnail
 */
User.editProfileByUid = (args, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    let sql = 'UPDATE User SET ? WHERE u_id = ?';

    let param = {};
    if (args.job) param.job = args.job;
    if (args.height) param.height = args.height;
    if (args.fit) param.fit = args.fit;
    if (args.faith) param.faith = args.faith;
    if (args.hobby) param.hobby = args.hobby;
    if (args.profile) param.profile = args.profile;
    if (args.thumbnail) param.thumbnail = args.thumbnail;

    conn.query(sql, [param, args.u_id], (err, result) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      conn.release();
      return callback(null, result);
    });
  });
};

/**
 * Get Profile and thumbnail
 * Return: 
 *  - {profile: '', thumbnail: ''}
 */
User.getProfileAndThumbnailByUid = (u_id, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    const sql = 'SELECT profile, thumbnail FROM User WHERE u_id = ?';
    conn.query(sql, [u_id], (err, images) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      conn.release();
      return callback(null, images[0]);
    });
  });
};

/**
 * Toggle status of user to Normal or Sleep
 * Status:
 *  - 1: Normal
 *  - 3: Sleep 
 */
User.toggleStatusByUid = (u_id, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    //const sql = 'UPDATE User SET status = IF(status = 1, 3, 1) where u_id = ?';
    const sql = `UPDATE User SET status = IF(status = ${Status_Normal}, ${Status_Sleep}, ${Status_Normal}) where u_id = ?`;
    conn.query(sql, [u_id], (err, result) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      conn.release();
      return callback(null, { msg: 'Success' });
    });
  });
};

module.exports = User;