'use strict';

var Application = function() {
	this.initialize();
};

Application.prototype.initialize = function() {
	$('app').html('<div>');
};


module.exports = Application;
