import Backbone from 'backbone';

export class Watch extends Backbone.Model {
	constructor(options) {
		super(options);
		this.urlRoot = '/api/watches';
		this.idAttribute = 'id';
	}

	defaults() {
		return {
		    type: '',
		    active: false,
		    created_at: null,
		    updated_at: null,
		    activated_at: null
		};
	}
}

export class WatchList extends Backbone.Collection {
	constructor(options) {
		super(options);
		this.model = Watch;
		this.url = '/api/watches';
	}
}

export var Watches = new WatchList();
