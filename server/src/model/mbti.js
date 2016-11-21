var pool = require('./dbConnection');

class Mbti {
}

const Calculate_Index = 10;
const Sense_Type = 'S';
const Intuition_Type = 'N';

const A_Type = 'A';
const B_Type = 'B';
const C_Type = 'C';
const D_Type = 'D';
const E_Type = 'E';

const Answer_Char = '0';
const Answer_Char2 = '1';

Mbti.getMbtiTest = (callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    const sql = 'SELECT question, answer1, answer2 from Inspect';
    conn.query(sql, (err, rows) => {
      if (err) {
        conn.release();
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

Mbti.editCharacterOfUser = (u_id, answers, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    // get values for the answer
    const sql_inspect_values = 'SELECT VALUE1, VALUE2 from Inspect';
    conn.query(sql_inspect_values, (err, values) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      // Calculate mbti test
      const type1 = calculateMbti(answers, values);
      const type2 = calculateLoveLanguage(answers, values);

      // Get character id
      // NA, SA, NB, SB, NC, SC, ND, SD, NE, SE
      let c_id = 0;
      switch (type2) {
        case A_Type:
          c_id = (type1 == Intuition_Type) ? 1 : 2;
          break;
        case B_Type:
          c_id = (type1 == Intuition_Type) ? 3 : 4;
          break;
        case C_Type:
          c_id = (type1 == Intuition_Type) ? 5 : 6;
          break;
        case D_Type:
          c_id = (type1 == Intuition_Type) ? 7 : 8;
          break;
        case E_Type:
          c_id = (type1 == Intuition_Type) ? 9 : 10;
          break;
        default:
          conn.release();
          return callback(new Error('Cannot find character'));
      }

      const sql_update_character = 'UPDATE User SET c_id = ? where u_id = ?';
      conn.query(sql_update_character, [c_id, u_id], (err, row) => {
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

Mbti.getMyMbtiType = (u_id, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    // Get type information after joining tables User and Characters  
    const sql = 'SELECT type, image, description from User as U, Characters as C where U.c_id = C.c_id and U.u_id = ?';
    conn.query(sql, [u_id], (err, rows) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      let result = {};
      if (rows.length > 0) {
        result['msg'] = 'Success';
        result['type'] = rows[0].type;
        result['image'] = rows[0].image;
        result['description'] = rows[0].description;
      }

      conn.release();

      return callback(null, result);
    });
  });
};

Mbti.getOtherMbtiType = (u_id, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      return callback(err);
    }

    const sql_characters = 'SELECT * FROM Characters';
    conn.query(sql_characters, (err, characters) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      // Select simliar and other c_id from Other table
      const sql_other = 'SELECT id from Other WHERE c_id = (SELECT c_id from User WHERE u_id = ?)';
      conn.query(sql_other, [u_id], (err, others) => {
        if (err) {
          conn.release();
          return callback(err);
        }

        let result = {};
        result['msg'] = 'Success';
        result['data'] = [];

        // make a result data
        for (let other of others) {
          let findedType = characters.filter(char => {
            return char.c_id === other.id;
          })[0];

          result['data'].push({
            type: findedType.type,
            image: findedType.image,
            description: findedType.description
          });
        }

        conn.release();
        return callback(null, result);
      });
    });
  });
};

/**
 * Calucate wheter it is sense type or intuition type
 * params:
 *  - answer: User entered answer
 *  - values: Value according to user-entered answer
 */
function calculateMbti(answers, values) {
  let types = [];

  for (let i = 0; i < Calculate_Index; i++) {
    if (answers[i].answer == Answer_Char) {
      types.push(values[i].VALUE1);
    } else {
      types.push(values[i].VALUE2);
    }
  }

  const sense = types.filter(type => {
    return type == Sense_Type;
  });

  return (sense.length >= (Calculate_Index / 2)) ? Sense_Type : Intuition_Type;
}

/**
 * Calucate wheter it is A type ~ E type
 */
function calculateLoveLanguage(answers, values) {
  let types = [];

  for (let i = Calculate_Index; i < answers.length; i++) {
    if (answers[i].answer == Answer_Char) {
      types.push(values[i].VALUE1);
    } else {
      types.push(values[i].VALUE2);
    }
  }

  // To sort all types
  const aTypes = types.filter(type => {
    return type == A_Type;
  });

  const bTypes = types.filter(type => {
    return type == B_Type;
  });

  const cTypes = types.filter(type => {
    return type == C_Type;
  });

  const dTypes = types.filter(type => {
    return type == D_Type;
  });

  const eTypes = types.filter(type => {
    return type == E_Type;
  });

  let sortedTypes = [
    aTypes,
    bTypes,
    cTypes,
    dTypes,
    eTypes
  ];

  // sort descending
  sortedTypes.sort((arr1, arr2) => {
    return arr2.length - arr1.length;
  });

  // Select two array. Because the two types may be the same.
  const maxType1 = sortedTypes[0];
  const maxType2 = sortedTypes[1];

  if (maxType1.length === maxType2.length) {
    // If the lengths of type1 and type2 are the same, compare answer user entered
    const valueOfType1 = maxType1[0];
    const valueOfType2 = maxType2[0];

    const findIndex = values.findIndex(value => {
      return (value.VALUE1 == valueOfType1 && value.VALUE2 == valueOfType2);
    });

    if (findIndex >= 0) {
      return (answers[findIndex] == Answer_Char) ? valueOfType1 : valueOfType2;
    } else {
      return valueOfType1;
    }
  } else {
    return maxType1[0];
  }
}

module.exports = Mbti;
module.exports.Char = {
  Answer_Char,
  Answer_Char2
};