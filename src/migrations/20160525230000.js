
exports.up = function(knex, Promise) {
	return Promise.all([

		knex.schema.createTable('users', function(table) {
			table.increments('id').primary();
			table.string('first_name', 32);
			table.string('last_name', 64);
			table.string('email', 255).unique().notNullable();
			table.string('password', 60).notNullable().defaultTo('');
			table.boolean('active').defaultTo(true);
			table.string('salt', 50).notNullable().defaultTo('');
			table.json('features');
			table.timestamps();
		}),

		knex.schema.createTable('watches', function(table) {
			table.increments('id').primary();
			table.integer('user_id').unsigned()
				.references('id').inTable('users')
				.onDelete('CASCADE');
			table.string('activation_code', 8).notNullable();
			table.string('uuid', 32).unique().notNullable();
			table.string('type', 32);
			table.boolean('active').default(false);
			table.datetime('activated_at').default(null);
			table.json('profile');
			table.timestamps();
		}),

		knex.schema.createTable('trello_tokens', function(table) {
			table.increments('id').primary();
			table.integer('user_id').unsigned()
				.references('id').inTable('users')
				.onDelete('CASCADE');
			table.string('username');
			table.string('token');
			table.timestamps();
		})
	]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users'),
        knex.schema.dropTable('watches'),
        knex.schema.dropTable('trello_tokens')
    ]);
};
