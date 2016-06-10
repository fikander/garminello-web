import Backbone from 'backbone';
import { BaseView } from './../BaseView';
import { Watch, WatchList } from './../models/Watch';

export class WatchView extends BaseView {
	constructor(options) {
		_.extend(options, {
			tagName: 'div',
			className: 'watch-container',
			events: {
				'click .delete': 'clear'
			}
		});
		super(options);

		this.template = _.template($('#watch_template').html());
	}

	render() {
		console.log(this.model.toJSON());
		this.$el.html(this.template(this.model.attributes));
		//	`watch ${this.model.get('type')} ${JSON.stringify(this.model.attributes)}`);
		return this;
	}

	unrender() {
		this.$el.remove();
	}

	clear() {
		console.log('WatchView::clear ' + this.model.get('id'));
		this.model.destroy({
			wait: true,
			success: (model, response, options)=>{
				this.unrender();
				this.clearMessages();
			},
			error: (model, response, options)=>{
				this.showMessage(response.responseText, BaseView.MESSAGE_ERROR);
				console.error(response.responseText);
				console.error(response);
			}
		});
	}
}

export class WatchListView extends BaseView {
	constructor(options, initial) {
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
