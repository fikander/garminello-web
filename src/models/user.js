var Bookshelf = require('bookshelf').postgres;

var User = Bookshelf.Model.extend({
        tableName: 'users'
});

module.exports.User = User;

/*
module.exports = function() {
    var bookshelf = {};

    bookshelf.User = Bookshelf.Model.extend({
        tableName: 'users'
    });

    return bookshelf;
}
*/