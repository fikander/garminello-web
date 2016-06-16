'use strict';

const config = require('../config/app');
const models = require('../models/models');
const Trello = require('node-trello');

//
// 1. Watch generates activation code
// 2. This app creates watch object on the server (user supplies activation code)
//  - watch UUID generated, 'active' set to false
// 3. Watch invokes /api/watch/register with activation code
//  - response contains watch UUID for that activation code, to be used in any calls from now on
//  - watch active set to true
//


exports.getWatches = function(req, res) {
    var user_id = req.user.get('id');
    new models.User().where({id: user_id})
        .fetch({require: true, withRelated: ['watches']})
        .then(function(user) {
            return res.json(user.related('watches'));
        }).catch(models.User.NotFoundError, function() {
            return res.status(404).json({error: req.user + ' not found'});
        }).catch(function(err) {
            console.error(err);
            return res.status(500).json({error: err});
        });
};

exports.getWatch = function(req, res) {
    var watch_id = req.params.id;
    new models.Watch().where({id: watch_id})
        .fetch({require: true})
        .then(function(watch) {
            return res.json(watch);
        }).catch(models.Watch.NotFoundError, function() {
            return res.status(404).json({error: 'Watch not found'});
        }).catch(function(err){
            res.status(500).json({error: err});
        });
};

function makeid(length)
{
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

// generate new watch with an activation code
exports.addWatch = function(req, res) {
    var user_id = req.user.get('id');
    var activation_code = req.body.activation_code;
    // check sanity of code
    if (activation_code === undefined) {
        res.status(400).send('Missing activation code.');
        return;
    }
    if (activation_code.length !== 8) {
        res.status(400).send('Watch code must consist of 8 characters.');
        return;
    }
    if(/^[A-Z0-9]*$/.test(activation_code) === false) {
       res.status(400).send('Watch code should contain uppercase letters or digits.');
       return;
    }
    new models.Watch({activation_code: activation_code, active: false}).fetch({require: true})
        .then(function(watch) {
            // there is identical activation code waiting for activation
            res.status(400).json({error: 'Refresh activation code on your watch.'});
        }).catch(models.Watch.NotFoundError, function() {
            new models.Watch({
                user_id: user_id,
                activation_code: activation_code,
                uuid: makeid(24)
            }).save().then(function(watch) {
                res.json(watch);
            }).catch(function(err) {
                console.error(err);
                res.status(500).json({error: err});
            });
        });
};


exports.deleteWatch = function(req, res) {
    var watch_id = req.params.id;
    new models.Watch({id: watch_id})
        .destroy()
        .then(function(watch) {
            res.status(204).end();
        }).catch(function(err){
            res.status(500).json({error: err});
        });
};


exports.getTrelloToken = function(req, res) {
    var user_id = req.user.get('id');
    new models.TrelloToken({user_id: user_id}).fetch({require: true})
        .then(function(token) {
            res.json(token);
        }).catch(models.TrelloToken.NotFoundError, function(){
            res.status(404).end();
        }).catch(function(err) {
            res.status(500).json({error: err});
        });
};


exports.addTrelloToken = function(req, res) {
    var user_id = req.user.get('id');
    var trello_token = req.body.trello_token;
    new models.TrelloToken({user_id: user_id}).fetch({require:true})
        .then(function(token) {
            token.save({
                username: req.body.trello_username,
                token: trello_token
            }).then(function(token) {
                res.status(201).json(token);
            });
        }).catch(models.TrelloToken.NotFoundError, function() {
            new models.TrelloToken({
                user_id: user_id,
                username: req.body.trello_username,
                token: trello_token
            }).save().then(function(token) {
                res.status(201).json(token);
            });
        }).catch(function(err) {
            res.status(500).json({error: err});
        });
};


exports.deleteTrelloToken = function(req, res) {
    var user_id = req.user.get('id');
    new models.TrelloToken()
        .where({user_id: user_id})
        .destroy()
        .then(function(token) {
            res.status(204).end();
        }).catch(function(err) {
            res.status(500).json({error: err});
        });
};

//
// Watch API
//
// Note: Always returns {status: status, error: "error"} json for errors. This is Garmin's IQ SDK
// limitation - it doesn't pass status codes other than 200 to the actual watch app.
//


exports.watchUuidParam = function(req, res, next, watch_uuid) {
    new models.Watch().where({uuid: watch_uuid})
        .fetch({require: true, withRelated: ['user.trelloToken']})
        .then(function(watch) {
            req.watch = watch;
            req.user = watch.related('user');
            req.trelloToken = req.user.related('trelloToken');
            next();
        }).catch(models.Watch.NotFoundError, function() {
            res.json({status: 456, error: 'Register watch'});
        }).catch(function(err) {
            console.error(err);
            res.json({status: 400, error: 'Error getting watch data: ' + err});
        });
};


exports.apiRegister = function(req, res) {
    // check activation code is waiting
    // send UUID back. from now on UUID is required for any watch api calls
    var activation_code = req.body.activation_code;
    var profile = req.body.profile;
    var type = req.body.type;
    new models.Watch({activation_code: activation_code, active: false}).fetch({require: true})
        .then(function(watch) {
            var activated = new Date().toISOString().slice(0, 19).replace('T', ' ');
            watch.save({
                    profile: profile,
                    active: true,
                    activated_at: activated,
                    type: type
                }).then(function(watch){
                    res.json(watch);
                });
        }).catch(models.Watch.NotFoundError, function() {
            res.json({status: 456, error: 'Register activation code first'});
        }).catch(function(err) {
            res.json({status: 400, error: err});
        });
};


exports.apiConfig = function(req, res) {
    var app_version = req.query.v;
    req.watch.save({app_info: {v: app_version}})
        .then(function(watch) {
            res.json({
                active: watch.get('active'),
                user: {
                    features: req.user.get('features')
                }
            });
        }).catch(function(err) {
            res.json({status: 400, error: err});
        });
};


// use trello token to fetch board data
exports.apiBoards = function(req, res) {
    var trello_token = req.trelloToken.get('token');
    if (trello_token === undefined) {
        return res.json({status: 400, error: 'Register with Trello first'});
    }
    var trello = new Trello(config.TRELLO_API_KEY, trello_token);
    trello.get('/1/members/me/boards', {fields: 'name'}, function(err, data) {
        if (err) {
            console.error(err);
            return res.json({
                status: 400,
                error: 'Couldn\'t get data from Trello: ' +  err.statusCode + ': ' + err.statusMessage
            });
        } else {
            return res.json(data);
        }
    });
};


exports.apiBoardLists = function(req, res) {
    var board_id = req.params.board_id;
    var trello_token = req.trelloToken.get('token');
    if (trello_token === undefined) {
        return res.json({status: 400, error: 'Register with Trello first'});
    }
    var trello = new Trello(config.TRELLO_API_KEY, trello_token);
    trello.get(
        '/1/boards/' + board_id + '/lists',
        { fields: 'name', cards: 'open', card_fields: 'name' },
        function(err, data) {
            if (err) {
                console.error(err);
                return res.json({
                    status: 400,
                    error: 'Couldn\'t get data from Trello: ' +  err.statusCode + ': ' + err.statusMessage
                });
            } else {
                // limit number of cards and cut their titles to X chars
                var cards = 0;
                data.forEach(function(list, i) {
                    var list_cards = list.cards.length;
                    if (cards + list_cards > config.TRELLO_CARD_COUNT) {
                        // cut some cards off
                        list.cards.splice(Math.max(config.TRELLO_CARD_COUNT - cards, 0));
                    }
                    // cut cards titles
                    list.cards.forEach(function(card, j) {
                        card.name = card.name.substr(0, config.TRELLO_CARD_NAME_SIZE);
                        // ids are long and unnecessary for now
                        delete card.id;
                    });
                    cards += list_cards;
                });
                return res.json(data);
            }
    });
};
