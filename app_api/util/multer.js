const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/data/fileUploads");
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4());
    },
});

const upload = multer({ storage })

module.exports = {
    upload
}