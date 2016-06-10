import Backbone from 'backbone';

export class Router extends Backbone.Router {
	constructor() {
		super();
		this.routes = {
			'(/)': 'main',
			'/trello': 'trello'
		};
	}

	main() {
		console.log('Router::main');
	}

	trello() {
		console.log('Router::trello');
	}
}
