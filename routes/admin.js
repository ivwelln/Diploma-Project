const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Country = require('../models/Country');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// Главный админ-маршрут (перенаправление на dashboard)
router.get('/', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
});

// Главная админ-панель (Dashboard)
router.get('/dashboard', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
      const [countriesCount, usersCount, quizzesCount, continentsStats, recentCountries] = await Promise.all([
        Country.countDocuments(),
        User.countDocuments(),
        Quiz.countDocuments(),
        Country.aggregate([{ $group: { _id: '$continent', count: { $sum: 1 } } }]),
        Country.find().sort({ createdAt: -1 }).limit(5).lean()
      ]);
  
      res.render('admin/dashboard', {
        title: 'Админ-панель',
        stats: {
        countriesCount,
        usersCount,
        quizzesCount,
        continentsCount: continentsStats.length,
        continentsStats
        },
        recentCountries
      });
    } catch (err) {
      console.error('Ошибка загрузки dashboard:', err);
      req.flash('error_msg', 'Ошибка загрузки данных');
      res.redirect('/admin');
    }
  });
  
// Управление странами
router.get('/countries', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const countries = await Country.find().sort('name').lean();
        res.render('admin/countries', {
            title: 'Управление странами',
            countries
        });
    } catch (err) {
        console.error('Ошибка загрузки стран:', err);
        req.flash('error_msg', 'Ошибка загрузки списка стран');
        res.redirect('/admin/dashboard');
    }
});

// Управление тестами
router.get('/quizzes', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('country').lean();
        res.render('admin/quizzes', {
            title: 'Управление тестами',
            quizzes
        });
    } catch (err) {
        console.error('Ошибка загрузки тестов:', err);
        req.flash('error_msg', 'Ошибка загрузки списка тестов');
        res.redirect('/admin/dashboard');
    }
});

// Управление пользователями
router.get('/users', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        res.render('admin/users', {
            title: 'Управление пользователями',
            users
        });
    } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
        req.flash('error_msg', 'Ошибка загрузки списка пользователей');
        res.redirect('/admin/dashboard');
    }
});

// Назначение/снятие прав администратора
router.post('/users/toggle-admin/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        if (req.user._id.equals(req.params.id)) {
            req.flash('error_msg', 'Вы не можете изменить свои собственные права');
            return res.redirect('/admin/users');
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            req.flash('error_msg', 'Пользователь не найден');
            return res.redirect('/admin/users');
        }

        user.isAdmin = !user.isAdmin;
        await user.save();
        
        req.flash('success_msg', `Права администратора ${user.isAdmin ? 'выданы' : 'отозваны'}`);
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Ошибка изменения прав:', err);
        req.flash('error_msg', 'Ошибка изменения прав администратора');
        res.redirect('/admin/users');
    }
});

// Показать форму добавления
router.get('/countries/new', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.render('admin/add-country');
  });

// Редактирование страны (форма)
router.get('/countries/edit/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const country = await Country.findById(req.params.id).lean();
        if (!country) {
            req.flash('error_msg', 'Страна не найдена');
            return res.redirect('/admin/countries');
        }
        
        res.render('admin/edit-country', {
            title: 'Редактировать страну',
            country
        });
    } catch (err) {
        console.error('Ошибка загрузки страны:', err);
        req.flash('error_msg', 'Ошибка загрузки данных страны');
        res.redirect('/admin/countries');
    }
});

// Сохранение страны (POST-обработчик)
router.post('/countries/save', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const { id, name, capital, continent, population } = req.body;
        
        if (!name || !capital || !continent) {
            req.flash('error_msg', 'Заполните обязательные поля');
            return res.redirect(id ? `/admin/countries/edit/${id}` : '/admin/countries/new');
        }

        if (id) {
            // Редактирование существующей страны
            await Country.findByIdAndUpdate(id, {
                name, capital, continent, population
            });
            req.flash('success_msg', 'Страна успешно обновлена');
        } else {
            // Добавление новой страны
            const newCountry = new Country({
                name, capital, continent, population,
                addedBy: req.user.id
            });
            await newCountry.save();
            req.flash('success_msg', 'Страна успешно добавлена');
        }
        
        res.redirect('/admin/countries');
    } catch (err) {
        console.error('Ошибка сохранения страны:', err);
        req.flash('error_msg', 'Ошибка сохранения данных страны');
        res.redirect('/admin/countries');
    }
});

// Удаление страны
router.post('/countries/delete/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        await Country.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Страна успешно удалена');
        res.redirect('/admin/countries');
    } catch (err) {
        console.error('Ошибка удаления страны:', err);
        req.flash('error_msg', 'Ошибка удаления страны');
        res.redirect('/admin/countries');
    }
});

module.exports = router;