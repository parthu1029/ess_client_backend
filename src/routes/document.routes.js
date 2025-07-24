const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');

// Configure multer to use memory storage instead of disk storage
const multer = require('multer');
const memoryStorage = multer.memoryStorage();
const uploadToMemory = multer({ storage: memoryStorage });

router.post('/upload/:empId', uploadToMemory.single('document'), documentController.uploadDocument);
router.get('/:empId', documentController.getAllDocuments);
router.get('/download/:empId/:docId', documentController.downloadDocument);
router.delete('/:empId/:docId', documentController.deleteDocument);

module.exports = router;
