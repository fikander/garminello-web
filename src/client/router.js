import Backbone from 'backbone';

export class Router extends Backbone.Router {
	constructor() {
		super();
		this.routes = {
			'(/)': 'main',
			'watch/:id': 'watch',
			'trello': 'trello'
		};
	}

	main() {
		console.log('Router::main');
	}

	trello() {
		console.log('Router::trello');
	}

	watch(id) {
		console.log('Router::watch ' + id);
	}
}
