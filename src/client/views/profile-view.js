import Backbone from 'backbone';
import { WatchListView } from './watch-list-view';

export class ProfileView extends Backbone.View {
	constructor(options) {
		console.log('ProfileView::constructor');
		_.extend(options, {
			input: '',
			events: {

			}
		});
		super(options);
	}

	render() {
		console.log('ProfileView::render');
		let watchListView = new WatchListView({
			el: '#watchList'
		});
		watchListView.render();
//		this.$watchList.empty();
//		this.$watchList.append(watchListView.render().el);
		return this;
	}
}
