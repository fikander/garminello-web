import Backbone from 'backbone';
import { BaseView } from './../base-view';

export class AddWatchView extends BaseView {
	constructor(options={}, initial=[]) {
		_.extend(options, {
			events: {
				'click #register_watch': 'registerWatch',
				'click #close': 'close'
			}
		});
		super(options);

		// show messages within this dialog
		this.$messages = this.$('#messages');

		this.render();

		this.listenTo(this, 'watch-registered', this.watchRegistered);

		this.$el.find('#spinner').hide();
		this.$el.find('#register_watch').show();
	}

	render() {
		console.log('AddWatchView::render');
		// show the dialog
		this.$el.modal("show");
		return this;
	}

	registerWatch(e) {
		console.log('AddWatchView::registerWatch');
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
		this.model.save(formData, {
			wait: true,
			success: (model, response, options)=>{
				this.clearMessages();
				this.waitForWatchRegistered();
			},
			error: (model, response, options)=>{
				this.showMessage(response.responseText, BaseView.MESSAGE_ERROR);
				console.error(response.responseText);
			}
		});
	}

	close(e) {
		this.watchRegistered(false);
	}

	pollWatchRegistered() {
		this.model.fetch({
			success: (model, response, options)=> {
				if (!model.get('active')) {
					this.pollId = setTimeout(_.bind(this.pollWatchRegistered, this), 1000);
				} else {
					this.trigger('watch-registered', true);
				}
			},
			error: (model, response, options)=> {
				console.error(response);
			}
		});
	}

	waitForWatchRegistered() {
		this.$el.find('#register_watch').hide();
		this.$el.find('#spinner').show();
		this.pollId = setTimeout(_.bind(this.pollWatchRegistered, this), 1000);
	}

	watchRegistered(success) {
		console.log('AddWatchView::watchRegistered');
		if (!success) {
			this.model.destroy();
		}
		clearTimeout(this.pollId);
		this.$el.modal("hide");
		this.stopListening();
		this.undelegateEvents();
		this.trigger('dialog-close');
	}
}