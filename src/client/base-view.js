import Backbone from 'backbone';

export class BaseView extends Backbone.View {
	constructor(options) {
		super(options);
		this.$messages = $('#messages');
	}

	showMessage(message, type=BaseView.MESSAGE_INFO) {
		this.clearMessages();
		this.$messages.append(`<li>${ message }</li>`);
	}

	clearMessages() {
		this.$messages.empty();
	}
}

BaseView.MESSAGE_INFO = 1;
BaseView.MESSAGE_ERROR = 2;
