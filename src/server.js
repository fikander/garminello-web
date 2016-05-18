'use strict';

const express = require('express'),
    pg = require('pg'),
    cons = require('consolidate'),
    Trello = require('node-trello');

// Constants
const PORT = process.env.PORT || 8080;
const APP_NAME = 'Garminello';
const VERSION = '1.0';
const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_OAUTH_SECRET = process.env.TRELLO_OAUTH_SECRET;

// max card title length
const TRELLO_CARD_NAME_SIZE = process.env.TRELLO_CARD_NAME_SIZE || 50;
// max number of cards
const TRELLO_CARD_COUNT = process.env.TRELLO_CARD_COUNT || 80;

// App
const app = express();

app.set('port', PORT);

// template engine
app.engine('html', cons.mustache);
app.set('view engine', 'html');
app.set('views', './src/client/views');


app.get('/', function(req, res) {
    res.render('index', { trello_api_key: TRELLO_API_KEY, message: req.query.message });
});

// app.get('/', function (req, res) {
//     console.log(req.headers.host);
//     console.log(req.protocol);
//     console.log(req.originalUrl);
//     var return_url = req.protocol + "://" + req.headers.host + '/trello_token';
//     res.redirect(
//         "https://trello.com/1/authorize?"+
//         "expiration=never" +
//         "&name=Garminello" + 
//         "&key=" + TRELLO_API_KEY +
//         "&scope=read" + 
//         "&callback_method=postMessage" +
//         "&return_url=" + return_url);
// });

app.get('/trello_authorise', function (req, res) {
    res.render('trello', { trello_api_key: TRELLO_API_KEY, app_name: APP_NAME });
});

app.get('/trello_authorise_enter_watch', function(req, res) {
    res.render('trello_enter_watch', { trello_api_key: TRELLO_API_KEY, app_name: APP_NAME, ttoken: req.query.ttoken });
});

app.get('/bind_trello_watch', function(req, res) {
    //console.log(req.query);
    var ttoken = req.query.ttoken;
    var watch_id = req.query.watch_id;
    // check sanity of watch_id
    if (watch_id.length != 8) {
        res.status(400).send("Watch code must consist of 8 characters.");
        return;
    }
    if(/^[A-Z0-9]*$/.test(watch_id) == false) {
       res.status(400).send("Watch code should contain uppercase letters or digits.");
       return;
    }
    // insert new watch id in the database
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if (err) {
            done();
            console.log(err);
            return res.status(500).send(json({success: false, data: err}));
        }
        var q = client.query('INSERT INTO watch_trello_map(watch_id, trello_token, user_id) values($1, $2, $3)', [watch_id, ttoken, 0]);
        q.on('error', function(error) {
            done();
            console.log("ERROR " + error);
            // http://www.postgresql.org/docs/9.4/static/errcodes-appendix.html
            if (error.code == "23505") {
                res.status(400).send("This watch code is already registered.");
            } else {
                res.status(400).send("Error registering watch.");
            }
        });
        q.on('end', function(result) {
            done();
            res.status(200).send('ok');
        });
    });
});

// UTILS

var profile_from_watch = function(watch_id, callback) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
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
            if (result.rowCount != 1) {
                return callback(400, "Register watch");
            } else {
                return callback(200, result.rows[0]);
            }
        });
    });
};

// API

app.get('/api/boards', function(req, res) {
    //console.log(req.query);
    var watch_id = req.query.watch;
    profile_from_watch(watch_id, function(status, result) {
        if (status == 200) {
            var t = new Trello(TRELLO_API_KEY, result.trello_token);
            t.get('/1/members/me/boards', {fields: 'name'}, function(err, data) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    res.json(data);
                }
            });            
        } else {
            res.status(status).send(result);
        }
    });
});

app.get('/api/board_lists', function(req, res) {
    //console.log(req.query);
    var watch_id = req.query.watch;
    var board_id = req.query.board_id;
    profile_from_watch(watch_id, function(status, result) {
        if (status == 200) {
            var t = new Trello(TRELLO_API_KEY, result.trello_token);
            t.get('/1/boards/' + board_id + '/lists', {fields: 'name', cards: 'open', card_fields: 'name'}, function(err, data) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    // limit number of cards and cut their titles to X chars
                    var cards = 0;
                    data.forEach(function(list, i) {
                        var list_cards = list["cards"].length;
                        if (cards + list_cards > TRELLO_CARD_COUNT) {
                            // cut some cards off
                            list["cards"].splice(Math.max(TRELLO_CARD_COUNT - cards, 0));
                        }
                        // cut cards titles
                        list["cards"].forEach(function(card, j) {
                            card.name = card.name.substr(0, TRELLO_CARD_NAME_SIZE);
                        });
                        cards += list_cards;
                    });
                    res.json(data);
                }
            });
        } else {
            res.status(status).send(result);
        }
    });
});

app.get('/api/config', function(req, res) {
    //console.log(req.query);
    var watch_id = req.query.watch;
    profile_from_watch(watch_id, function(status, result) {
        res.status(status).json(result);
    })
});

app.listen(app.get('port'), function() {
    console.log('Running on port:' + app.get('port'));
});
