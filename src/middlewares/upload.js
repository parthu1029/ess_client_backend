// upload.js – Multer middleware

const multer = require('multer');

// Use memory storage so we can write file buffer to DB, not disk
const storage = multer.memoryStorage();

// Optionally, add file size or type limits here
const upload = multer({
  storage: storage,
  // Optional: add file size and type validations
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit (change as needed)
  fileFilter: (req, file, cb) => {
    // Accept JPEG, PNG, and PDF
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .png and .pdf files are allowed!'), false);
    }
  }
});

module.exports = upload;
