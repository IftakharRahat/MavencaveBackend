const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  image: { type: String },
  category: { type: String, default: 'general' },
  status: { type: String, enum: ['published', 'draft', 'archived'], default: 'draft' },
  clicks: { type: Number, default: 0 },
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;