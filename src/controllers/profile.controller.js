const profileService = require('../services/profile.service');

exports.getProfile = async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.cookies.EmpID, req.cookies.Context.CompanyID);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    await profileService.updateProfile(req.cookies.EmpID, req.cookies.Context.CompanyID, req.body);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const photo = req.file.buffer;
    await profileService.uploadPhoto(req.cookies.EmpID, photo);
    res.json({ message: "Photo uploaded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPhoto = async (req, res) => {
  try {
    const photo = await profileService.getPhoto(req.cookies.EmpID);
    if (photo) {
      res.contentType('image/jpeg').send(photo);
    } else {
      res.status(404).json({ error: "Photo not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    await profileService.deletePhoto(req.cookies.EmpID);
    res.json({ message: "Photo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEmploymentSummary = async (req, res) => {
  try {
    const summary = await profileService.getEmploymentSummary(req.cookies.EmpID, req.cookies.Context.CompanyID);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPersonalInfo = async (req, res) => {
  try {
    const info = await profileService.getPersonalInfo(req.cookies.EmpID, req.cookies.Context.CompanyID);
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePersonalInfo = async (req, res) => {
  try {
    await profileService.updatePersonalInfo(req.cookies.EmpID, req.cookies.Context.CompanyID, req.body);
    res.json({ message: "Personal info updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getContactInfo = async (req, res) => {
  try {
    const info = await profileService.getContactInfo(req.cookies.EmpID, req.cookies.Context.CompanyID);
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    await profileService.updateContactInfo(req.cookies.EmpID, req.cookies.Context.CompanyID, req.body);
    res.json({ message: "Contact info updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfileSummary = async (req, res) => {
  try {
    const summary = await profileService.getProfileSummary(req.cookies.EmpID, req.cookies.Context.CompanyID);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const calendar = await profileService.getCalendar(req.cookies.EmpID, req.cookies.Context.CompanyID);
    res.json(calendar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
