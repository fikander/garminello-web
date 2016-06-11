import Backbone from 'backbone';
Backbone.$ = window.$;

import { Router } from './router';
import { ProfileView } from './views/profile-view';

export class Application {

	constructor() {
		console.log('Application::constructor');
		this.router = new Router();
		this.mainView = new ProfileView({
			el: $('#root')
		});
		this.showApp();
	}

	showApp() {
		this.mainView.render();
		Backbone.history.start({
			//pushState: true,
			root: '/home'
		});
	}
}
