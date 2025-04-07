const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const url = require('url');
const session = require('express-session');
const connectDB = require('./config/config');
const playlists = require('./playlists/playlists');
const Quiz = require('./models/Quiz');
const User = require('./models/User');
require('dotenv').config();

connectDB();

const dsaRoute = require('./routes/dsaRoute');
const CoursesRoute = require('./routes/courses');
const userRoute = require('./routes/mongoDB/user');
const subscribeRoute = require('./routes/subscribe');
const dsaaRoute = require('./routes/dsa1');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use('/courses', CoursesRoute);
app.use('/dsa', dsaRoute);
app.use('/dsa1', dsaaRoute);
app.use('/user', userRoute);
app.post('/subscribe', subscribeRoute);
app.post('/user/subscribe', subscribeRoute);

// Quiz route (GET)
app.get('/user/quiz', async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const user = await User.findOne({ email: req.session.userId });
        if (!user) return res.redirect('/login');
        const quizzes = await Quiz.find();
        res.render('user/quiz', { user, quizzes });
    } catch (error) {
        console.error('Quiz route error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Quiz submission (POST)
app.post('/user/quiz/submit/:quizId', async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const user = await User.findOne({ email: req.session.userId });
        const quiz = await Quiz.findById(req.params.quizId);

        if (!quiz || quiz.submissions.some(sub => String(sub.user) === String(user._id))) {
            return res.status(403).send('You have already submitted this quiz.');
        }

        let score = 0;
        quiz.questions.forEach((question, index) => {
            // Ensure submitted answers are always treated as an array
            const submitted = Array.isArray(req.body[`q${index}`]) ? req.body[`q${index}`] : [req.body[`q${index}`] || ''];
            const correct = question.correctAnswer;

            // Check if submitted answers exactly match correct answers
            const isCorrect = submitted.length === correct.length && 
                             submitted.every(ans => correct.includes(ans)) && 
                             correct.every(ans => submitted.includes(ans));
            if (isCorrect) {
                score++;
            }
        });

        quiz.submissions.push({ user: user._id, score });
        await quiz.save();
        res.redirect('/user/grades');
    } catch (err) {
        console.error('Quiz submit error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Grades route
app.get('/user/grades', async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const user = await User.findOne({ email: req.session.userId });
        const quizzes = await Quiz.find();

        const grades = quizzes.map(quiz => {
            const submission = quiz.submissions.find(sub => String(sub.user) === String(user._id));
            return submission ? { title: quiz.title, score: submission.score, total: quiz.questions.length } : null;
        }).filter(Boolean);

        res.render('user/grades', { user, grades });
    } catch (error) {
        console.error('Grades error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Dashboard
app.get('/user/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await User.findOne({ email: req.session.userId });
    if (!user) return res.redirect('/login');
    res.render('user/dashboard', { user });
});

// Other user routes (unchanged)
app.get('/user/courses-list', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('user/courses-list');
});

app.get('/user/purchase', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('user/purchase');
});

app.get('/user/Coding_Question', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('user/Coding_Question');
});

app.get('/user/Assignments', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await User.findOne({ email: req.session.userId });
    if (!user) return res.redirect('/login');
    res.render('user/Assignments', { user });
});

app.get('/user/Videos', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('user/Videos');
});

app.get('/user/support', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('user/support');
});

app.get('/user/profile', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await User.findOne({ email: req.session.userId });
    if (!user) return res.redirect('/login');
    res.render('user/profile', { user });
});

app.get('/user/:id', (req, res) => {
    const { id } = req.params;
    const playlist = playlists.find((pl) => String(pl.id) === String(id));
    if (!playlist) {
        return res.status(404).render('user/Videos', { playlist: null });
    }
    const selectedVideoIndex = 0;
    res.render('user/Videos', { playlist, selectedVideoIndex });
});

app.get('/user/playlists/web-dev', (req, res) => {
    const courses = playlists.filter(p => p.category === 'web-dev');
    res.render('user/playlists/WEB-DEV', { courses });
});

app.get('/user/playlists/dsa', (req, res) => {
    const courses = playlists.filter(p => p.category === 'dsa');
    res.render('user/playlists/DSA', { courses });
});

app.get('/user/playlists/cp', (req, res) => {
    const courses = playlists.filter(p => p.category === 'cp');
    res.render('user/playlists/CP', { courses });
});

app.get('/user/playlists/ai-ml', (req, res) => {
    const courses = playlists.filter(p => p.category === 'ai-ml');
    res.render('user/playlists/AI-ML', { courses });
});

app.get('/user/playlists/blockchain', (req, res) => {
    const courses = playlists.filter(p => p.category === 'blockchain' || p.category === 'cyber-security');
    res.render('user/playlists/BLOCKCHAIN', { courses });
});

app.get('/user/playlists/cyber-security', (req, res) => {
    const courses = playlists.filter(p => p.category === 'blockchain' || p.category === 'cyber-security');
    res.render('user/playlists/CYBER-SECURITY', { courses });
});

app.get('/user/:id/video/:index', (req, res) => {
    const { id, index } = req.params;
    const playlist = playlists.find((pl) => String(pl.id) === String(id));
    if (!playlist) {
        return res.status(404).render('user/Videos', { playlist: null });
    }
    const selectedVideoIndex = parseInt(index, 10);
    if (isNaN(selectedVideoIndex) || selectedVideoIndex >= playlist.videos.length) {
        return res.status(404).render('user/Videos', { playlist, selectedVideoIndex: 0 });
    }
    res.render('user/Videos', { playlist, selectedVideoIndex });
});

// Login and Register routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

// 404 handler
app.use((req, res, next) => {
    const viewName = url.parse(req.url, true).pathname.substring(1);
    const viewPath = path.join(__dirname, 'views', viewName);
    if (fs.existsSync(viewPath + '.pug')) {
        return res.render(viewName);
    } else {
        return res.status(404).render('error', {
            error: 'Page Not Found',
            status: 404,
            message: 'The page you are looking for does not exist.'
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running @ http://localhost:${port}`);
});