// /routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sessionReport, userTrend } = require('../controllers/reportController');

router.get('/session/:sessionId', protect, sessionReport);
router.get('/user/:userId', protect, userTrend);

module.exports = router;