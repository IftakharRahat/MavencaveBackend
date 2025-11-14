// /models/courseModel.js
const mongoose = require('mongoose');

const videoLimit = (val) => val.length <= 25;

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  notes: { type: String, default: '' },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  courseManager: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  // RENAMED 'videos' to 'lessons' for clarity with new features
  lessons: {
    type: [videoSchema],
    validate: [videoLimit, '{PATH} exceeds the limit of 25 lessons'],
  },
  enrolledStudentsCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;