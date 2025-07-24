const announcementService = require('../services/announcementService');

exports.getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await announcementService.getAllAnnouncements();
        res.json(announcements);
    } catch (error) {
        console.error('Announcements fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
};

exports.addAnnouncement = async (req, res) => {
    try {
        const { title, content, priority, validUntil } = req.body;
        
        await announcementService.addAnnouncement({
            title, content, priority, validUntil
        });
        
        res.json({ message: 'Announcement added successfully' });
    } catch (error) {
        console.error('Announcement add error:', error);
        res.status(500).json({ error: 'Failed to add announcement' });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        
        await announcementService.deleteAnnouncement(id);
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Announcement delete error:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
};
