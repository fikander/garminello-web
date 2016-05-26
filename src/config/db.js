var config = require('./app');

module.exports = {

  development: {
    client: 'postgresql',
	connection: config.DATABASE_URL,
    debug: config.DEBUG
  },
  production: {
  	client: 'postgresql',
  	connection: config.DATABASE_URL
  }
}
