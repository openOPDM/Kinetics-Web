/*global define:true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'text!Templates/ResetPasswordSuccess.html'
], function (_, Backbone, ModelsConstants, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),

		events: {
			"click .id-link": "_onNavigateByLink"
		},

		initialize: function () {
		},

		render: function () {
			this.model.Constants = ModelsConstants;
			this.$el.html(this.template(this.model));
			return this;
		},

		_onNavigateByLink: function () {
			this.trigger("navigate-by-link");

			// Prevent navigation by hyperlink
			return false;
		}
	});
});
