const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Password is now optional
  role: {
    type: String,
    enum: ['admin', 'content-manager', 'course-manager', 'user'],
    default: 'user',
  },
  country: {
    type: String,
    default: 'অনির্ধারিত',
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  lastActiveAt: {
    type: Date,
  },
  googleId: { type: String },   // For Google OAuth
  facebookId: { type: String }, // For Facebook OAuth
}, { timestamps: true });

// Hash password before saving (only if it's provided/modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;