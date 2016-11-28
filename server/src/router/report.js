const express = require('express');
const router = express.Router();

const Report = require('../model/report');

const multer = require('../utils/multerWrapper');

/**
 * 상대 신고하기
 * POST /report/:r_id
 */
router.post('/report/:r_id', multer.single(), (req, res, next) => {
  // Validate params
  const r_id = parseInt(req.params.r_id);
  if (isNaN(r_id)) {
    return next(new Error('Not correct request'));
  }

  // Validate body message
  const senderStr = req.body.sender;
  const message = req.body.message;
  const sender = parseInt(senderStr);

  if (isNaN(sender) || !message) {
    return next(new Error('Not correct body message'));
  }

  Report.saveReport({
    r_id,
    sender,
    message
  }, (err, result) => {
    if (err) {
      return next(err);
    }

    res.send(result);
  });
});

module.exports = router;