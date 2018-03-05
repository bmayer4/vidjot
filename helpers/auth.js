
module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
       return next();
    } 
    req.flash('error_message', 'Must be logged in');
    res.redirect('/users/login');
}