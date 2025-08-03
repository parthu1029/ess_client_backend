const express = require('express');
const announcementController = require('../controllers/announcement.controller');
const router = express.Router();

router.get('/getAllAnnouncement', announcementController.getAllAnnouncements);
router.get('/getAnnouncementById', announcementController.getAnnouncementById);
router.post('/addAnnouncement', announcementController.addAnnouncement);
router.put('/updateAnnouncement', announcementController.updateAnnouncement);
router.delete('/deleteAnnouncement', announcementController.deleteAnnouncement);

module.exports = router;
