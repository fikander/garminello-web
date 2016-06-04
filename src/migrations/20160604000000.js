/*  CREATE TABLE "session" (
//    "sid" varchar NOT NULL COLLATE "default",
//  	"sess" json NOT NULL,
//  	"expire" timestamp(6) NOT NULL
//  )
//  WITH (OIDS=FALSE);
//  ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
*/
'use strict';

exports.up = function(knex, Promise) {
	return Promise.all([

		knex.schema.createTable('session', function(table) {
			table.string('sid').primary();
			table.json('sess');
			table.timestamp('expire');
		}),

	]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('session')
    ]);
};
