'use strict';

// Bookshelf 1.x eager-loads with `select distinct`, which PostgreSQL rejects
// for `json` columns (no equality operator). `jsonb` has one.
const columns = [['users', 'features'], ['watches', 'profile'], ['watches', 'app_info']];

const convert = (knex, type) => Promise.all(columns.map(([table, column]) =>
	knex.raw('ALTER TABLE ?? ALTER COLUMN ?? TYPE ' + type + ' USING ??::' + type, [table, column, column])
));

exports.up = knex => convert(knex, 'jsonb');
exports.down = knex => convert(knex, 'json');
