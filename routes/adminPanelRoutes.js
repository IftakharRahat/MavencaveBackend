const express = require('express');
const router = express.Router();
const { getAdminPanelData } = require('../controllers/adminPanelController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, restrictTo('admin', 'content-manager'), getAdminPanelData);

module.exports = router;