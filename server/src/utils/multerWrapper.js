// multer.single('image name') => text and file in body
// multer.single() => only text in body
// req.body.name
// req.file.name

const path = require('path');
const multer = require('multer');

const Upload_FolderName = '../upload';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, Upload_FolderName));
  },
  filename: function (req, file, cb) {
    file.uploadedFile = {
      name: file.fieldname,
      ext: file.mimetype.split('/')[1],
    };

    cb(null, file.uploadedFile.name + '-' + Date.now() + '.' + file.uploadedFile.ext);
  }
});

var upload = multer({ storage: storage });

module.exports = upload;