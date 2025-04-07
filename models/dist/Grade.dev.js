"use strict";

// models/Grade.js
var mongoose = require('mongoose');

var gradeSchema = new mongoose.Schema({
  email: String,
  quizId: mongoose.Schema.Types.ObjectId,
  quizTitle: String,
  score: Number,
  total: Number,
  date: {
    type: Date,
    "default": Date.now
  }
});
module.exports = mongoose.model('Grade', gradeSchema);