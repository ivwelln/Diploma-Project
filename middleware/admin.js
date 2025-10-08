// middleware/admin.js
module.exports = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
      return next();
    }
    req.flash('error_msg', 'Требуются права администратора');
    res.redirect('/');
  };