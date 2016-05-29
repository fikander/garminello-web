const config = require('../config/app');
const models = require('../models/models');
const Trello = require('node-trello');

/*

- watch generates activation code
- create watch object on the server (user supplies activation code)
-- watch secret generated, active set to false
- watch invokes /api/watch/register with activation code
-- response contains watch secret for that activation code
-- watch active set to true

*/

exports.getWatches = function(req, res) {
    var user_id = req.user.get('id');
    new models.User().where('id', user_id).fetch({require: true, withRelated: ['watches']})
        .then(function(user) {
            return res.json(user.related('watches'));
        }).catch(models.User.NotFoundError, function() {
            return res.json(400, {error: req.user + ' not found'});
        }).catch(function(err) {
            console.error(err);
            return res.json(500, {error: err});
        });
}

function makeid(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

// generate new watch with an activation code
exports.addWatch = function(req, res) {
    var user_id = req.user.get('id');
    var activation_code = req.body['activation_code'];
    // check sanity of code
    if (activation_code == undefined) {
        res.status(400).send("Missing activation code.")
        return;
    }
    if (activation_code.length != 8) {
        res.status(400).send("Watch code must consist of 8 characters.");
        return;
    }
    if(/^[A-Z0-9]*$/.test(activation_code) == false) {
       res.status(400).send("Watch code should contain uppercase letters or digits.");
       return;
    }
    // is there identical activation code waiting for activation?
    new models.Watch({activation_code, active: false}).fetch()
        .then(function(watch) {
            if (!watch) {
                // insert new watch id in the database
                var watch = new models.Watch({
                    user_id: user_id,
                    activation_code: activation_code,
                    uuid: makeid(24)
                }).save().then(function(watch) {
                    return res.json(watch);
                }).catch(function(err) {
                    console.error(err);
                    return res.status(500).json({error: err});
                })
            } else {
                return res.status(500).json({error: 'Refresh activation code on your watch.'})
            }
        })
}


// UTILS
/*
var profile_from_watch = function(watch_id, callback) {
    pg.connect(config.DATABASE_URL, function(err, client, done) {
        if (err) {
            done();
            console.log(err);
            return callback(500, json({success: false, data: err}));
        }
        var q = client.query("SELECT * FROM watch_trello_map WHERE watch_id=($1)", [watch_id], function(error, result) {
            done();
            if (error) {
                console.log(error);
                return callback(400, "Couldn't recognise watch");
            }
            if (result.rowCount < 1) {
                return callback(456, "Register watch");
            } else {
                return callback(200, result.rows[0]);
            }
        });
    });
};
*/
// Watch API
exports.watchUuidParam = function(req, res, next, watch_uuid) {
    new models.Watch().where('uuid', watch_uuid).fetch({require: true, withRelated: ['user.trelloToken']})
        .then(function(watch) {
            req.watch = watch;
            req.user = watch.related('user');
            req.trelloToken = req.user.related('trelloToken');
            next();
        }).catch(models.Watch.NotFoundError, function() {
            res.json({status: 456, error: "Register watch"});
        }).catch(function(err) {
            console.error(err);
            res.json({status: 400, error: "Error getting watch data"});
        })
}

exports.apiRegister = function(req, res) {
    // check activation code is waiting
    // send secret back. from now on this is required for any watch api calls
    var activation_code = req.body['activation_code'];
    var profile = req.body['profile'];
    var type = req.body['type'];
    new models.Watch({activation_code: activation_code, active: false}).fetch()
        .then(function(watch) {
            if (watch) {
                var activated = new Date().toISOString().slice(0, 19).replace('T', ' ');
                watch.save({
                        profile: profile,
                        active: true,
                        activated_at: activated,
                        type: type
                    }).then(function(watch){
                        res.json(watch);
                    });
            } else {
                res.status(401).send("Register watch with activation code");
            }
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
}


exports.apiConfig = function(req, res) {
    res.json({
        active: req.watch.get('active'),
        user: {
            features: req.user.get('features')
        }
    });
}


// use trello token to fetch board data
exports.apiBoards = function(req, res) {
    var trello_token = req.trelloToken.get('token');
    if (trello_token == undefined) {
        return res.json({status: 400, error: "Register with Trello first"});
    }
    var trello = new Trello(config.TRELLO_API_KEY, trello_token);
    trello.get('/1/members/me/boards', {fields: 'name'}, function(err, data) {
        if (err) {
            console.error(err);
            return res.json({
                status: 400,
                error: "Couldn't get data from Trello: " +  err.statusCode + ": " + err.statusMessage
            });
        } else {
            return res.json(data);
        }
    });
/*
    profile_from_watch(watch_id, function(status, result) {
        if (status == 200) {
            var t = new Trello(config.TRELLO_API_KEY, result.trello_token);
            t.get('/1/members/me/boards', {fields: 'name'}, function(err, data) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    res.json(data);
                }
            });            
        } else {
            if (status == 456) {
                // Hack for Connect IQ SDK which turns all 400 codes into single -400
                status = 200;
                result = { status: 456 };
            }
            res.status(status).send(result);
        }
    });
*/
}

exports.apiBoardLists = function(req, res) {
    var board_id = req.params.board_id;
    var trello_token = req.trelloToken.get('token');
    if (trello_token == undefined) {
        return res.json({status: 400, error: "Register with Trello first"});
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
                    error: "Couldn't get data from Trello: " +  err.statusCode + ": " + err.statusMessage
                });
            } else {
                // limit number of cards and cut their titles to X chars
                var cards = 0;
                data.forEach(function(list, i) {
                    var list_cards = list["cards"].length;
                    if (cards + list_cards > config.TRELLO_CARD_COUNT) {
                        // cut some cards off
                        list["cards"].splice(Math.max(config.TRELLO_CARD_COUNT - cards, 0));
                    }
                    // cut cards titles
                    list["cards"].forEach(function(card, j) {
                        card.name = card.name.substr(0, config.TRELLO_CARD_NAME_SIZE);
                        // ids are long and unnecessary for now
                        delete card["id"];
                    });
                    cards += list_cards;
                });
                return res.json(data);
            }
    });
}
