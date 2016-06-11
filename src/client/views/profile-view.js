import Backbone from 'backbone';
import { WatchListView } from './watch-list-view';
import { TrelloTokenView } from './trello-token-view';

export class ProfileView extends Backbone.View {
	constructor(options={}) {
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
		new WatchListView({
			el: '#watchList'
		});
		new TrelloTokenView({
			el: '#trelloToken'
		});
//		this.$watchList.empty();
//		this.$watchList.append(watchListView.render().el);
		return this;
	}
}
