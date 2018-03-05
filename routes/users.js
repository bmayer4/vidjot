const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = (app) => {

    app.get('/users/register', (req, res) => {
        res.render('users/register');
    });

    app.get('/users/logout', (req, res) => {
        req.logout();
        req.flash('success_message', 'You are logged out');
        res.redirect('/users/login');
    });

    
    app.get('/users/login', (req, res) => {
        res.render('users/login');
    });

    //Post login form      
    app.post('/users/login', (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/ideas',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);
    });

    //Post register form
    app.post('/users/register', (req, res) => {
    
        let errors = [];

        if (req.body.password !== req.body.password2) {
            errors.push({text: 'Passwords must match'});
        }

        if (req.body.password.length < 6) {
            errors.push({text: 'Password must be at least 6 characters'});
        }

        if (errors.length > 0) {
            res.render('users/register', {
                errors: errors,
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                password2: req.body.password2
            })
        } else {
            User.findOne({ email: req.body.email}).then((user) => {
                if (user) {
                    req.flash('error_message', 'Email already registered');
                    res.redirect('/users/register');
                } else {
                    const newUser = {
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    }
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                          if (err) { throw err; }
                          newUser.password = hash;
                          new User(newUser).save().then(() => {
                            req.flash('success_message', 'You are now registered');
                            res.redirect('/users/login');
                          }).catch((e) => {
                            res.status(400).send(e);
                          });
                        })
                      });
                }
            });

        }
    });

}