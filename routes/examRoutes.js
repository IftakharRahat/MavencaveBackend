const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { listExams, getExam, createExam, updateExam, deleteExam } = require('../controllers/examController');

router.route('/')
    .get(listExams)
    .post(protect, restrictTo('admin'), createExam);

router.route('/:examId')
    .get(getExam)
    .put(protect, restrictTo('admin'), updateExam)
    .delete(protect, restrictTo('admin'), deleteExam);

module.exports = router;