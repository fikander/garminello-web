
exports.seed = function(knex, Promise) {
  return Promise.join(
     //knex('users').del(),
     //knex('watches').del(),
     //knex('trello_tokens').del(),

    // Inserts seed entries
    knex('users').where('id', 1).del(),
    knex('users').insert({
    	id: 1,
    	first_name: 'tomek',
    	last_name: 'k',
    	email: 'tomasz.kustrzynski@gmail.com',
    	password: '',
    	active: true,
    	salt: 'abcd'
    }),

    knex('watches').where('id', 1).del(),
    knex('watches').insert({
        id: 1,
        user_id: 1,
        activation_code: 'ABCD1234',
        secret: 'ABCDEFGHIJ1234567890',
        type: 'vivosmart_hr',
        profile: '{}'
    }),

    knex('trello_tokens').where('id', 1).del(),
    knex('trello_tokens').insert({
        id: 1,
        user_id: 1,
        username: 'tomek',
        token: 'ABCDEFGHIJ1234567890'
    })
  );
};
