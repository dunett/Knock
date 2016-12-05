const awsPath = require('./constants').aws;
const _gender = require('./constants').gender;

/**
 * Params:
 *  - src: home(home directory)
 *  - gender: 1 or 2 
 *  - fileName: 01.png
 */
module.exports.makeS3Path = function (src, gender, fileName) {
  const region = process.env.AWS_REGION || 'ap-northeast-2';
  const bucket = awsPath.bucketName;

  const gend = (gender == _gender.man) ? awsPath.manFolderName : awsPath.womanFolderName;
  const home = awsPath.homeFolderName;
  const thumbnail = awsPath.thumbnailFolderName;
  const profile = awsPath.profileFolderName;

  let dst = '';

  switch (src) {
    case home:
      dst = `https://s3.${region}.amazonaws.com/${bucket}/${gend}/${home}/${fileName}`;
      return dst;
    case thumbnail:
      dst = `https://s3.${region}.amazonaws.com/${bucket}/${gend}/${thumbnail}/${fileName}`;
      return dst;
    case profile:
      dst = `https://s3.${region}.amazonaws.com/${bucket}/${gend}/${profile}/${fileName}`;
      return dst;
    default:
      return '';
  }
};