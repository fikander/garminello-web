import Backbone from 'backbone';
import { BaseView } from './../base-view';
import { TrelloToken } from './../models/trello-token';

export class TrelloTokenView extends BaseView {
	constructor(options={}, initial=[]) {
		_.extend(options, {
			events: {
			}
		});
		super(options);

		this.template = _.template($('#trello_token_template').html());

		this.trello = new TrelloToken(initial);
		this.trello.fetch();

		this.listenTo(this.trello, 'change', this.render);
	}

	render() {
		console.log('TrelloTokenView::render');
		this.$el.html(this.template(this.trello.attributes));
		return this;
	}
}