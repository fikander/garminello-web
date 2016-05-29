// node

const config = require('./config/app');
const db_config = require('./config/db');
const knex = require('knex')(db_config[config.ENVIRONMENT]);
const Bookshelf = require('bookshelf');
Bookshelf.postgres = Bookshelf(knex);
const models = require('./models/models');

// 2 SQL queries to fetch all watches for given user: 
new models.User().where('id', 1).fetch({withRelated: ['watches']})
	.then(function(result){
		console.log(result.related('watches').toJSON());
	});
