'use strict';

var Bookshelf = require('bookshelf').postgres;

var User = Bookshelf.Model.extend({
    tableName: 'users',
	hasTimestamps: true,
    watches: function() {
		return this.hasMany(Watch);
	},
	trelloToken: function() {
		return this.hasOne(TrelloToken);
	}
});
module.exports.User = User;

var Watch = Bookshelf.Model.extend({
	tableName: 'watches',
	hasTimestamps: true,
	user: function() {
		return this.belongsTo(User);
	}
});
module.exports.Watch = Watch;

var TrelloToken = Bookshelf.Model.extend({
	tableName: 'trello_tokens',
	hasTimestamps: true,
	user: function() {
		return this.belongsTo(User);
	}
});
module.exports.TrelloToken = TrelloToken;
