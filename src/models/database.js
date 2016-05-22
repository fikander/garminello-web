const pg = require('pg');
const config = require('../config/app');

var client = new pg.Client(config.DATABASE_URL);
client.connect();

client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, name VARCHAR(128), email VARCHAR(256) UNIQUE)');
var query = client.query('CREATE TABLE watch_trello_map(watch_id CHAR(8) PRIMARY KEY, trello_token VARCHAR(256), user_id INTEGER not null)');
query.on('end', function() { client.end(); });
