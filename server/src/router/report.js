const express = require('express');
const router = express.Router();

const Report = require('../model/report');

const multer = require('../utils/multerWrapper');

/**
 * 상대 신고하기
 * POST /report/:r_id
 */
router.post('/report', multer.single(), (req, res, next) => {
  // Validate body message
  if (!req.body) {
    return next(new Error('Not correct body message'));
  }

  const senderStr = req.body.sender;
  const message = req.body.message;
  const sender = parseInt(senderStr);

  if (isNaN(sender) || !message) {
    return next(new Error('Not correct body message'));
  }

  Report.saveReport({
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