import Backbone from 'backbone';
import moment from 'moment';

export class Watch extends Backbone.Model {
	constructor(options) {
		super(options);
		this.urlRoot = '/api/watches';
		this.idAttribute = 'id';
	}

	defaults() {
		return {
		    type: null,
		    active: false,
		    created_at: null,
		    updated_at: null,
		    activated_at: null
		};
	}

	getIcon(size) {
		let type = this.get('type');
		if (Watch.images.hasOwnProperty(type)) {
			return Watch.images[type];
		} else {
			return Watch.images[null];
		}
	}

	formatCreatedAt() {
		return moment(this.created_at).format('YYYY-MM-DD');
	}
}

Watch.images = {
	'vivoactive_hr': 'static/images/vivoactive_hr.jpg',
	null: 'static/images/unknown.png'
};
