const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('home', { title: 'Главная' });
});

router.get('/dictionary', async (req, res) => {
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

module.exports = router;