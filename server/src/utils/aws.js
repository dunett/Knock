const fs = require('fs');
const AWS = require('aws-sdk');
const awsPath = require('./constants').aws;

AWS.config.region = process.env.AWS_REGION;
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY;
AWS.config.secretAccessKey = process.env.AWS_SECRET_KEY;

// 버킷 이름
const bucketName = awsPath.bucketName;
const profileFolderName = awsPath.profileFolderName;

const s3 = new AWS.S3();

/**
 * Params:
 *  - args:
 *     - path: file full path
 *     - name: file name
 *     - contentType: extension
 */
const uploadFile = (args) => {
  return new Promise((resolve, reject) => {
    if (!args.path || !args.name || !args.contentType) {
      return reject(new Error('Some arguments is undefined'));
    }

    const fileStream = fs.createReadStream(args.path);

    fileStream.on('error', err => {
      return reject(err);
    });

    fileStream.on('open', () => {
      const params = {
        Bucket: bucketName,
        Key: profileFolderName + '/' + args.name,
        Body: fileStream,
        ACL: 'public-read',
        ContentType: args.contentType,
      };

      s3.putObject(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        // http, https
        const imageUrl = s3.endpoint.href + bucketName + '/' + params.Key;
        resolve(imageUrl);
      });
    });
  });
};

/**
 * Params:
 *  - args:
 *     - name: file name
 */
const deleteFile = (args) => {
  return new Promise((resolve, reject) => {
    if (!args.name) {
      return reject(new Error('Some arguments is undefined'));
    }

    const params = {
      Bucket: bucketName,
      Key: profileFolderName + '/' + args.name,
    };

    s3.deleteObject(params, err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};

module.exports = {
  uploadFile,
  deleteFile
};