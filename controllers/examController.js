const asyncHandler = require('express-async-handler');
const Exam = require('../models/examModel');

const listExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find();
  res.json(exams);
});

const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId);
  if(!exam) {
      res.status(404);
      throw new Error('Exam not found');
  }
  res.json(exam);
});

const createExam = asyncHandler(async (req, res) => {
  const exam = await Exam.create(req.body);
  res.status(201).json(exam);
});

const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.examId, req.body, { new: true });
  if(!exam) {
      res.status(404);
      throw new Error('Exam not found');
  }
  res.json(exam);
});

const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.examId);
   if(!exam) {
      res.status(404);
      throw new Error('Exam not found');
  }
  res.json({ message: 'Exam deleted' });
});

module.exports = { listExams, getExam, createExam, updateExam, deleteExam };