//window.$ = require('jquery');
//import $ from 'jquery';
//window.$ = $;
import { Application } from './app';

$(function() {
	console.log('STARTING APP');
	window.app = new Application();
});
