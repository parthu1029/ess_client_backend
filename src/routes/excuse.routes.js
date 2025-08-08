const express = require('express');
const multer = require('multer');
const excuseController = require('../controllers/excuse.controller');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/submitExcuseRequest', upload.single('attachment'), excuseController.submitExcuseRequest);
router.post('/submitExcuseOnBehalf', upload.single('attachment'), excuseController.submitExcuseOnBehalf);
router.get('/getExcuseTransactions', excuseController.getExcuseTransactions);
router.get('/getExcuseTypes', excuseController.getExcuseTypes);
router.get('/getExcuseRequestDetails', excuseController.getExcuseRequestDetails);
router.get('/getPendingExcuseRequests', excuseController.getPendingExcuseRequests);
router.get('/getPendingExcuseRequestDetails', excuseController.getPendingExcuseRequestDetails);
router.patch('/approveRejectExcuseRequest', excuseController.approveRejectExcuseRequest);
router.patch('/changeExcuseApproval', excuseController.changeExcuseApproval);
router.post('/delegateExcuseApproval', excuseController.delegateExcuseApproval);

module.exports = router;
