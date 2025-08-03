const express = require('express');
const multer = require('multer');
const excuseController = require('../controllers/excuse.controller');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/submit', upload.single('attachment'), excuseController.submitExcuse);
router.get('/getExcuseHistory', excuseController.getExcuseHistory);
router.get('/getExcuseStatus', excuseController.getExcuseStatus);
router.put('/approveRejectExcuse', excuseController.approveRejectExcuse);
router.get('/getPendingExcuses', excuseController.getPendingExcuses);
router.delete('/cancelExcuse', excuseController.cancelExcuse);
router.get('/getExcuseTypes', excuseController.getExcuseTypes);
router.get('/getExcuseById', excuseController.getExcuseById);
router.get('/downloadExcuseAttachment', excuseController.downloadExcuseAttachment);
router.get('/getExcuseTransactions',excuseController.getExcuseTransactions);
router.get('/getExcuseRequestDetails',excuseController.getExcuseRequestDetails);
router.post('/submitExcuse',excuseController.submitExcuse);
router.post('/submitExcuseOnBehalf',excuseController.submitExcuseOnBehalf)
router.patch('/editExcuseRequest',excuseController.editExcuseRequest)
router.post('/draftSaveExcuseRequest',excuseController.draftSaveExcuseRequest)
router.get('/getPendingExcuseRequests',excuseController.getPendingExcuseRequests)
router.get('/getPendingExcuseRequests',excuseController.getPendingExcuseRequests)
router.get('/getPendingExcuseRequestDetails',excuseController.getPendingExcuseRequestDetails)
router.patch('/approveRejectExcuseRequest',excuseController.approveRejectExcuseRequest)
router.patch('/changeExcuseApproval',excuseController.changeExcuseApproval)
router.post('/delegateExcuseApproval',excuseController.delegateExcuseApproval)

module.exports = router;
