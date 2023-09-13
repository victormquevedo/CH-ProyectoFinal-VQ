import multer from 'multer';
import { __dirname } from '../utils/fileUtils.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/../public/${file.fieldname}`);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploader = multer({ storage });

export default uploader;
