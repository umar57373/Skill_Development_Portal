// models/Grade.js
const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  email: String,
  quizId: mongoose.Schema.Types.ObjectId,
  quizTitle: String,
  score: Number,
  total: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grade', gradeSchema);
