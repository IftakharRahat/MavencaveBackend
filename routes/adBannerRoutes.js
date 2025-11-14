// /routes/adBannerRoutes.js
const express = require('express');
const router = express.Router();
const { createAdBanner, getAdBanners, updateAdBanner, deleteAdBanner } = require('../controllers/adBannerController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAdBanners)
  .post(protect, restrictTo('content-manager'), createAdBanner);

router.route('/:id')
  .put(protect, restrictTo('content-manager'), updateAdBanner)
  .delete(protect, restrictTo('content-manager'), deleteAdBanner);

module.exports = router;