const express = require('express');
const router = express.Router();
const { createEventBooking, getEventBookings } = require('../controllers/eventBookingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createEventBooking);

router.route('/:eventId')
  .get(protect, restrictTo('admin', 'content-manager'), getEventBookings);

module.exports = router;