var pg = require('pg');
var connectionString = process.env.DATABASE_URL;

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('CREATE TABLE watch_trello_map(watch_id CHAR(8) PRIMARY KEY, trello_token VARCHAR(256), user_id INTEGER not null)');
query.on('end', function() { client.end(); });
