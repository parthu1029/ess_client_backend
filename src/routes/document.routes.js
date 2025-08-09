const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/document.controller');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });


router.delete('/deleteDocument', documentController.deleteDocument);
router.get('/getDocumentTransactions',documentController.getDocumentTransactions)
router.get('/getDocumentRequestDetails',documentController.getDocumentRequestDetails)
router.post('/submitDocumentRequest',documentController.submitDocumentRequest)
router.post('/submitDocumentRequestOnBehalf',documentController.submitDocumentRequestOnBehalf)
router.patch('/editDocumentRequest',documentController.editDocumentRequest)
router.post('/draftSaveDocumentRequest',documentController.draftSaveDocumentRequest)
router.post('/delegateDocumentApproval',documentController.delegateDocumentApproval)
router.patch('/changeDocumentApproval',documentController.changeDocumentApproval)
router.patch('/approveRejectDocumentRequest',documentController.approveRejectDocumentRequest)
router.get('/getPendingDocumentRequests',documentController.getPendingDocumentRequests)
router.get('/getPendingDocumentRequestDetails',documentController.getPendingDocumentRequestDetails)

module.exports = router;
