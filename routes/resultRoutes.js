// /routes/resultRoutes.js
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getResult, getUserResults, gradeWriting } = require('../controllers/resultController');

router.get('/user/:userId', protect, getUserResults);
router.get('/:sessionId', protect, getResult);
router.post('/:sessionId/grade-writing', protect, restrictTo('admin'), gradeWriting);

module.exports = router;