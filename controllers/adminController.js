// /controllers/adminController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Create a new user (Course or Content Manager)
// @route   POST /api/v1/admin/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role = 'user',
    country,
    status,
    avatarUrl,
  } = req.body;

  if (role === 'admin') {
    res.status(400);
    throw new Error('Cannot create another admin account');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    country,
    status,
    avatarUrl,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      country: user.country,
      status: user.status,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get all non-admin users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    q,
    status,
  } = req.query;

  const pageNumber = Math.max(1, parseInt(page, 10));
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNumber - 1) * pageSize;

  const query = { role: { $ne: 'admin' } };

  if (status && status !== 'all') {
    query.status = status === 'inactive' ? 'inactive' : 'active';
  }

  if (q) {
    const regex = new RegExp(q, 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    User.countDocuments(query),
  ]);

  res.json({
    users,
    meta: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// @desc    Update a user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.country = req.body.country || user.country;
    user.status = req.body.status || user.status;
    user.avatarUrl = req.body.avatarUrl ?? user.avatarUrl;
    
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      country: updatedUser.country,
      status: updatedUser.status,
      avatarUrl: updatedUser.avatarUrl,
      createdAt: updatedUser.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete another admin account');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const getAdminDashboardOverview = asyncHandler(async (req, res) => {
  const nonAdminFilter = { role: { $ne: 'admin' } };
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    totalUsers,
    newUsersLast30,
    activeUsers,
    managerUsers,
    trendData,
    countryData,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(nonAdminFilter),
    User.countDocuments({ ...nonAdminFilter, createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ ...nonAdminFilter, status: 'active' }),
    User.countDocuments({ role: { $in: ['content-manager', 'course-manager'] } }),
    User.aggregate([
      { $match: { ...nonAdminFilter, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: nonAdminFilter },
      {
        $group: {
          _id: { $ifNull: ['$country', 'অনির্ধারিত'] },
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
      { $limit: 6 },
    ]),
    User.find(nonAdminFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email status role createdAt'),
  ]);

  const visitors = trendData.map((item) => ({
    day: item._id,
    count: item.count,
  }));

  const countries = countryData.map((item) => ({
    name: item._id,
    value: item.value,
  }));

  const updates = recentUsers.map((user, index) => ({
    id: index + 1,
    type: user.role === 'user' ? 'ব্যবহারকারী' : 'ম্যানেজার',
    title: user.name,
    date: user.createdAt.toISOString(),
    status: user.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়',
  }));

  res.json({
    cards: {
      totalUsers,
      newUsers: newUsersLast30,
      activeUsers,
      rewardedUsers: managerUsers,
    },
    visitors,
    countries,
    updates,
  });
});

module.exports = { createUser, getUsers, updateUser, deleteUser, getAdminDashboardOverview };