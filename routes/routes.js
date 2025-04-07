const express = require('express');
const router = express.Router();
const playlists = require('../data/playlists');  // Ensure you load playlists
const courses = require('../data/courses');      // Ensure you load courses

// Show course modules
router.get('/course/:courseId', (req, res) => {
  const { courseId } = req.params;
  if (!courses[courseId]) {
    return res.status(404).send('Course not found');
  }
  res.render('courses', { courseId, courses });
});

// Show lectures when clicking a module
router.get('/playlists/:playlistId', (req, res) => {
  const { playlistId } = req.params;
  const playlist = playlists.find(p => p.id === playlistId);

  if (!playlist) {
    return res.status(404).send('Module not found');
  }

  res.render('playlists', { playlist });
});

module.exports = router;
