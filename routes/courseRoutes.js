const express = require('express');
const router = express.Router();
const { 
  createCourse, 
  getMyCourses, 
  addLessonToCourse,
  getCourseDetails,
  getCourseLessons
} = require('../controllers/courseController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/checkSubscriptionMiddleware');

// --- Routes for Course Managers ---
router.route('/')
  .post(protect, restrictTo('course-manager'), createCourse)
  .get(protect, restrictTo('course-manager'), getMyCourses);

// NOTE: Renamed the route from `/videos` to `/lessons` for consistency
router.route('/:id/lessons')
  .post(protect, restrictTo('course-manager'), addLessonToCourse);

// --- Routes for Public/Students ---

// GET public course details
router.route('/:courseId')
  .get(getCourseDetails);

// GET course lessons (requires login and subscription)
router.route('/:courseId/lessons')
  .get(protect, checkSubscription, getCourseLessons);

module.exports = router;