const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Просмотр всех стран
router.get('/', async (req, res) => {
  try {
    const countries = await req.db.Country.find().sort('name');
    res.render('dictionary', { 
      title: 'Словарь стран', 
      countries 
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Добавление страны (только для админа)
router.post('/', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { name, capital, continent, population } = req.body;
    const country = new req.db.Country({
      name,
      capital,
      continent,
      population,
      addedBy: req.user.id
    });
    await country.save();
    req.flash('success_msg', 'Страна успешно добавлена');
    res.redirect('/dictionary');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при добавлении страны');
    res.redirect('/dictionary');
  }
});

// Редактирование страны (только для админа)
router.put('/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { name, capital, continent, population } = req.body;
    await req.db.Country.findByIdAndUpdate(req.params.id, {
      name,
      capital,
      continent,
      population
    });
    req.flash('success_msg', 'Страна успешно обновлена');
    res.redirect('/dictionary');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при обновлении страны');
    res.redirect('/dictionary');
  }
});

// Удаление страны (только для админа)
router.delete('/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await req.db.Country.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Страна успешно удалена');
    res.redirect('/dictionary');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при удалении страны');
    res.redirect('/dictionary');
  }
});

module.exports = router;