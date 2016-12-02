const express = require('express');
const router = express.Router();

const Mbti = require('../model/mbti');
const User = require('../model/user');

const multer = require('../utils/multerWrapper');

/**
 * 성향테스트
 * GET /mbti
 * return MBTI question and answer
 */
router.get('/mbti', (req, res, next) => {
  Mbti.getMbtiTest((err, result) => {
    if (err) {
      return next(err);
    }

    res.send(result);
  });
});

/**
 * 성향검사
 * PUT /mbti/:u_id
 * Body sample: { answer1: 0, answer2: 1, answer3: 0, ..., answer25: 0}
 */
router.put('/mbti/:u_id', multer.single(), (req, res, next) => {
  // Validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  // Validate body message
  let answers = [];
  for (let property in req.body) {
    if (req.body[property] != Mbti.Char.Answer_Char && req.body[property] != Mbti.Char.Answer_Char2) {
      return next(new Error('Not correct body message'));
    }

    answers.push({
      answer: req.body[property]
    });
  }

  if (answers.length !== 25) {
    const error = new Error('Not correct body message');
    return next(error);
  }

  User.isExistedUser(u_id, (err, result) => {
    if (err) {
      return next(err);
    }

    if (result.count < 1) {
      return next(new Error('Cannot find user'));
    }

    Mbti.editCharacterOfUser(u_id, answers, (err, result) => {
      if (err) {
        return next(err);
      }

      res.send(result);
    });
  });
});

/**
 * 내 유형 보기
 * GET /mbti/:u_id
 */
router.get('/mbti/:u_id', (req, res, next) => {
  // Validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  User.isExistedUser(u_id, (err, result) => {
    if (err) {
      return next(err);
    }

    if (result.count < 1) {
      return next(new Error('Cannot find user'));
    }

    Mbti.getMyMbtiType(u_id, (err, result) => {
      if (err) {
        return next(err);
      }

      res.send(result);
    });
  });
});

/**
 * 유형 상세 보기
 */
router.get('/mbti/:u_id/detail', (req, res, next) => {
  // Validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  User.isExistedUser(u_id, (err, result) => {
    if (err) {
      return next(err);
    }

    if (result.count < 1) {
      return next(new Error('Cannot find user'));
    }

    Mbti.getDetailMbti(u_id, (err, result) => {
      if (err) {
        return next(err);
      }

      res.send(result);
    });
  });
});

/**
 * 10가지 유형보기/상세보기
 * GET /mbti/:u_id/other
 */
router.get('/mbti/:u_id/other', (req, res, next) => {
  // Validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  User.isExistedUser(u_id, (err, result) => {
    if (err) {
      return next(err);
    }

    if (result.count < 1) {
      return next(new Error('Cannot find user'));
    }

    Mbti.getOtherMbtiType(u_id, (err, result) => {
      if (err) {
        return next(err);
      }

      res.send(result);
    });
  });
});

module.exports = router; 