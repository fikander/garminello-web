'use strict';

const expect = require('chai').expect;
const messages = require('../util/messages');
const validate = require('../util/validate');

describe('messages middleware', function() {
	it('collects flash messages into res.locals', function(done) {
		const store = {error: ['bad'], info: ['fyi'], success: ['yay']};
		const req = {
			flash: type => store[type] || [],
			isAuthenticated: () => true
		};
		const res = {locals: {}};
		messages()(req, res, function() {
			expect(res.locals.messages).to.deep.equal([
				{type: 'error', message: 'bad'},
				{type: 'info', message: 'fyi'},
				{type: 'success', message: 'yay'}
			]);
			expect(res.locals.isAuthenticated).to.be.true;
			done();
		});
	});
});

describe('validate.isEmail', function() {
	it('accepts plausible emails', function() {
		expect(validate.isEmail('a@example.com')).to.be.true;
	});
	it('rejects junk', function() {
		['', 'abc', 'a@b', 'a b@c.d', undefined, null, 5].forEach(v => {
			expect(validate.isEmail(v), String(v)).to.be.false;
		});
	});
});

describe('Trello client', function() {
	const Trello = require('../util/trello');

	it('builds urls with key, token and query', function() {
		const url = new Trello('K', 'T').url('/1/boards/abc/lists', {fields: 'name'});
		expect(url.toString()).to.equal('https://api.trello.com/1/boards/abc/lists?fields=name&key=K&token=T');
	});

	it('reports http errors with status info', function(done) {
		const http = require('http');
		const server = http.createServer((req, res) => { res.statusCode = 401; res.end('unauthorized'); });
		server.listen(0, function() {
			const t = new Trello('K', 'T', 'http://127.0.0.1:' + server.address().port);
			t.get('/1/members/me/boards', {}, function(err, data) {
				server.close();
				expect(err.statusCode).to.equal(401);
				expect(data).to.be.undefined;
				done();
			});
		});
	});

	it('returns parsed json on success', function(done) {
		const http = require('http');
		const server = http.createServer((req, res) => { res.setHeader('content-type', 'application/json'); res.end('[{"name":"x"}]'); });
		server.listen(0, function() {
			new Trello('K', 'T', 'http://127.0.0.1:' + server.address().port).get('/x', function(err, data) {
				server.close();
				expect(err).to.be.null;
				expect(data).to.deep.equal([{name: 'x'}]);
				done();
			});
		});
	});
});
