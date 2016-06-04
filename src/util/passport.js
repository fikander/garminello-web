'use strict';

//configuring the strategies for passport
const crypto = require('crypto');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const models = require('../models/models');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    passport.serializeUser(function(user, done) {
        console.log('passport::serializeUser ' + user.id);
        done(null, user.id);
    });

    passport.deserializeUser(function(user_id, done) {
        console.log('passport::deserializeUser ' + user_id);
        new models.User({id: user_id}).fetch().then(function(user) {
            return done(null, user);
        }, function(error) {
            return done(error);
        });
    });

    passport.use(new LocalStrategy({
        usernameField: 'un',
        passwordField: 'pw'
    }, function(email, password, done) {
        new models.User({email: email}).fetch({require: true}).then(function(user) {
            var sa = user.get('salt');
            var pw = user.get('password');
            var upw = crypto.createHmac('sha1', sa).update(password).digest('hex');
            if (upw === pw) {
                return done(null, user);
            }
            return done(null, false, {'message': 'Invalid password'});
        }, function(error) {
            return done(null, false, {'message': 'Unknown user'});
        });
    }));
};
