const express = require('express');
const router = express.Router();
const excuseController = require('../controllers/excuseController');
const upload = require('../middleware/upload');

router.post('/submit', upload.single('attachment'), excuseController.submitExcuse);
router.get('/history/:empId', excuseController.getExcuseHistory);
router.get('/status/:empId', excuseController.getExcuseStatus);
router.put('/approve/:excuseId', excuseController.approveRejectExcuse);
router.get('/pending/:managerId', excuseController.getPendingExcuses);
router.delete('/cancel/:excuseId', excuseController.cancelExcuse);
router.get('/types', excuseController.getExcuseTypes);

module.exports = router;
