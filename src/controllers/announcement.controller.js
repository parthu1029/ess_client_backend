const announcementService = require('../services/announcement.service');

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementService.getAllAnnouncements();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.query;
    const announcement = await announcementService.getAnnouncementById(id);
    if (announcement) {
      res.json(announcement);
    } else {
      res.status(404).json({ error: 'Announcement not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add announcement
exports.addAnnouncement = async (req, res) => {
  try {
    await announcementService.addAnnouncement(req.body);
    res.json({ message: 'Announcement added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    await announcementService.updateAnnouncement(req.body);
    res.json({ message: 'Announcement updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.query;
    await announcementService.deleteAnnouncement(id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
