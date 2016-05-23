const config = require('../config/app');
const pg = require('pg');

exports.bindTrelloWatch = function(req, res) {
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
    pg.connect(config.DATABASE_URL, function(err, client, done) {
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
}

// UTILS

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

// API

exports.apiBoards = function(req, res) {
    //console.log(req.query);
    var watch_id = req.query.watch;
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
}

exports.apiBoardLists = function(req, res) {
    //console.log(req.query);
    var watch_id = req.query.watch;
    var board_id = req.query.board_id;
    profile_from_watch(watch_id, function(status, result) {
        if (status == 200) {
            var t = new Trello(config.TRELLO_API_KEY, result.trello_token);
            t.get('/1/boards/' + board_id + '/lists', {fields: 'name', cards: 'open', card_fields: 'name'}, function(err, data) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
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
}

exports.apiConfig = function(req, res) {
    //console.log(req.query);
    var watch_id = req.query.watch;
    profile_from_watch(watch_id, function(status, result) {
        if (status == 456) {
            // Hack for Connect IQ SDK which turns all 400 codes into single -400
            status = 200;
            result = { status: 456 };
        }
        res.status(status).json(result);
    })
}
