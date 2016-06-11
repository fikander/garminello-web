import Backbone from 'backbone';

export class Router extends Backbone.Router {
	constructor(options={}) {
		_.extend(options, {
			routes: {
				'': 'main',
				'watches/:id': 'watches',
				'trello': 'trello'
			}
		});
		super(options);
	}

	main() {
		console.log('Router::main');
	}

	trello() {
		console.log('Router::trello');
	}

	watches(id) {
		console.log('Router::watches ' + id);
	}
}
