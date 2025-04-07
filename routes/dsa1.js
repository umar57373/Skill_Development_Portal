const express = require('express');
const router = express.Router();
const path = require('path');

// Load the JSON data
const courseData = require('../data/dsa1.json'); // Adjust path if needed

// Route to serve DSA JSON file directly
router.get('/questions', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/dsa1.json'));
});

// Route for rendering DSA questions page
router.get('/', (req, res) => {
    res.render('quiz', { course: courseData.course }); // Pass course data to quiz.pug
});

module.exports = router;