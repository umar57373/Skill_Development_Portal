"use strict";

var express = require('express');

var path = require('path');

var fs = require('fs');

var cookieParser = require('cookie-parser');

var url = require('url');

var session = require('express-session');

var connectDB = require('./config/config');

var playlists = require('./playlists/playlists');

var Quiz = require('./models/Quiz');

var User = require('./models/User');

require('dotenv').config();

connectDB();

var dsaRoute = require('./routes/dsaRoute');

var CoursesRoute = require('./routes/courses');

var userRoute = require('./routes/mongoDB/user');

var subscribeRoute = require('./routes/subscribe');

var dsaaRoute = require('./routes/dsa1');

var app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express["static"](path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production'
  }
}));
app.use('/courses', CoursesRoute);
app.use('/dsa', dsaRoute);
app.use('/dsa1', dsaaRoute);
app.use('/user', userRoute);
app.post('/subscribe', subscribeRoute);
app.post('/user/subscribe', subscribeRoute); // Quiz route (GET)

app.get('/user/quiz', function _callee(req, res) {
  var user, quizzes;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;

          if (req.session.userId) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", res.redirect('/login'));

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.session.userId
          }));

        case 5:
          user = _context.sent;

          if (user) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", res.redirect('/login'));

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(Quiz.find());

        case 10:
          quizzes = _context.sent;
          res.render('user/quiz', {
            user: user,
            quizzes: quizzes
          });
          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error('Quiz route error:', _context.t0);
          res.status(500).send('Internal Server Error');

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
}); // Quiz submission (POST)

app.post('/user/quiz/submit/:quizId', function _callee2(req, res) {
  var user, quiz, score;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;

          if (req.session.userId) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", res.redirect('/login'));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.session.userId
          }));

        case 5:
          user = _context2.sent;
          _context2.next = 8;
          return regeneratorRuntime.awrap(Quiz.findById(req.params.quizId));

        case 8:
          quiz = _context2.sent;

          if (!(!quiz || quiz.submissions.some(function (sub) {
            return String(sub.user) === String(user._id);
          }))) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", res.status(403).send('You have already submitted this quiz.'));

        case 11:
          score = 0;
          quiz.questions.forEach(function (question, index) {
            // Ensure submitted answers are always treated as an array
            var submitted = Array.isArray(req.body["q".concat(index)]) ? req.body["q".concat(index)] : [req.body["q".concat(index)] || ''];
            var correct = question.correctAnswer; // Check if submitted answers exactly match correct answers

            var isCorrect = submitted.length === correct.length && submitted.every(function (ans) {
              return correct.includes(ans);
            }) && correct.every(function (ans) {
              return submitted.includes(ans);
            });

            if (isCorrect) {
              score++;
            }
          });
          quiz.submissions.push({
            user: user._id,
            score: score
          });
          _context2.next = 16;
          return regeneratorRuntime.awrap(quiz.save());

        case 16:
          res.redirect('/user/grades');
          _context2.next = 23;
          break;

        case 19:
          _context2.prev = 19;
          _context2.t0 = _context2["catch"](0);
          console.error('Quiz submit error:', _context2.t0);
          res.status(500).send('Internal Server Error');

        case 23:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 19]]);
}); // Grades route

app.get('/user/grades', function _callee3(req, res) {
  var user, quizzes, grades;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;

          if (req.session.userId) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", res.redirect('/login'));

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.session.userId
          }));

        case 5:
          user = _context3.sent;
          _context3.next = 8;
          return regeneratorRuntime.awrap(Quiz.find());

        case 8:
          quizzes = _context3.sent;
          grades = quizzes.map(function (quiz) {
            var submission = quiz.submissions.find(function (sub) {
              return String(sub.user) === String(user._id);
            });
            return submission ? {
              title: quiz.title,
              score: submission.score,
              total: quiz.questions.length
            } : null;
          }).filter(Boolean);
          res.render('user/grades', {
            user: user,
            grades: grades
          });
          _context3.next = 17;
          break;

        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](0);
          console.error('Grades error:', _context3.t0);
          res.status(500).send('Internal Server Error');

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 13]]);
}); // Dashboard

app.get('/user/dashboard', function _callee4(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (req.session.userId) {
            _context4.next = 2;
            break;
          }

          return _context4.abrupt("return", res.redirect('/login'));

        case 2:
          _context4.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.session.userId
          }));

        case 4:
          user = _context4.sent;

          if (user) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", res.redirect('/login'));

        case 7:
          res.render('user/dashboard', {
            user: user
          });

        case 8:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // Other user routes (unchanged)

app.get('/user/courses-list', function (req, res) {
  if (!req.session.userId) return res.redirect('/login');
  res.render('user/courses-list');
});
app.get('/user/purchase', function (req, res) {
  if (!req.session.userId) return res.redirect('/login');
  res.render('user/purchase');
});
app.get('/user/Coding_Question', function (req, res) {
  if (!req.session.userId) return res.redirect('/login');
  res.render('user/Coding_Question');
});
app.get('/user/Assignments', function _callee5(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          if (req.session.userId) {
            _context5.next = 2;
            break;
          }

          return _context5.abrupt("return", res.redirect('/login'));

        case 2:
          _context5.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.session.userId
          }));

        case 4:
          user = _context5.sent;

          if (user) {
            _context5.next = 7;
            break;
          }

          return _context5.abrupt("return", res.redirect('/login'));

        case 7:
          res.render('user/Assignments', {
            user: user
          });

        case 8:
        case "end":
          return _context5.stop();
      }
    }
  });
});
app.get('/user/Videos', function (req, res) {
  if (!req.session.userId) return res.redirect('/login');
  res.render('user/Videos');
});
app.get('/user/support', function (req, res) {
  if (!req.session.userId) return res.redirect('/login');
  res.render('user/support');
});
app.get('/user/profile', function _callee6(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          if (req.session.userId) {
            _context6.next = 2;
            break;
          }

          return _context6.abrupt("return", res.redirect('/login'));

        case 2:
          _context6.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.session.userId
          }));

        case 4:
          user = _context6.sent;

          if (user) {
            _context6.next = 7;
            break;
          }

          return _context6.abrupt("return", res.redirect('/login'));

        case 7:
          res.render('user/profile', {
            user: user
          });

        case 8:
        case "end":
          return _context6.stop();
      }
    }
  });
});
app.get('/user/:id', function (req, res) {
  var id = req.params.id;
  var playlist = playlists.find(function (pl) {
    return String(pl.id) === String(id);
  });

  if (!playlist) {
    return res.status(404).render('user/Videos', {
      playlist: null
    });
  }

  var selectedVideoIndex = 0;
  res.render('user/Videos', {
    playlist: playlist,
    selectedVideoIndex: selectedVideoIndex
  });
});
app.get('/user/playlists/web-dev', function (req, res) {
  var courses = playlists.filter(function (p) {
    return p.category === 'web-dev';
  });
  res.render('user/playlists/WEB-DEV', {
    courses: courses
  });
});
app.get('/user/playlists/dsa', function (req, res) {
  var courses = playlists.filter(function (p) {
    return p.category === 'dsa';
  });
  res.render('user/playlists/DSA', {
    courses: courses
  });
});
app.get('/user/playlists/cp', function (req, res) {
  var courses = playlists.filter(function (p) {
    return p.category === 'cp';
  });
  res.render('user/playlists/CP', {
    courses: courses
  });
});
app.get('/user/playlists/ai-ml', function (req, res) {
  var courses = playlists.filter(function (p) {
    return p.category === 'ai-ml';
  });
  res.render('user/playlists/AI-ML', {
    courses: courses
  });
});
app.get('/user/playlists/blockchain', function (req, res) {
  var courses = playlists.filter(function (p) {
    return p.category === 'blockchain' || p.category === 'cyber-security';
  });
  res.render('user/playlists/BLOCKCHAIN', {
    courses: courses
  });
});
app.get('/user/playlists/cyber-security', function (req, res) {
  var courses = playlists.filter(function (p) {
    return p.category === 'blockchain' || p.category === 'cyber-security';
  });
  res.render('user/playlists/CYBER-SECURITY', {
    courses: courses
  });
});
app.get('/user/:id/video/:index', function (req, res) {
  var _req$params = req.params,
      id = _req$params.id,
      index = _req$params.index;
  var playlist = playlists.find(function (pl) {
    return String(pl.id) === String(id);
  });

  if (!playlist) {
    return res.status(404).render('user/Videos', {
      playlist: null
    });
  }

  var selectedVideoIndex = parseInt(index, 10);

  if (isNaN(selectedVideoIndex) || selectedVideoIndex >= playlist.videos.length) {
    return res.status(404).render('user/Videos', {
      playlist: playlist,
      selectedVideoIndex: 0
    });
  }

  res.render('user/Videos', {
    playlist: playlist,
    selectedVideoIndex: selectedVideoIndex
  });
}); // Login and Register routes

app.get('/login', function (req, res) {
  res.render('login');
});
app.get('/register', function (req, res) {
  res.render('register');
}); // 404 handler

app.use(function (req, res, next) {
  var viewName = url.parse(req.url, true).pathname.substring(1);
  var viewPath = path.join(__dirname, 'views', viewName);

  if (fs.existsSync(viewPath + '.pug')) {
    return res.render(viewName);
  } else {
    return res.status(404).render('error', {
      error: 'Page Not Found',
      status: 404,
      message: 'The page you are looking for does not exist.'
    });
  }
}); // Error handler

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal Server Error');
});
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server is running @ http://localhost:".concat(port));
});