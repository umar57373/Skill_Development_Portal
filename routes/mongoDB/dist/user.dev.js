"use strict";

var express = require('express');

var jwt = require('jsonwebtoken');

var User = require('../../models/User');

var Quiz = require('../../models/Quiz');

var multer = require('multer');

var path = require('path');

var fs = require('fs');

var _require = require('uuid'),
    uuidv4 = _require.v4;

require('dotenv').config();

var router = express.Router(); // Profile Picture Upload (Multer config)

var profileStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/profile_pics'));
  },
  filename: function filename(req, file, cb) {
    var uniqueName = uuidv4();
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
var profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function fileFilter(req, file, cb) {
    var filetypes = /jpeg|jpg|png|gif/;
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    var mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Error: File type not supported!'));
  }
}); // Quiz JSON Upload (Multer config)

var quizStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/quizzes'));
  },
  filename: function filename(req, file, cb) {
    var uniqueName = uuidv4();
    cb(null, uniqueName + '.json');
  }
});
var quizUpload = multer({
  storage: quizStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function fileFilter(req, file, cb) {
    if (file.mimetype === 'application/json') return cb(null, true);
    cb(new Error('Error: Only JSON files are supported!'));
  }
}); // Registration

router.post('/register', function _callee(req, res) {
  var _req$body, first_name, last_name, email, password, phone, role, existingUser, newUser;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, first_name = _req$body.first_name, last_name = _req$body.last_name, email = _req$body.email, password = _req$body.password, phone = _req$body.phone, role = _req$body.role;

          if (!(!first_name || !last_name || !email || !password || !phone)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.render('register', {
            error: 'All fields are required.'
          }));

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 6:
          existingUser = _context.sent;

          if (!existingUser) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", res.render('register', {
            error: 'User already exists. Please login or use a different email.'
          }));

        case 9:
          newUser = new User({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password,
            phone: phone,
            role: role === 'admin' ? 'admin' : 'user'
          });
          _context.next = 12;
          return regeneratorRuntime.awrap(newUser.save());

        case 12:
          res.render('register_success', {
            first_name: first_name
          });
          _context.next = 19;
          break;

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0.message);
          res.render('register', {
            error: 'Registration failed. Please try again.'
          });

        case 19:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 15]]);
}); // Login

router.post('/login', function _callee2(req, res) {
  var user, isMatch;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 3:
          user = _context2.sent;

          if (user) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", res.render('login', {
            error: 'Invalid email address. User does not exist.'
          }));

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(user.matchPassword(req.body.password));

        case 8:
          isMatch = _context2.sent;

          if (isMatch) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", res.render('login', {
            error: 'Invalid password. Please try again.'
          }));

        case 11:
          req.session.userId = user.email;
          req.session.user = user.toObject();
          return _context2.abrupt("return", res.redirect('/user/dashboard'));

        case 16:
          _context2.prev = 16;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0.message);
          res.render('login', {
            error: 'Login failed. Please try again.'
          });

        case 20:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 16]]);
}); // Dashboard

router.get('/dashboard', function _callee3(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (req.session.userId) {
            _context3.next = 2;
            break;
          }

          return _context3.abrupt("return", res.redirect('/login'));

        case 2:
          _context3.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.session.userId
          }));

        case 4:
          user = _context3.sent;

          if (user) {
            _context3.next = 8;
            break;
          }

          req.session.destroy();
          return _context3.abrupt("return", res.redirect('/login'));

        case 8:
          req.session.user = user.toObject();
          res.render('user/dashboard', {
            user: req.session.user
          });

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // Profile

router.get('/profile', function _callee4(req, res) {
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
            _context4.next = 8;
            break;
          }

          req.session.destroy();
          return _context4.abrupt("return", res.redirect('/login'));

        case 8:
          req.session.user = user.toObject();
          res.render('user/profile', {
            user: req.session.user
          });

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // Logout

router.get('/logout', function (req, res) {
  req.session.destroy(function (error) {
    if (error) return res.render('error', {
      message: 'Logout failed. Please try again.'
    });
    res.redirect('/login');
  });
}); // Upload Quiz JSON (admin)

router.post('/upload-quiz', quizUpload.single('quizFile'), function _callee5(req, res) {
  var user, quizData, title, topic, questions, dueDate, quiz;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          user = null;
          _context5.prev = 1;

          if (req.session.userId) {
            _context5.next = 4;
            break;
          }

          return _context5.abrupt("return", res.redirect('/login'));

        case 4:
          _context5.next = 6;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.session.userId
          }));

        case 6:
          user = _context5.sent;

          if (!(!user || user.role !== 'admin')) {
            _context5.next = 15;
            break;
          }

          _context5.t0 = res.status(403);
          _context5.t1 = user;
          _context5.next = 12;
          return regeneratorRuntime.awrap(Quiz.find());

        case 12:
          _context5.t2 = _context5.sent;
          _context5.t3 = {
            user: _context5.t1,
            quizzes: _context5.t2,
            error: 'Only admins can upload quizzes.'
          };
          return _context5.abrupt("return", _context5.t0.render.call(_context5.t0, 'user/quiz', _context5.t3));

        case 15:
          if (req.file) {
            _context5.next = 23;
            break;
          }

          _context5.t4 = res;
          _context5.t5 = user;
          _context5.next = 20;
          return regeneratorRuntime.awrap(Quiz.find());

        case 20:
          _context5.t6 = _context5.sent;
          _context5.t7 = {
            user: _context5.t5,
            quizzes: _context5.t6,
            error: 'No file uploaded.'
          };
          return _context5.abrupt("return", _context5.t4.render.call(_context5.t4, 'user/quiz', _context5.t7));

        case 23:
          quizData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
          title = quizData.title, topic = quizData.topic, questions = quizData.questions, dueDate = quizData.dueDate;

          if (!(!title || !topic || !questions || !Array.isArray(questions) || !dueDate)) {
            _context5.next = 34;
            break;
          }

          fs.unlinkSync(req.file.path);
          _context5.t8 = res;
          _context5.t9 = user;
          _context5.next = 31;
          return regeneratorRuntime.awrap(Quiz.find());

        case 31:
          _context5.t10 = _context5.sent;
          _context5.t11 = {
            user: _context5.t9,
            quizzes: _context5.t10,
            error: 'Invalid quiz JSON format. "dueDate" is required.'
          };
          return _context5.abrupt("return", _context5.t8.render.call(_context5.t8, 'user/quiz', _context5.t11));

        case 34:
          quiz = new Quiz({
            title: title,
            topic: topic,
            questions: questions.map(function (q) {
              return {
                question: q.question,
                options: q.options,
                correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]
              };
            }),
            createdBy: user._id,
            dueDate: new Date(dueDate)
          });
          _context5.next = 37;
          return regeneratorRuntime.awrap(quiz.save());

        case 37:
          fs.unlinkSync(req.file.path);
          _context5.t12 = res;
          _context5.t13 = user;
          _context5.next = 42;
          return regeneratorRuntime.awrap(Quiz.find());

        case 42:
          _context5.t14 = _context5.sent;
          _context5.t15 = {
            user: _context5.t13,
            quizzes: _context5.t14,
            success: 'Quiz uploaded successfully!'
          };

          _context5.t12.render.call(_context5.t12, 'user/quiz', _context5.t15);

          _context5.next = 58;
          break;

        case 47:
          _context5.prev = 47;
          _context5.t16 = _context5["catch"](1);
          console.error('Upload quiz error:', _context5.t16.stack);
          if (req.file) fs.unlinkSync(req.file.path);
          _context5.t17 = res;
          _context5.t18 = user;
          _context5.next = 55;
          return regeneratorRuntime.awrap(Quiz.find());

        case 55:
          _context5.t19 = _context5.sent;
          _context5.t20 = {
            user: _context5.t18,
            quizzes: _context5.t19,
            error: 'Failed to upload quiz.'
          };

          _context5.t17.render.call(_context5.t17, 'user/quiz', _context5.t20);

        case 58:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 47]]);
}); // Remove Quiz (admin)

router["delete"]('/remove-quiz/:id', function _callee6(req, res) {
  var user, quiz;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;

          if (req.session.userId) {
            _context6.next = 3;
            break;
          }

          return _context6.abrupt("return", res.status(401).json({
            error: 'Unauthorized'
          }));

        case 3:
          _context6.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.session.userId
          }));

        case 5:
          user = _context6.sent;

          if (!(!user || user.role !== 'admin')) {
            _context6.next = 8;
            break;
          }

          return _context6.abrupt("return", res.status(403).json({
            error: 'Only admins can remove quizzes.'
          }));

        case 8:
          _context6.next = 10;
          return regeneratorRuntime.awrap(Quiz.findByIdAndDelete(req.params.id));

        case 10:
          quiz = _context6.sent;

          if (quiz) {
            _context6.next = 13;
            break;
          }

          return _context6.abrupt("return", res.status(404).json({
            error: 'Quiz not found.'
          }));

        case 13:
          res.json({
            success: 'Quiz removed successfully!'
          });
          _context6.next = 20;
          break;

        case 16:
          _context6.prev = 16;
          _context6.t0 = _context6["catch"](0);
          console.error('Remove quiz error:', _context6.t0);
          res.status(500).json({
            error: 'Failed to remove quiz.'
          });

        case 20:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 16]]);
}); // Submit Quiz (user) - Removed as it’s handled in app.js
// Edit Profile Picture

router.put('/edit-profile-pic/:id', profileUpload.single('profile_pic'), function _callee7(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;

          if (req.file) {
            _context7.next = 3;
            break;
          }

          return _context7.abrupt("return", res.status(400).send('No file uploaded.'));

        case 3:
          _context7.next = 5;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, {
            profile_pic: req.file.filename
          }, {
            "new": true
          }));

        case 5:
          user = _context7.sent;

          if (user) {
            _context7.next = 8;
            break;
          }

          return _context7.abrupt("return", res.status(404).send('User not found.'));

        case 8:
          req.session.user = user.toObject();
          res.json({
            message: 'Profile Picture has been uploaded successfully!',
            file: req.file
          });
          _context7.next = 15;
          break;

        case 12:
          _context7.prev = 12;
          _context7.t0 = _context7["catch"](0);
          res.status(500).send(_context7.t0.message);

        case 15:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 12]]);
}); // Edit Personal Info

router.put('/edit-personal-info/:id', function _callee8(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, req.body, {
            "new": true
          }));

        case 3:
          user = _context8.sent;

          if (user) {
            _context8.next = 6;
            break;
          }

          return _context8.abrupt("return", res.status(404).send('User not found.'));

        case 6:
          req.session.user = user.toObject();
          res.json({
            message: 'Personal information has been successfully updated'
          });
          _context8.next = 13;
          break;

        case 10:
          _context8.prev = 10;
          _context8.t0 = _context8["catch"](0);
          res.status(500).send(_context8.t0.message);

        case 13:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 10]]);
}); // Edit Contact Info

router.put('/edit-contact-info/:id', function _callee9(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, req.body, {
            "new": true
          }));

        case 3:
          user = _context9.sent;

          if (user) {
            _context9.next = 6;
            break;
          }

          return _context9.abrupt("return", res.status(404).send('User not found.'));

        case 6:
          req.session.user = user.toObject();
          res.json({
            message: 'Contact information has been successfully updated'
          });
          _context9.next = 13;
          break;

        case 10:
          _context9.prev = 10;
          _context9.t0 = _context9["catch"](0);
          res.status(500).send(_context9.t0.message);

        case 13:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[0, 10]]);
});
module.exports = router;