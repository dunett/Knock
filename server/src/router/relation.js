const express = require('express');
const router = express.Router();

const Relation = require('../model/relation');

/**
 * 찜하기
 * PUT /relation/favor/:r_id
 */
router.put('/relation/favor/:r_id', (req, res, next) => {
  // validate params
  const r_id = parseInt(req.params.r_id);
  if (isNaN(r_id)) {
    return next(new Error('Not correct request'));
  }

  // validate body message
  const u_idStr = req.body.u_id;
  const u_id = parseInt(u_idStr);
  if (isNaN(u_id)) {
    return next(new Error('Not correct body message'));
  }

  Relation.toggleToWishlist(r_id, u_id, (err, result) => {
    if (err) {
      return next(err);
    }

    res.send(result);
  });
});

/**
 * 상대 연결끊기
 * DELETE /relation/disconnect/:r_id
 */
router.delete('/relation/disconnect/:r_id', (req, res, next) => {
  // validate params
  const r_id = parseInt(req.params.r_id);
  if (isNaN(r_id)) {
    return next(new Error('Not correct request'));
  }

  // TODO: 상대가 연결 끊었을 때 Chat, Relation을 날려버리면
  // 내 채팅 목록에서 안보이게 되어 상대가 연결 끊었는지 알 수 없음.
});

module.exports = router;