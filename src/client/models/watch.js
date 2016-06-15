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
