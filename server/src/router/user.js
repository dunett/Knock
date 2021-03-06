const express = require('express');
const router = express.Router();
const fs = require('fs');
const async = require('async');

const User = require('../model/user');
const multer = require('../utils/multerWrapper');

const gm = require('gm').subClass({ imageMagick: true });
const path = require('path');

const aws = require('../utils/aws');
const thumbnailSize = require('../utils/constants').thumbnailSize;

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

/**
 * 프로필 수정
 * PUT /user/:u_id
 */
router.put('/user/:u_id', multer.single('profile'), (req, res, next) => {
  // validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  // validate body message
  if (!req.file && !req.body) {
    return next(new Error('Not correct body message'));
  }

  const profile = req.file;
  const area = req.body.area;
  const job = req.body.job;
  const school = req.body.school;
  const faith = req.body.faith;
  const fit = req.body.fit;
  const height = req.body.height;

  if (!profile && !area && !job && !school && !faith && !fit && !height) {
    return next(new Error('Not correct body message'));
  }

  const changes = {
    u_id: u_id,
    area: area || undefined,
    job: job || undefined,
    school: school || undefined,
    faith: faith || undefined,
    fit: fit || undefined,
    height: height || undefined,
  };

  // Get old profile and thumbnail to remove after upload
  User.getProfileAndThumbnailByUid(u_id, (err, oldImage) => {
    if (err) {
      return next(err);
    }

    async.waterfall([
      //async.apply(makeThumbnail, profile),
      async.apply(uploadProfileToS3, profile),
      async.apply(editProfile, changes),
    ], (err, images) => {
      removeFiles(images);

      if (err) {
        console.log(err);
        return next(err);
      }

      // If profile is changed, remove old profile and thumbnail in S3
      let profileName = '';
      if (oldImage.profile) {
        profileName = path.basename(oldImage.profile);
      }
      //let thumbnailName = path.basename(oldImage.thumbnail);

      // Return if there is no previous image 
      //if (!profileName && !thumbnailName) {
      if (!profileName) {
        return res.send({ msg: 'Success' });
      }

      // If user have an old image but have not uploaded a new one, just return
      if (!images) {
        return res.send({ msg: 'Success' });
      }

      //const oldImages = [{ name: profileName }, { name: thumbnailName }];
      const oldImages = [{ name: profileName }];

      // If you uploaded a new image, delete the old image
      async.eachSeries(oldImages, (oldImage, next) => {
        aws.deleteFile(oldImage)
          .then(result => {
            next();
          })
          .catch(err => {
            next(err);
          });
      }, err => {
        if (err) {
          console.error(err);
          return res.send({ msg: 'Success' });
        }

        return res.send({ msg: 'Success' });
      });
    });
  });
});

/**
 * 계정 휴면
 * Toggle the status to Normal or Sleep
 * PUT /user/:u_id/sleep
 */
router.put('/user/:u_id/sleep', (req, res, next) => {
  // validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  User.toggleStatusByUid(u_id, (err, result) => {
    if (err) {
      return next(err);
    }

    res.send(result);
  });
});

/**
 * 계정 탈퇴
 * PUT /user/:u_id/black
 */
router.put('/user/:u_id/black', (req, res, next) => {
  // validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  User.leaveAccount(u_id, err => {
    if (err) {
      return next(err);
    }

    res.send({ msg: 'Success' });
  });
});

/**
 * 토큰 변경하기
 * PUT /user/:u_id/token
 * Body: sns_token, fcm_token
 */
router.put('/user/:u_id/token', multer.single(), (req, res, next) => {
  // validate params
  const u_id = parseInt(req.params.u_id);
  if (isNaN(u_id)) {
    return next(new Error('Not correct request'));
  }

  // validate body message
  if (!req.body) {
    return next(new Error('Not correct body message'));
  }

  const sns_token = req.body.sns_token;
  const fcm_token = req.body.fcm_token;

  if (!sns_token && !fcm_token) {
    return next(new Error('Not correct body message'));
  }

  User.editToken(u_id, sns_token, fcm_token, (err, result) => {
    if (err) {
      return next(err);
    }

    res.send({ msg: 'Success' });
  });
});

const makeThumbnail = (profile, callback) => {
  // make a thumbnail
  if (!profile) {
    return callback(null, null, null);
  }

  let thumbnailName = profile.filename.split('.')[0] + '-thumbnail' + '.' + profile.filename.split('.')[1];
  const src = path.join(profile.destination, profile.filename);
  const dst = path.join(profile.destination, thumbnailName);

  gm(src)
    .resize(thumbnailSize.width, thumbnailSize.height)       // keep the ratio 
    //.resizeExact(200, 200)
    .write(dst, err => {
      if (err) {
        return callback(err, [profile]);
      }

      const thumbnail = {
        type: profile.mimetype,
        name: thumbnailName,
        path: dst
      };

      callback(null, profile, thumbnail);
    });
};

// If you use the thumbnail, use the below code
//const uploadProfileToS3 = (profile, thumbnail, callback) => {
// If you don't use the thumbnail, use the below code
const uploadProfileToS3 = (profile, callback) => {
  if (!profile) {
    return callback(null, null);
  }

  // upload profile and thumbnail to s3
  //const images = [profile, thumbnail];
  const images = [profile];
  let imagesUrl = [];

  async.eachSeries(images, (image, next) => {
    aws.uploadFile({
      path: image.path,
      name: image.filename || image.name,
      contentType: image.mimetype || image.type,
    })
      .then(imageUrl => {
        imagesUrl.push({
          path: image.path,
          url: imageUrl
        });

        next();
      })
      .catch(err => {
        next(err);
      });
  }, err => {
    if (err) {
      console.error('Fail upload the profile to S3: ', err);
      return callback(err, images);
    }

    callback(null, imagesUrl);
  });
};

const editProfile = (changes, imagesUrl, callback) => {
  if (imagesUrl && imagesUrl.length >= 1) {
    changes.profile = imagesUrl[0].url;
    // changes.thumbnail = imagesUrl[1].url;
  }

  User.editProfileByUid(changes, (err, result) => {
    if (err) {
      return callback(err, imagesUrl);
    }

    callback(null, imagesUrl);
  });
};

/**
 * Params:
 *  - files: object array
 *     - path: file full path
 */
const removeFiles = (files) => {
  if (!files) return;

  async.each(files, (file, next) => {
    fs.unlink(file.path, err => {
      next();
    });
  }, err => {
    if (err) {
      console.error(err);
    }
  });
};

module.exports = router;