const express = require('express');
const router = express.Router();
const Mbti = require('../model/mbti'); 

/**
 * Get MBTI Test: GET /mbti
 * return MBTI question and answer
 */
router.get('/mbti', (req, res, next) => {
  Mbti.getMbtiTest((err, result) => {
    if(err) {
      return next(err);
    }

    res.send(result);
  });
});

/**
 * PUT /mbti/:id
 * Body sample: { answer1: 0, answer2: 1, answer3: 0, ..., answer25: 0}
 */
router.put('/mbti/:id', (req, res, next) => {
  // Validate params
  const id = parseInt(req.params.id);
  if(isNaN(id)) {
    const error = new Error('Failure');
    return next(error);
  }

  // Validate body

  // Todo!!!
  req.body.answer1

  Mbti.editCharacterOfUser((err, result) => {
    if(err) {
      return next(err);
    }

    res.send(result);
  });
});

module.exports = router; 