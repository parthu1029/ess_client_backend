const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for photos
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

router.get('/:empId', profileController.getProfile);
router.put('/:empId', profileController.updateProfile);
router.post('/:empId/photo', upload.single('photo'), profileController.uploadPhoto);
router.get('/:empId/photo', profileController.getPhoto);
router.delete('/:empId/photo', profileController.deletePhoto);
router.get('/:empId/summary', profileController.getEmploymentSummary);

module.exports = router;
