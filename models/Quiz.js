const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: [{ type: String, required: true }] // Array of correct answers
});

const submissionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now }
});

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    topic: { type: String, enum: ['Training', 'Placements'], required: true },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    submissions: [submissionSchema] // Array of submissions
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
