const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcript = require('bcryptjs');

//Load User model
const User = mongoose.model('User');

module.exports = (passport) => {
    passport.use(new localStrategy({ usernameField: 'email'}, (email, password, done) => {
        User.findOne({email: email}).then((user) => {
            if (!user) {
                return done(null, false, { message: 'No user found'});
            }

            bcript.compare(password, user.password, (err, res) => {  //res is bool
                if (err) { throw err; }
                if (res) {
                    return done(null, user);
                } 
                done(null, false, { message: 'password is incorrect'}); 

            });

        }).catch((e) => {
            return done(e);
        });
    }));


    passport.serializeUser((user, done) => {
        done(null, user.id);  
    });                      
    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
    });
}