const express = require('express');
const router = express.Router();
const fs = require('fs');
const async = require('async');

const User = require('../model/user');
const upload = require('../utils/multerWrapper');

const gm = require('gm').subClass({ imageMagick: true });
const path = require('path');

const aws = require('../utils/aws');

const Thumbnail_Width = 200;
const Thumbnail_Height = 200;

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

      // Return if there is no previous image 
      if (!profileName && !thumbnailName) {
        return res.send({ msg: 'Success' });
      }

      // If user have an old image but have not uploaded a new one, just return
      if (!images) {
        return res.send({ msg: 'Success' });
      }

      const oldImages = [{ name: profileName }, { name: thumbnailName }];

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
    if(err) {
      return next(err);
    }
    
    res.send(result);
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
    .resize(Thumbnail_Width, Thumbnail_Height)       // keep the ratio 
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

const uploadProfileToS3 = (profile, thumbnail, callback) => {
  if (!profile) {
    return callback(null, null);
  }

  // upload profile and thumbnail to s3
  const images = [profile, thumbnail];
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