import Backbone from 'backbone';
import { BaseView } from './../base-view';

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
