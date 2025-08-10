const express = require('express');
const excuseController = require('../controllers/excuse.controller');
const upload = require('../middlewares/upload');
const router = express.Router();

router.post('/submitExcuseRequest', upload.single('attachment'), excuseController.submitExcuseRequest);
router.post('/submitExcuseOnBehalf', upload.single('attachment'), excuseController.submitExcuseOnBehalf);
router.post('/draftSaveExcuseRequest', upload.single('attachment'), excuseController.draftSaveExcuseRequest);
router.get('/getExcuseTransactions', excuseController.getExcuseTransactions);
router.get('/getExcuseTypes', excuseController.getExcuseTypes);
router.get('/getExcuseRequestDetails', excuseController.getExcuseRequestDetails);
router.get('/getPendingExcuseRequests', excuseController.getPendingExcuseRequests);
router.get('/getPendingExcuseRequestDetails', excuseController.getPendingExcuseRequestDetails);
router.patch('/approveRejectExcuseRequest', excuseController.approveRejectExcuseRequest);
router.patch('/changeExcuseApproval', excuseController.changeExcuseApproval);
router.post('/delegateExcuseApproval', excuseController.delegateExcuseApproval);

module.exports = router;
