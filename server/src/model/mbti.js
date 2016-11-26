const pool = require('./dbConnection');
const async = require('async');

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

const Feature_Random_Count = 7;

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

      result = {
        msg: 'Success',
        data: rows
      };

      conn.release();
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

    // 1. get c_id from User table
    // 2. get type, image, description from Characters table
    // 3. get feature from feature table
    const sql = 'select type, image, description, f_type from Characters as C, Feature as F where C.c_id = F.c_id and C.c_id = (select c_id from User where u_id = ?)';
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

        // make a feature array 
        let feature = [];
        for (let row of rows) {
          feature.push(row['f_type']);
        }

        const randomfeature = randomizeFeature(feature);
        result['feature'] = randomfeature;
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

    async.waterfall([
      function getCharacters(cb) {
        const sql_characters = 'SELECT * FROM Characters';
        conn.query(sql_characters, (err, characters) => {
          if (err) {
            return cb(err);
          }

          cb(null, characters);
        });
      },
      function getFeature(characters, cb) {
        const sql_feature = 'SELECT * FROM Feature';
        conn.query(sql_feature, (err, features) => {
          if (err) {
            return cb(err);
          }

          cb(null, characters, features);
        });
      },
      function getOtherForOrder(characters, features, cb) {
        // 같은 타입, 비슷한 타입, 다른 타입 순서로 c_id를 구한다
        const sql_other = 'SELECT c_id AS id from User WHERE u_id = ? UNION SELECT id from Other WHERE c_id = (SELECT c_id from User WHERE u_id = ?)';
        conn.query(sql_other, [u_id, u_id], (err, others) => {
          if (err) {
            return cb(err);
          }

          let result = {};
          result['msg'] = 'Success';
          result['data'] = [];

          // make a result data
          for (let other of others) {
            let findedType = characters.filter(char => {
              return char.c_id === other.id;
            })[0];

            // join features like 상상력/이상
            let findedFeatures = features.filter(feature => {
              return feature.c_id === other.id;
            });

            const featuresStr = findedFeatures.map(feature => {
              return feature.f_type;
            }).join('/');

            result['data'].push({
              type: findedType.type,
              image: findedType.image,
              description: findedType.description,
              explain: findedType.explain,
              feature: featuresStr,
            });
          }

          cb(null, result);
        });
      }
    ], (err, result) => {
      if (err) {
        conn.release();
        return callback(err);
      }

      conn.release();
      return callback(null, result);
    });

    // const sql_characters = 'SELECT * FROM Characters';
    // conn.query(sql_characters, (err, characters) => {
    //   if (err) {
    //     conn.release();
    //     return callback(err);
    //   }

    //   // Select simliar and other c_id from Other table
    //   const sql_other = 'SELECT c_id AS id from User WHERE u_id = ? UNION SELECT id from Other WHERE c_id = (SELECT c_id from User WHERE u_id = ?)';
    //   conn.query(sql_other, [u_id, u_id], (err, others) => {
    //     if (err) {
    //       conn.release();
    //       return callback(err);
    //     }

    //     let result = {};
    //     result['msg'] = 'Success';
    //     result['data'] = [];

    //     // make a result data
    //     for (let other of others) {
    //       let findedType = characters.filter(char => {
    //         return char.c_id === other.id;
    //       })[0];

    //       result['data'].push({
    //         type: findedType.type,
    //         image: findedType.image,
    //         description: findedType.description,
    //         explain: findedType.explain,
    //       });
    //     }

    //     conn.release();
    //     return callback(null, result);
    //   });
    // });


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

/**
 * Params:
 *  - feature sample: [ 'example01', 'example02' ..., 'example10' ]
 */
function randomizeFeature(feature) {
  if (!(feature instanceof Array)) {
    return [];
  }

  let randomIndex = [];
  let length = feature.length;
  let result = [];

  // extract randomly
  while (randomIndex.length < Feature_Random_Count) {
    let randomNumber = Math.floor(Math.random() * length);
    if (randomIndex.indexOf(randomNumber) > -1) continue;
    randomIndex[randomIndex.length] = randomNumber;
  }

  // sorting
  randomIndex.sort((value1, value2) => {
    return value1 - value2;
  });

  for (let idx of randomIndex) {
    result.push(feature[idx]);
  }

  return result;
}

module.exports = Mbti;
module.exports.Char = {
  Answer_Char,
  Answer_Char2
};