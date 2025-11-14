// /routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { startSession, getSession, submitAnswer, finishSession } = require('../controllers/sessionController');

router.post('/start', protect, startSession);
router.get('/:sessionId', protect, getSession);
router.post('/:sessionId/answer', protect, submitAnswer);
router.post('/:sessionId/finish', protect, finishSession);

module.exports = router;