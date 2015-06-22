// Require.js allows us to configure shortcut alias
require.config({
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
	shim: {
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: ['underscore', 'jQuery'],
			exports: 'Backbone'
		},
		'backbone.localStorage': ['backbone'],
		'jQuery': { exports: 'jQuery' },
		'jQuery.ui': ['jQuery'],
		'jQuery.hotkeys': ['jQuery'],
		'jQuery.placeholder': ['jQuery'],
		'jQuery.base64': ['jQuery'],
		'jQuery.flot': ['jQuery'],
		'jQuery.flot.time': ['jQuery.flot'],
		'jQuery.flot.curvedLines': ['jQuery.flot'],
		'jQuery.flot.valuelabels': ['jQuery.flot'],
		'jQuery.flot.navigate': ['jQuery.flot'],
		'recaptcha': {
			exports: 'Recaptcha'
		},
		'lowLag': {
			deps: ['soundmanager'],
			exports: 'lowLag'
		},
		'hashchage': ['jQuery']
	},
	paths: {
		'jQuery': '../assets/jquery.min',
		'jQuery.ui': '../assets/jquery-ui-min',
		'jQuery.hotkeys': '../assets/jquery.hotkeys',
		'jQuery.placeholder': '../assets/jquery.placeholder.min',
		'jQuery.base64': '../assets/jquery.base64.min',
		'excanvas': '../assets/excanvas',
		'jQuery.flot': '../assets/jquery.flot',
		'jQuery.flot.time': '../assets/jquery.flot.time',
		'jQuery.flot.curvedLines': '../assets/jquery.flot.curvedLines',
		'jQuery.flot.valuelabels': '../assets/jquery.flot.valuelabels',
		'jQuery.flot.navigate': '../assets/jquery.flot.navigate',

		'underscore': '../assets/lodash.underscore.min',
		'backbone': '../assets/backbone.min',
		'backbone.localStorage': '../assets/backbone.localStorage-min',
		'recaptcha': 'https://www.google.com/recaptcha/api/js/recaptcha_ajax',

		'text': '../assets/text',
		'formatter': '../assets/string.format',
		'moment': '../assets/moment.min',

		'lowLag': '../assets/lowLag',
		'soundmanager': '../assets/sm2/js/soundmanager2-nodebug',
		'hashchage': '../assets/jquery.hashchange'
	}
});

require([
	'Application'
], function (Application) {
	"use strict";
	new Application();
});