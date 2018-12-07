var exports = module.exports = {};

exports.signin = function(req, res) {
    res.render('signin');
};
exports.page = function(req, res) {
    res.render('page',{ user: req.user });
};
exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/login');
    });
};