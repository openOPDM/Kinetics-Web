/*global define:true */
define([
	'backbone',
	'backbone.localStorage'
], function (Backbone) {
	'use strict';

	return Backbone.Model.extend({
		defaults: {
			id: "DefaultInstance",
			email: null,
			sessionToken: null
		},

		localStorage: new Backbone.LocalStorage("kinetics-AccountData")
	});
});
