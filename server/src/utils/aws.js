const fs = require('fs');
const AWS = require('aws-sdk');

AWS.config.region = process.env.AWS_REGION;
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY;
AWS.config.secretAccessKey = process.env.AWS_SECRET_KEY;

// 버킷 이름
const bucketName = 'tacademy-knock';

const s3 = new AWS.S3();

/**
 * Params:
 *  - args:
 *     - key
 *     - contentType
 */
const uploadProfile = (args, callback) => {
  const readStream = fs.createReadStream(args.path);

  const params = {
    Bucket: bucketName,
    Key: 'profile/' + args.name,
    Body: readStream,
    ACL: 'public-read',
    ContentType: args.contentType,
  };

  return new Promise((resolve, reject) => {
    s3.putObject(params, (err, data) => {
      if (err) {
        reject(err);
      }
      // http, https
      const imageUrl = s3.endpoint.href + bucketName + '/' + params.Key;
      resolve(imageUrl);
    });
  });
};

module.exports = {
  uploadProfile
};