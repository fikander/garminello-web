


var insert_all = function(knex, Promise) {
    return Promise.each([
        // user with watches and trello token
        knex('users').insert({
            first_name: 'tomek',
            last_name: 'k',
            email: 'tomasz.kustrzynski@gmail.com',
            password: 'a21867e105a93f50025cb11e08a34c771e602d79', //abc
            active: true,
            salt: '467443809468',
            features: {'premium': true},
            created_at: '2016-05-28 0:0:0',
            updated_at: '2016-05-28 0:0:0'
        })
        .returning('id')
        .then(function(response) {
            return Promise.each([
                knex('watches').insert({
                    user_id: response[0],
                    activation_code: 'ABCD1234',
                    uuid: 'ABCDEFGHIJ1234567890',
                    type: 'vivosmart_hr',
                    profile: '{}',
                    activated_at: '2016-05-28 12:00',
                    active: true,
                    created_at: '2016-05-28 0:0:0',
                    updated_at: '2016-05-28 0:0:0'
                }),
                knex('watches').insert({
                    user_id: response[0],
                    activation_code: 'ABCD1235',
                    uuid: 'ABCDEFGHIJ1234567891',
                    created_at: '2016-05-28 0:0:0',
                    updated_at: '2016-05-28 0:0:0'
                }),
                knex('trello_tokens').insert({
                    user_id: response[0],
                    username: 'tomek',
                    token: 'ABCDEFGHIJ1234567890',
                    created_at: '2016-05-28 0:0:0',
                    updated_at: '2016-05-28 0:0:0'
                })
            ], function(result, index, length) {
                console.log("done: " + index + " of: " + length);
            });
        }),
        // user with watch, but no trello tokens
        knex('users').insert({
            first_name: 'tomek',
            last_name: 'k2',
            email: 'tomasz@tomasz.com',
            password: 'a21867e105a93f50025cb11e08a34c771e602d79', //abc
            active: true,
            salt: '467443809468',
            created_at: '2016-05-28 0:0:0',
            updated_at: '2016-05-28 0:0:0'
        })
        .returning('id')
        .then(function(response) {
            return Promise.each([
                knex('watches').insert({
                    user_id: response[0],
                    activation_code: 'ABCD1234',
                    uuid: 'watch_with_no_trello',
                    type: 'vivosmart_hr',
                    profile: '{}',
                    activated_at: '2016-05-28 12:00',
                    active: true,
                    created_at: '2016-05-28 0:0:0',
                    updated_at: '2016-05-28 0:0:0'
                })
            ], function(result, index, length) {
                console.log("done: " + index + " of: " + length);
            });
        })
    ]);
}

exports.seed = function(knex, Promise) {

    return knex.select('id').from('users')
        .then(function(rows) {
            if (rows.length < 2) {
                insert_all(knex, Promise);
            }
        });

};
