const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Standard email/password routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Social OAuth routes disabled for now

module.exports = router;