const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Начало тестирования
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const questions = await req.db.Quiz.aggregate([{ $sample: { size: 10 } }]);
    res.render('quiz', { 
      title: 'Тестирование', 
      questions 
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при загрузке вопросов');
    res.redirect('/');
  }
});

// Проверка ответов
router.post('/submit', ensureAuthenticated, async (req, res) => {
  try {
    const answers = req.body;
    let score = 0;
    const questions = await req.db.Quiz.find({
      _id: { $in: Object.keys(answers) }
    });

    questions.forEach(question => {
      if (answers[question._id] === question.correctAnswer) {
        score++;
      }
    });

    res.render('quiz-result', {
      title: 'Результаты теста',
      score,
      total: questions.length
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при проверке ответов');
    res.redirect('/quiz');
  }
});

module.exports = router;