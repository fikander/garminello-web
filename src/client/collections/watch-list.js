import Backbone from 'backbone';
import { Watch } from './../models/watch';

export class WatchList extends Backbone.Collection {
	constructor(options) {
		super(options);
		this.model = Watch;
		this.url = '/api/watches';
	}
}
