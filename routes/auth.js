const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Страница входа (GET)
router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Вход',
    error_msg: req.flash('error_msg'),
    error: req.flash('error') 
  });
});

// Обработка входа (POST)
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// Страница регистрации (GET)
router.get('/register', (req, res) => {
  res.render('auth/register', { 
    title: 'Регистрация',
    error_msg: req.flash('error_msg') 
  });
});

// Обработка регистрации (POST)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, password2 } = req.body;
    
    if (password !== password2) {
      req.flash('error_msg', 'Пароли не совпадают');
      return res.redirect('/auth/register');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error_msg', 'Email уже используется');
      return res.redirect('/auth/register');
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    
    req.flash('success_msg', 'Регистрация успешна! Войдите в систему');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка сервера');
    res.redirect('/auth/register');
  }
});

// Выходв
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.flash('success_msg', 'Вы вышли из системы');
      res.redirect('/auth/login');
    });
  });

module.exports = router;