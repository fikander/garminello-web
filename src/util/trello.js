'use strict';

// Minimal Trello REST client (replaces the unmaintained `node-trello`).
// Same callback interface: get(path, query, cb(err, data)); errors carry
// statusCode / statusMessage so callers can report them.

const BASE_URL = 'https://api.trello.com';

class Trello {
    constructor(key, token, baseUrl) {
        this.key = key;
        this.token = token;
        this.baseUrl = baseUrl || BASE_URL;
    }

    url(path, query) {
        const url = new URL(path, this.baseUrl);
        const params = Object.assign({}, query, {key: this.key, token: this.token});
        Object.keys(params).forEach(k => {
            if (params[k] !== undefined) { url.searchParams.set(k, params[k]); }
        });
        return url;
    }

    async getAsync(path, query) {
        const res = await fetch(this.url(path, query), {headers: {Accept: 'application/json'}});
        if (!res.ok) {
            const err = new Error('Trello request failed: ' + res.status);
            err.statusCode = res.status;
            err.statusMessage = res.statusText;
            throw err;
        }
        return res.json();
    }

    get(path, query, cb) {
        if (typeof query === 'function') { cb = query; query = {}; }
        this.getAsync(path, query).then(data => cb(null, data), err => cb(err));
    }
}

module.exports = Trello;
