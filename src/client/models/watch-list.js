import Backbone from 'backbone';
import { Watch } from './watch';

export class WatchList extends Backbone.Collection {
	constructor(options) {
		super(options);
		this.model = Watch;
		this.url = '/api/watches';
	}
}
