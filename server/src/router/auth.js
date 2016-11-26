const express = require('express');
const router = express.Router();

const User = require('../model/user');

const upload = require('../utils/multerWrapper');

/**
 * 회원가입
 * POST /join
 */
router.post('/join', upload.single(), (req, res, next) => {
  // validate body message
  if (!req.body) {
    return next(new Error('Not correct body message'));
  }

  const email = req.body.email;
  const alias = req.body.alias;
  const gender = req.body.gender;
  const area = req.body.area;
  const age = req.body.age;
  const job = req.body.job;
  const faith = req.body.faith;
  const hobby = req.body.hobby;

  if (!email || !alias || !gender || !area || !age || !job || !faith || !hobby) {
    return next(new Error('Not correct body message'));
  }

  // TODO: Not finish
  // email RegExp
  // check alias exists

  User.addUser({}, (err, result) => {

  });

  res.send('ok');
});

/**
 * 닉네임 중복 확인 
 * GET /join/:alias
 */
router.get('/join/:alias', (req, res, next) => {
  const alias = req.params.alias;

  User.isExistedAlias(alias, (err, result) => {
    if (err) {
      return next(err);
    }

    if (result.count == 0) {
      return res.send({ msg: 'Success' });
    }

    return res.send({ msg: 'Duplicated' });
  });
});

module.exports = router;