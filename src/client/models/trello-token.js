import Backbone from 'backbone';

export class TrelloToken extends Backbone.Model {
	constructor(options) {
		super(options);
		this.url = '/api/trello_token';
	}

	defaults() {
		return {
		};
	}
}
