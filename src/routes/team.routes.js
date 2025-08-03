const express = require('express');
const teamController = require('../controllers/team.controller');
const router = express.Router();
router.get('/getTeamHeirarchy', teamController.getTeamHierarchy);
router.get('/getTeamCalendar',teamController.getTeamCalendar)
module.exports = router;
