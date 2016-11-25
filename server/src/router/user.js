const express = require('express');
const router = express.Router();

const User = require('../model/user');
const upload = require('../utils/multerWrapper');

const easyimg = require('easyimage');
const path = require('path');

const aws = require('../utils/aws');

/**
 * 프로필 보기
 * GET /user/:u_id
 */
router.get('/user/:u_id', (req, res, next) => {
  // validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  User.getProfileByUid(u_id, (err, result) => {
    if (err) {
      return next(err);
    }

    res.send(result);
  });
});

router.put('/user/:u_id', upload.single('profile'), (req, res, next) => {
  // validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  // validate body message
  const profile = req.file;
  const job = req.body.job;
  const height = req.body.height;
  const fit = req.body.fit;
  const faith = req.body.faith;
  const hobby = req.body.hobby;

  if (!profile || !job || !height || !fit || !faith || !hobby) {
    return next(new Error('Not correct body message'));
  }

  //profile.filename = 'profile.jpg';

  // make a thumbnail
  let thumbnailName = profile.filename.split('.')[0] + '-thumbnail' + '.' + profile.filename.split('.')[1];
  easyimg.thumbnail({
    src: path.join(profile.destination, profile.filename),
    dst: path.join(profile.destination, thumbnailName),
    width: 200
  })
    .then(image => {
      console.log(image);
    })
    .catch(err => {
      console.log(err);
    });

  // TODO: 프로필 수정 
  // If user upload new profile image, first remove previous profile image and thumbnail in s3 

  // upload profile and thumbnail to s3
  // aws.uploadProfile({
  //   path: profile.path,
  //   name: profile.filename,
  //   contentType: profile.mimetype,
  // })
  //   .then(imageUrl => {
  //     console.log(imageUrl);
  //   })
  //   .catch(err => {
  //     console.log('errskfjskl: ', err);
  //   });


  // delete profile and thumbnail in node server

  // update user profile

  //res.send('ok');
});

module.exports = router;