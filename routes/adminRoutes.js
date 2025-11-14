const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getAdminDashboardOverview,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect, restrictTo('admin'));

router.route('/users').post(createUser).get(getUsers);
router.route('/users/:id').put(updateUser).delete(deleteUser);
router.route('/dashboard/overview').get(getAdminDashboardOverview);

module.exports = router;