import Backbone from 'backbone';
import { BaseView } from './../base-view';
import { TrelloToken } from './../models/trello-token';
import Trello from 'trello';

export class TrelloTokenView extends BaseView {
	constructor(options={}, initial=[]) {
		_.extend(options, {
			events: {
				'click .deauthorise': 'deauthorise',
				'click .authorise': 'authorise',
			}
		});
		super(options);

		this.model = new TrelloToken();
		this.model.fetch({
			error: (model, response, options)=>{
				this.renderWithout();
			},
			success: (model, response, options)=>{
				Trello.setToken(model.get('token'));
				Trello.members.get('me',
					(me) => {
						this.model.set({me: me});
						this.renderWith();
					},
					(error) => {
						console.error(error);
						this.renderWithout();
					}
				);
			}
		});

		//this.listenTo(this.model, 'change', this.render);
	}

	renderWith() {
		this.template = _.template($('#trello_token_template').html());
		return this.render();
	}

	renderWithout() {
		this.template = _.template($('#trello_token_missing_template').html());
		return this.render();
	}

	render() {
		console.log('TrelloTokenView::render');
		this.$el.html(this.template(this.model.attributes));
		return this;
	}

	authorise() {
		console.log('TrelloTokenView::authorise ' + this.model.get('id'));
		window.location.href="/trello_authorise";
	}

	deauthorise() {
		console.log('TrelloTokenView::deauthorise ' + this.model.get('id'));
		this.model.destroy({
			wait: true,
			success: (model, response, options)=>{
				this.clearMessages();
				this.renderWithout();
			},
			error: (model, response, options)=>{
				this.showMessage(response.responseText, BaseView.MESSAGE_ERROR);
				console.error(response.responseText);
			}
		});
	}
}