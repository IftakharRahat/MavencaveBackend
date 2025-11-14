const express = require('express');
const router = express.Router();
const { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBlogs)
  .post(protect, restrictTo('admin', 'content-manager'), createBlog);

router.route('/:id')
  .get(getBlogById)
  .put(protect, restrictTo('admin', 'content-manager'), updateBlog)
  .delete(protect, restrictTo('admin', 'content-manager'), deleteBlog);

module.exports = router;