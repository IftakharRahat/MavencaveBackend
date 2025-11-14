const express = require('express');
const router = express.Router();
const { createAboutUs, getAboutUs, updateAboutUs } = require('../controllers/aboutUsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAboutUs)
  .post(protect, restrictTo('admin', 'content-manager'), createAboutUs);

router.route('/:id')
  .put(protect, restrictTo('admin', 'content-manager'), updateAboutUs);

module.exports = router;