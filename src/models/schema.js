
module.exports = function(knex) {
    knex.schema.hasTable('users').then(function(exists) {
        /* Drops the table if it exists.  This is useful to uncomment when you are working on editing the schema */
        // if (exists) {
        //   db.knex.schema.dropTable('posts').then(function() {
        //     console.log("Removed Post Table");
        //   });
        //   exists = false;
        // }

        /* Create users table if it doesn't exist. */
        if (!exists) {
            knex.schema.createTable('users', function(table) {
                table.increments('id').primary();
                table.increments('id').primary();
                table.string('title', 255);
                table.string('summary', 255);
                table.string('file', 255);
                table.string('url', 255);
                table.integer('views').defaultTo(0);
                table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE');
                table.timestamp('created_at').notNullable().defaultTo(db.knex.raw('now()'));
            }).then(function(table) {
                console.log('Created: ' + table);
            });
        }
    });
    knex.schema.hasTable('watch_trello_map').then(function(exists) {
        if (!exists) {

        }
    });
    knex.schema.hasTable('')
}