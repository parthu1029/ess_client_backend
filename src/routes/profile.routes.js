const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const profileController = require('../controllers/profile.controller');

router.get('/getProfile', profileController.getProfile);
router.put('/updateProfile', profileController.updateProfile);
router.post('/uploadPhoto', upload.single('photo'), profileController.uploadPhoto);
router.get('/getPhoto', profileController.getPhoto);
router.delete('/deletePhoto', profileController.deletePhoto);
router.get('/getEmploymentSummary', profileController.getEmploymentSummary);
router.get('/getPersonalInfo', profileController.getPersonalInfo);
router.put('/updatePersonalInfo', profileController.updatePersonalInfo);
router.get('/getContactInfo', profileController.getContactInfo);
router.put('/updateContactInfo', profileController.updateContactInfo);
router.get('/getProfileSummary', profileController.getProfileSummary);
router.get('/getCalendar', profileController.getCalendar);

module.exports = router;
