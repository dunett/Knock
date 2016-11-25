const express = require('express');
const router = express.Router();
const fs = require('fs');
const async = require('async');

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
  if (!req.file && !req.body) {
    return next(new Error('Not correct body message'));
  }

  const profile = req.file;
  const job = req.body.job;
  const height = req.body.height;
  const fit = req.body.fit;
  const faith = req.body.faith;
  const hobby = req.body.hobby;

  if (!profile && !job && !height && !fit && !faith && !hobby) {
    return next(new Error('Not correct body message'));
  }

  const changes = {
    u_id: u_id,
    job: job || undefined,
    height: height || undefined,
    fit: fit || undefined,
    faith: faith || undefined,
    hobby: hobby || undefined,
  };

  // Get old profile and thumbnail to remove after upload
  User.getProfileAndThumbnailByUid(u_id, (err, oldImage) => {
    if (err) {
      return next(err);
    }

    async.waterfall([
      async.apply(makeThumbnail, profile),
      uploadProfileToS3,
      async.apply(editProfile, changes),
    ], (err, images) => {
      removeFiles(images);

      if (err) {
        console.log(err);
        return next(err);
      }

      // If profile is changed, remove old profile and thumbnail in S3
      let profileName = path.basename(oldImage.profile);
      let thumbnailName = path.basename(oldImage.thumbnail);

      // 이전 이미지가 없을 경우 그냥 리턴
      if (!profileName && !thumbnailName) {
        return res.send({ msg: 'Success' });
      }

      // 이전 이미지는 있지만 새로운 이미지를 업로드 한게 아니라면 그냥 리턴
      if (!images) {
        return res.send({ msg: 'Success' });
      }

      const oldImages = [{ name: profileName }, { name: thumbnailName }];

      // 이전 S3 이미지 삭제
      async.eachSeries(oldImages, (oldImage, next) => {
        aws.deleteProfile(oldImage)
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

const makeThumbnail = (profile, callback) => {
  // make a thumbnail
  if (!profile) {
    return callback(null, null, null);
  }

  let thumbnailName = profile.filename.split('.')[0] + '-thumbnail' + '.' + profile.filename.split('.')[1];
  easyimg.resize({
    src: path.join(profile.destination, profile.filename),
    dst: path.join(profile.destination, thumbnailName),
    width: 200
  })
    .then(thumbnail => {
      // TODO: Change then and catch method because window dont work exactly
      callback(null, thumbnail);
    })
    .catch(err => {
      const thumbnailForTest = {
        type: 'jpeg',
        name: thumbnailName,
        path: path.join(profile.destination, thumbnailName)
      };

      callback(null, profile, thumbnailForTest);   // for test in window
      //callback(err);
    });
};

const uploadProfileToS3 = (profile, thumbnail, callback) => {
  if (!profile) {
    return callback(null, null);
  }

  // upload profile and thumbnail to s3
  const images = [profile, thumbnail];
  let imagesUrl = [];

  async.eachSeries(images, (image, next) => {
    aws.uploadProfile({
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
      // 프로필 이미지만 업로드 되고 썸네일은 실패했다면 프로필 이미지 삭제
      // 처음부터 프로필 이미지가 실패했다면 삭제 ㄴㄴ
      // TODO: When fail upload, delete image in s3??????
      console.error('Fail upload the profile to S3: ', err);
      return callback(err, images);
    }

    callback(null, imagesUrl);
  });
};

const editProfile = (changes, imagesUrl, callback) => {
  if (imagesUrl) {
    changes.profile = imagesUrl[0].url;
    changes.thumbnail = imagesUrl[1].url;
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