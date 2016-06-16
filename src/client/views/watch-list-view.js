import Backbone from 'backbone';
import { BaseView } from './../base-view';
import { WatchList } from './../collections/watch-list';
import { WatchView } from './watch-view';
import { AddWatchView } from './add-watch-view';
import { Watch } from './../models/watch';

export class WatchListView extends BaseView {
	constructor(options={}, initial=[]) {
		_.extend(options, {
			events: {
				'click #register-watch-button': 'openAddWatchDialog'
			}
		});
		super(options);
		// delegate this.events
		//this.delegateEvents();

		this.collection = new WatchList(initial);
		this.collection.fetch({
			reset: true
		});

		// called after collection fetched from server
		this.listenTo(this.collection, 'reset', this.render);
		this.listenTo(this.collection, 'add', this.renderWatch);
	}

	render() {
		console.log('WatchListView::render');
		this.$el.find('#list').empty();
		this.collection.each(function(item) {
			this.renderWatch(item);
		}, this);
		return this;
	}

	renderWatch(watch) {
		console.log('WatchListView::renderWatch');
		let watchView = new WatchView({
			model: watch
		});
		this.$el.find('#list').append(watchView.render().el);
	}

	openAddWatchDialog(e) {
		console.log('WatchListView::openDialog');
		let dialog = new AddWatchView({
			el: '#add-watch-modal',
			model: new Watch()
		});
		this.listenTo(dialog, 'dialog-close', this.addWatchDialogClosed);
	}

	addWatchDialogClosed() {
		console.log('WatchListView::addWatchDialogClosed');
		this.collection.fetch({
			reset: true
		});
	}
}