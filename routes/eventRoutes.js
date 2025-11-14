const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(getEvents)
  .post(protect, restrictTo('admin', 'content-manager'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, restrictTo('admin', 'content-manager'), updateEvent)
  .delete(protect, restrictTo('admin', 'content-manager'), deleteEvent);

module.exports = router;