// /controllers/questionController.js
const asyncHandler = require('express-async-handler');
const Question = require('../models/questionModel');

const getQuestionsForExam = asyncHandler(async (req, res) => {
  const list = await Question.find({ exam: req.params.examId });
  res.json(list);
});

const createQuestion = asyncHandler(async (req, res) => {
  const examId = req.params.examId;
  const payload = { ...req.body, exam: examId };
  const q = await Question.create(payload);
  res.status(201).json(q);
});

const updateQuestion = asyncHandler(async (req, res) => {
  const q = await Question.findByIdAndUpdate(req.params.questionId, req.body, { new: true });
  if(!q) {
      res.status(404);
      throw new Error('Question not found');
  }
  res.json(q);
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const q = await Question.findByIdAndDelete(req.params.questionId);
  if(!q) {
      res.status(404);
      throw new Error('Question not found');
  }
  res.json({ message: 'Question deleted' });
});

module.exports = { getQuestionsForExam, createQuestion, updateQuestion, deleteQuestion };