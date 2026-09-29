'use strict';

// deliberately simple: something@something.tld, no whitespace
exports.isEmail = function(value) {
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
