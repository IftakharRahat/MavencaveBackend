// /controllers/courseController.js
const asyncHandler = require('../utils/asyncHandler');
const Course = require('../models/courseModel');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create a new course
// @route   POST /api/v1/courses
// @access  Private/CourseManager
const createCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const course = await Course.create({
    title,
    description,
    courseManager: req.user._id,
  });
  res.status(201).json(new ApiResponse(201, course, "Course created successfully"));
});

// @desc    Get all courses for the logged-in manager
// @route   GET /api/v1/courses
// @access  Private/CourseManager
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ courseManager: req.user._id });
  res.status(200).json(new ApiResponse(200, courses, "Your courses fetched successfully"));
});

// @desc    Add a lesson to a course
// @route   POST /api/v1/courses/:id/lessons
// @access  Private/CourseManager
const addLessonToCourse = asyncHandler(async (req, res) => {
  const { title, videoUrl, notes } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }
  
  if (course.courseManager.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'User not authorized to modify this course');
  }

  course.lessons.push({ title, videoUrl, notes });
  const updatedCourse = await course.save();
  res.status(201).json(new ApiResponse(201, updatedCourse.lessons, "Lesson added successfully"));
});

// --- NEW CONTROLLERS ---

// @desc    Get public course details
// @route   GET /api/v1/courses/:courseId
// @access  Public
const getCourseDetails = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).select("-lessons"); 

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    res.status(200).json(new ApiResponse(200, course, "Course details fetched successfully"));
});

// @desc    Get course lessons (for subscribed users)
// @route   GET /api/v1/courses/:courseId/lessons
// @access  Private (Subscribed Users)
const getCourseLessons = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const courseWithLessons = await Course.findById(courseId);

    if (!courseWithLessons) {
        throw new ApiError(404, "Course not found");
    }
    
    res.status(200).json(new ApiResponse(200, courseWithLessons.lessons, "Course lessons fetched successfully."));
});


module.exports = { createCourse, getMyCourses, addLessonToCourse, getCourseDetails, getCourseLessons };