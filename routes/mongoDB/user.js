const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Quiz = require('../../models/Quiz');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const router = express.Router();

// Profile Picture Upload (Multer config)
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads/profile_pics'));
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4();
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const profileUpload = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Error: File type not supported!'));
    }
});

// Quiz JSON Upload (Multer config)
const quizStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads/quizzes'));
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4();
        cb(null, uniqueName + '.json');
    }
});

const quizUpload = multer({
    storage: quizStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json') return cb(null, true);
        cb(new Error('Error: Only JSON files are supported!'));
    }
});

// Registration
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone, role } = req.body;
        if (!first_name || !last_name || !email || !password || !phone) {
            return res.render('register', { error: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { error: 'User already exists. Please login or use a different email.' });
        }

        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
            phone,
            role: role === 'admin' ? 'admin' : 'user'
        });

        await newUser.save();
        res.render('register_success', { first_name });
    } catch (error) {
        console.log(error.message);
        res.render('register', { error: 'Registration failed. Please try again.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.render('login', { error: 'Invalid email address. User does not exist.' });
        }

        const isMatch = await user.matchPassword(req.body.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid password. Please try again.' });
        }

        req.session.userId = user.email;
        req.session.user = user.toObject();
        return res.redirect('/user/dashboard');
    } catch (error) {
        console.log(error.message);
        res.render('login', { error: 'Login failed. Please try again.' });
    }
});

// Dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await User.findOne({ email: req.session.userId });
    if (!user) {
        req.session.destroy();
        return res.redirect('/login');
    }
    req.session.user = user.toObject();
    res.render('user/dashboard', { user: req.session.user });
});

// Profile
router.get('/profile', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await User.findOne({ email: req.session.userId });
    if (!user) {
        req.session.destroy();
        return res.redirect('/login');
    }
    req.session.user = user.toObject();
    res.render('user/profile', { user: req.session.user });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) return res.render('error', { message: 'Logout failed. Please try again.' });
        res.redirect('/login');
    });
});

// Upload Quiz JSON (admin)
router.post('/upload-quiz', quizUpload.single('quizFile'), async (req, res) => {
    let user = null;
    try {
        if (!req.session.userId) return res.redirect('/login');
        user = await User.findOne({ email: req.session.userId });
        if (!user || user.role !== 'admin') {
            return res.status(403).render('user/quiz', {
                user,
                quizzes: await Quiz.find(),
                error: 'Only admins can upload quizzes.'
            });
        }

        if (!req.file) {
            return res.render('user/quiz', { user, quizzes: await Quiz.find(), error: 'No file uploaded.' });
        }

        const quizData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
        const { title, topic, questions, dueDate } = quizData;

        if (!title || !topic || !questions || !Array.isArray(questions) || !dueDate) {
            fs.unlinkSync(req.file.path);
            return res.render('user/quiz', {
                user,
                quizzes: await Quiz.find(),
                error: 'Invalid quiz JSON format. "dueDate" is required.'
            });
        }

        const quiz = new Quiz({
            title,
            topic,
            questions: questions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]
            })),
            createdBy: user._id,
            dueDate: new Date(dueDate)
        });

        await quiz.save();
        fs.unlinkSync(req.file.path);
        res.render('user/quiz', { user, quizzes: await Quiz.find(), success: 'Quiz uploaded successfully!' });

    } catch (error) {
        console.error('Upload quiz error:', error.stack);
        if (req.file) fs.unlinkSync(req.file.path);
        res.render('user/quiz', { user, quizzes: await Quiz.find(), error: 'Failed to upload quiz.' });
    }
});

// Remove Quiz (admin)
router.delete('/remove-quiz/:id', async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
        const user = await User.findOne({ email: req.session.userId });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can remove quizzes.' });
        }

        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

        res.json({ success: 'Quiz removed successfully!' });
    } catch (error) {
        console.error('Remove quiz error:', error);
        res.status(500).json({ error: 'Failed to remove quiz.' });
    }
});

// Submit Quiz (user) - Removed as it’s handled in app.js
// Edit Profile Picture
router.put('/edit-profile-pic/:id', profileUpload.single('profile_pic'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No file uploaded.');

        const user = await User.findByIdAndUpdate(req.params.id, { profile_pic: req.file.filename }, { new: true });
        if (!user) return res.status(404).send('User not found.');

        req.session.user = user.toObject();
        res.json({ message: 'Profile Picture has been uploaded successfully!', file: req.file });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Edit Personal Info
router.put('/edit-personal-info/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).send('User not found.');

        req.session.user = user.toObject();
        res.json({ message: 'Personal information has been successfully updated' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Edit Contact Info
router.put('/edit-contact-info/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).send('User not found.');

        req.session.user = user.toObject();
        res.json({ message: 'Contact information has been successfully updated' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;