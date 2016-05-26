var Bookshelf = require('bookshelf').postgres;

var User = Bookshelf.Model.extend({
    tableName: 'users',
    watches: function() {
		return this.hasMany(Watch);
	}
});
module.exports.User = User;

var Watch = Bookshelf.Model.extend({
	tableName: 'watches',
	user: function() {
		return this.belongsTo(User);
	}
});
module.exports.Watch = Watch;

var TrelloToken = Bookshelf.Model.extend({
	tableName: 'trello_tokens',
	user: function() {
		return this.belongsTo(User);
	}
});
module.exports.TrelloToken = TrelloToken;
