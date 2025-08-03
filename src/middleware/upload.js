// upload.js – Multer middleware

const multer = require('multer');

// Use memory storage so we can write file buffer to DB, not disk
const storage = multer.memoryStorage();

// Optionally, add file size or type limits here
const upload = multer({
  storage: storage,
  // Optional: add file size and type validations
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit (change as needed)
  fileFilter: (req, file, cb) => {
    // Accept JPEG and PNG only
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg and .png files are allowed!'), false);
    }
  }
});

module.exports = upload;
