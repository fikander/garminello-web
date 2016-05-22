//configuring the strategies for passport
const pg = require('pg');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const config = require('../config/app');
const config_auth = require('../config/auth');

var client = new pg.Client(conString);

// load up the user model
var User            = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    passport.serializeUser(function(user, done) {
        console.log("passport::serializeUser " + user.id);
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        console.log("passport::deserializeUser " + id);
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            // User.findOne wont fire unless data is sent back
            process.nextTick(function(callback) {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne(email, function(err, exists, user) {
                    if (err) {
                        console.error('passport::local-signup: error: ' + err);
                        return done(err);
                    }
                    if (exists) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        user = new User();
                        user.email    = req.body.email;
                        user.password = req.body.password;
                        user.save(function(newUser) {
                            console.log('passport::local-signup: new local user' + newUser);
                            passport.authenticate();
                            return done(null, newUser);
                        });
                    }
                });
            });
        });
    );

    passport.use('local-login', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err) {
                    console.error('passport::local-login: error: ' + err);
                    return done(err);
                }
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }
                if (!user.validPassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                }
                return done(null, user);
            });
        });
    );

    passport.use(new FacebookStrategy(
        config_auth.FACEBOOK,
        function(token, refreshToken, profile, done) {
            process.nextTick(function() {
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err) {
                        console.error('passport::facebook: error: ' + err);
                        return done(err);
                    }
                    if (user) {
                        return done(null, user);
                    } else {
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;
                        newUser.save(function(err) {
                            if (err) {
                                console.error('passport::facebook: error: ' + err);
                                return done(err);
                            }
                            return done(null, newUser);
                        });
                    }
                });
            });
        }
    ));
}
