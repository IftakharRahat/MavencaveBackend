const asyncHandler = require('express-async-handler');
const Blog = require('../models/blogModel');

const allowedStatuses = ['draft', 'published', 'archived'];

const createBlog = asyncHandler(async (req, res) => {
  const { title, content, author, image, category, status } = req.body;
  const normalizedStatus = allowedStatuses.includes(status) ? status : undefined;
  const blog = await Blog.create({
    title,
    content,
    author,
    image,
    category,
    status: normalizedStatus ?? 'draft',
  });
  res.status(201).json(blog);
});

const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs);
});

const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog) {
    res.json(blog);
  } else {
    res.status(404);
    throw new Error('Blog not found');
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const { title, content, author, image, category, status } = req.body;
  const blog = await Blog.findById(req.params.id);

  if (blog) {
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.author = author || blog.author;
    blog.image = image !== undefined ? image : blog.image;
    blog.category = category || blog.category;
    if (status !== undefined && allowedStatuses.includes(status)) {
      blog.status = status;
    }
    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } else {
    res.status(404);
    throw new Error('Blog not found');
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (blog) {
    res.json({ message: 'Blog removed' });
  } else {
    res.status(404);
    throw new Error('Blog not found');
  }
});

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };