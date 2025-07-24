const profileService = require('../services/profileService');

exports.getProfile = async (req, res) => {
    try {
        const { empId } = req.params;
        const profile = await profileService.getProfileById(empId);
        
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        res.json(profile);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { empId } = req.params;
        const updateData = req.body;
        
        await profileService.updateProfile(empId, updateData);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

exports.uploadPhoto = async (req, res) => {
    try {
        const { empId } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No photo uploaded' });
        }
        
        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, JPG, and GIF are allowed.' });
        }
        
        // Validate file size (e.g., 5MB limit)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'File size exceeds 5MB limit' });
        }
        
        await profileService.uploadPhoto(empId, {
            buffer: req.file.buffer,
            fileName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size
        });
        
        res.json({ message: 'Photo uploaded successfully' });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
};

exports.getPhoto = async (req, res) => {
    try {
        const { empId } = req.params;
        const photo = await profileService.getPhoto(empId);
        
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        
        res.set({
            'Content-Type': photo.PhotoMimeType,
            'Content-Length': photo.PhotoSize,
            'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        });
        
        res.send(photo.PhotoContent);
    } catch (error) {
        console.error('Photo fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
};

exports.deletePhoto = async (req, res) => {
    try {
        const { empId } = req.params;
        
        await profileService.deletePhoto(empId);
        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Photo delete error:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
};

exports.getEmploymentSummary = async (req, res) => {
    try {
        const { empId } = req.params;
        const summary = await profileService.getEmploymentSummary(empId);
        res.json(summary);
    } catch (error) {
        console.error('Employment summary error:', error);
        res.status(500).json({ error: 'Failed to fetch employment summary' });
    }
};
