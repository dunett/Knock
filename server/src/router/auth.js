const express = require('express');
const router = express.Router();

const User = require('../model/user');

const multer = require('../utils/multerWrapper');
const validate = require('../utils/validate');

/**
 * 회원가입
 * POST /join
 */
router.post('/join', multer.single(), (req, res, next) => {
  // validate body message
  if (!req.body) {
    return next(new Error('Not correct body message'));
  }

  // necessary
  const email = req.body.email;
  const alias = req.body.alias;
  const gender = req.body.gender;
  const age = req.body.age;
  const age_min = req.body.age_min;
  const age_max = req.body.age_max;

  // options
  const job = req.body.job;
  const school = req.body.school;
  const faith = req.body.faith;
  const fit = req.body.fit;
  const hobby = req.body.hobby;

  // token
  const sns_token = req.body.sns_token;
  const fcm_token = req.body.fcm_token;

  // validate necessary field
  // if (!email || !alias || !gender || !age || !age_min || !age_max) {
  //   return next(new Error('Not correct body message'));
  // }

  // email regex
  // if (!validate.validateEmail(email)) {
  //   return next(new Error('Invalid email format'));
  // }

  // gender regex
  // if (!validate.validateGender(gender)) {
  //   return next(new Error('Invalid gender'));
  // }

  // // validate age
  // if (!validate.validateAgeMinMax(age_min, age_max)) {
  //   return next(new Error('Invalid age range'));
  // }

  // check alias exists
  User.isExistedAlias(alias, (err, result) => {
    if (err) {
      return next(err);
    }

    if (result.count > 0) {
      return next(new Error('Duplicated'));
    }

    User.addUser({ email, alias, gender, age, age_min, age_max, job, school, faith, fit, hobby, sns_token, fcm_token }, (err, result) => {
      if (err) {
        return next(err);
      }

      res.send({ msg: 'Success' });
    });
  });
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