'use strict';

var Application = function() {
	this.initialize();
};

Application.prototype.initialize = function() {
	window.alert('hello!');
	$('app').html('<div>');
};


module.exports = Application;
