const express = require('express');
const router = express.Router();

const Chat = require('../model/chat');

router.get('/chat/:u_id', (req, res, next) => {
  // validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  
});

/**
 * 대화하기
 * POST /chat/:r_id
 * Body sample: { from: '조니뎁', to: '안졸리나졸리', message: '좋은 하루 보내세요' }
 */
router.post('/chat/:r_id', (req, res, next) => {
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