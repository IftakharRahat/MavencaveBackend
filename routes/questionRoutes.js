// /routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getQuestionsForExam, createQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');

router.get('/exam/:examId', getQuestionsForExam);

router.post('/:examId', protect, restrictTo('admin'), createQuestion);
router.put('/:questionId', protect, restrictTo('admin'), updateQuestion);
router.delete('/:questionId', protect, restrictTo('admin'), deleteQuestion);

module.exports = router;