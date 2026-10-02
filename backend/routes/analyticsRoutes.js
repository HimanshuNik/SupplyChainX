const express = require('express');
const router = express.Router();
const { getDashboardStats, getReports } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/reports', protect, getReports);

module.exports = router;
