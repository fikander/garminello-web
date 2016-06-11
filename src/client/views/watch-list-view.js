import Backbone from 'backbone';
import { BaseView } from './../base-view';
import { WatchList } from './../collections/watch-list';
import { WatchView } from './watch-view';

export class WatchListView extends BaseView {
	constructor(options={}, initial=[]) {
		_.extend(options, {
			events: {
				'click #register_watch': 'registerWatch'
			}
		});
		super(options);
		// delegate this.events
		//this.delegateEvents();

		this.collection = new WatchList(initial);
		this.collection.fetch({
			reset: true,
		});

		// called after collection fetched from server
		this.listenTo(this.collection, 'reset', this.render);
		this.listenTo(this.collection, 'add', this.renderWatch);
	}

	render() {
		console.log('WatchListView::render');
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
		this.$el.append(watchView.render().el);
	}

	registerWatch(e) {
		console.log('WatchListView::registerWatch');
		e.preventDefault();
		let formData = {};
		$('#register_watch_form').find('input').each(
			(i, el) => {
				if ($(el).val() !== '') {
					formData[el.id] = $(el).val();
				}
			}
		);
		// do not add new watch until success response from server
		this.collection.create(formData, {
			wait: true,
			success: (model, response, options)=>{
				this.clearMessages();
			},
			error: (model, response, options)=>{
				this.showMessage(response.responseText, BaseView.MESSAGE_ERROR);
				console.error(response.responseText);
			}
		});
	}
}