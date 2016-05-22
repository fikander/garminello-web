const pg = require('pg');
const config = require('../config/app');

function User() {
    this.id = 0;
    this.email = "";
    this.password = "";

    this.save = function(callback) {
        pg.connect(config.DATABASE_URL, function(err, client, done) {
            if (err) {
                done();
                console.error(err);
                return res.status(500).send(json({success: false, data: err}));
            }
            client.query('INSERT INTO users(email, password) VALUES($1, $2)', [this.email, this.password], function (err, result) {
                if(err){
                    console.error("User::save error: " + err);
                }
            });
            client.query('SELECT * FROM users ORDER BY id desc limit 1', null, function(err, result){
                if(err){
                    console.log("User::save error: " + err);
                    done();
                    return callback(null);
                }
                if (result.rows.length > 0){
                    console.log(result.rows[0] + ' is found!');
                    var user = new User();
                    user.id = result.rows[0]['id'];
                    user.email= result.rows[0]['email'];
                    user.password = result.rows[0]['password'];
                    console.log(user.email);
                    done();
                    return callback(user);
                }
            });
        });
    };
}

User.findOne = function(email, callback){
    var exists = false;
    pg.connect(config.DATABASE_URL, function(err, client, done) {
        if (err) {
            done();
            console.error(err);
            return callback(true, exists, this);
        }
        client.query("SELECT * from users where email=$1", [email], function(err, result) {
            if(err) {
                done();
                return callback(err, exists, this);
            }
            exists = result.rows.length > 0;
            done();
            return callback(false, exists, this);
        });
    });
};

User.findById = function(id, callback){
    pg.connect(config.DATABASE_URL, function(err, client, done) {
        if (err) {
            done();
            console.error(err);
            return callback(err, null);
        }
        client.query("SELECT * from users where id=$1", [id], function(err, result) {
            if(err) {
                done();
                return callback(err, null);
            }
            if (result.rows.length > 0){
                var user = new User();
                user.email= result.rows[0]['email'];
                user.password = result.rows[0]['password'];
                user.id = result.rows[0]['id'];
                done();
                return callback(null, user);
            }
        });
    });
};

module.exports = User;
