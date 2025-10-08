  module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) return next();
        req.flash('error_msg', 'Пожалуйста, войдите в систему');
        res.redirect('/auth/login');
    },
    ensureAdmin: (req, res, next) => {
        if (req.user && req.user.isAdmin) return next();
        req.flash('error_msg', 'Недостаточно прав администратора');
        res.redirect('/');
    }
};
