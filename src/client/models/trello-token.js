import Backbone from 'backbone';

export class TrelloToken extends Backbone.Model {
	constructor(options) {
		super(options);
		this.urlRoot = '/api/trello_token';
		this.idAttribute = 'id';
	}

	defaults() {
		return {
		};
	}
}
