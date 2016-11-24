const express = require('express');
const router = express.Router();

const Chat = require('../model/chat');
const Relation = require('../model/relation');
const User = require('../model/user');

/**
 * 채팅 목록
 * GET /chat/list/:u_id
 */
router.get('/chat/list/:u_id', (req, res, next) => {
  // validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  // 1. Get r_id and u_id of other party from mysql 
  Relation.getRoomOtherUidByMyUid(u_id, (err, relations) => {
    if (err) {
      return next(err);
    }

    if (relations.length === 0) {
      return res.send({ msg: 'Not found relation' });
    }

    let u_ids = []; // Ids of people who talked to me
    let r_ids = []; // Room ids of people who talked to me

    // Extract u_id for conditional statements(WHERE IN)
    for (let relation of relations) {
      u_ids.push(relation['u_id']);
      r_ids.push(relation['r_id']);
    }

    // 2. Get alias, thumbnail with other u_id
    User.getAliasAndThumbnailByUid(u_ids, (err, profiles) => {
      if (err) {
        return next(err);
      }

      // Combine query results 1 and 2 
      for (let relation of relations) {
        let id = relation['u_id'];
        let find = profiles.filter((profile) => {
          return profile['u_id'] == id;
        })[0];

        relation['alias'] = find.alias;
        relation['thumbnail'] = find.thumbnail;
      }

      // 3. Get lastest message from mongodb
      Chat.getLatestMessagesByRid(r_ids, (err, lastMessages) => {
        if (err) {
          return next(err);
        }

        if(lastMessages.msg !== 'Success') {
          return res.send(lastMessages);
        }

        // 4. Get the number of unread messages
        // Combine aliases to get chat message
        let aliases = [];
        for (let id of r_ids) {
          let relation = relations.filter((item) => {
            return item.r_id == id;
          })[0];
          aliases.push(relation.alias);
        }

        Chat.getUnreadMessageCount(r_ids, aliases, (err, count) => {
          if (err) {
            return next(err);
          }

          // combine lastMessages and count
          for (let message of lastMessages.data) {
            //console.log(message);
            const find = count.data.filter(item => {
              return message.r_id == item.r_id;
            })[0];

            message.count = find.count;
          }

          // combine relations and lastMessages 
          for (let relation of relations) {
            const find = lastMessages.data.filter(item => {
              return relation.r_id == item.r_id;
            })[0];

            if(find) {
              relation.data = {
                message: find.message,
                date: find.date,
                count: find.count
              };
            }
          }

          // If relation has not data property, there is no chat room.
          const list = relations.filter((relation) => {
            return relation.data !== undefined; 
          }); 

          let result = {
            msg: 'Success',
            list
          };

          res.send(result);
        });
      });
    });
  });
});

/**
 * 대화 내용
 * GET /chat/:r_id
 */
router.get('/chat/:r_id', (req, res, next) => {
  // validate params
  const r_id = parseInt(req.params.r_id);
  if (isNaN(r_id)) {
    return next(new Error('Not correct request'));
  }

  Chat.getMessagesByRid(r_id, (err, result) => {
    if (err) {
      return next(err);
    }

    res.send(result);
  });
});

/**
 * 대화하기
 * POST /chat/:r_id
 * Body sample: { from: '조니뎁', to: '안졸리나졸리', message: '좋은 하루 보내세요' }
 */
router.post('/chat/:r_id', (req, res, next) => {
  // TODO: 대화하기: 어차피 socket.io 통신하면 post는 필요 없을듯??
  
  // // validate params
  // const r_id = parseInt(req.params.r_id);
  // if (isNaN(r_id)) {
  //   return next(new Error('Not correct request'));
  // }

  // // validate body
  // const from = req.body.from;
  // const to = req.body.to;
  // const message = req.body.message;

  // if (!from || !to || !message) {
  //   return next(new Error('Not correct body message'));
  // }

  // // save the chat message into mongodb
  // Chat.saveChatMessage({
  //   r_id,
  //   from,
  //   to,
  //   message
  // }, (err, result) => {
  //   if (err) {
  //     return next(err);
  //   }

  //   res.send(result);
  // });
});

module.exports = router;