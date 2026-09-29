'use strict';

const now = '2016-05-28 0:0:0';
const abc = 'a21867e105a93f50025cb11e08a34c771e602d79'; // password "abc" with the salt below
const salt = '467443809468';

const insert_all = async function(knex) {
    // user with watches and trello token
    const [a] = await knex('users').insert({
        email: 'a@example.com',
        password: abc,
        active: true,
        salt: salt,
        features: {'premium': true},
        created_at: now,
        updated_at: now
    }).returning('id');
    await knex('watches').insert([{
        user_id: a.id,
        activation_code: 'ABCD1234',
        uuid: 'ABCDEFGHIJ1234567890',
        type: 'vivoactive_hr',
        profile: '{}',
        activated_at: '2016-05-28 12:00',
        active: true,
        created_at: now,
        updated_at: now
    }, {
        user_id: a.id,
        activation_code: 'ABCD1235',
        uuid: 'ABCDEFGHIJ1234567891',
        created_at: now,
        updated_at: now
    }]);
    await knex('trello_tokens').insert({
        user_id: a.id,
        username: 'tomek',
        token: 'ABCDEFGHIJ1234567890',
        created_at: now,
        updated_at: now
    });

    // user with watch, but no trello tokens
    const [b] = await knex('users').insert({
        email: 'b@example.com',
        password: abc,
        active: true,
        salt: salt,
        created_at: now,
        updated_at: now
    }).returning('id');
    await knex('watches').insert({
        user_id: b.id,
        activation_code: 'ABCD1234',
        uuid: 'watch_with_no_trello',
        type: 'vivosmart_hr',
        profile: '{}',
        activated_at: '2016-05-28 12:00',
        active: true,
        created_at: now,
        updated_at: now
    });
};

exports.seed = async function(knex) {
    const rows = await knex.select('id').from('users');
    if (rows.length < 2) {
        await insert_all(knex);
    }
};
