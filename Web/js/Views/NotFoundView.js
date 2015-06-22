/*global define: true */
define([
	'backbone',
	'underscore',
	'text!Templates/NotFound.html'
], function (Backbone, _, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper not-found",
		template: _.template(templateHtml),

		events: {
//			"click .id-sign-in": "_onSignIn",
		},

		initialize: function () {

		},

		remove: function () {
			// Call base implementation
			Backbone.View.prototype.remove.apply(this, arguments);
		},

		render: function () {
			this.$el.html(this.template());
			return this;
		}
	});

});
