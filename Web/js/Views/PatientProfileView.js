/*global define:true, alert: true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'Models/ErrorConstants',
	'Utils/Dialog',
	'text!Templates/PatientProfile.html'
], function (_, Backbone, Constants, ErrorConstants, Dialog, templateHtml) {
	'use strict';

	var SuccessStyle = "sign-row-success";
	var ErrorStyle = "sign-row-error";

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),

		events: {
		},

		initialize: function () {
			//
		},

		render: function () {
			var that = this;
			this.$el.html(this.template({
				Constants: Constants,
				model: this.model.userProfile,
				homePageTitle: this.model.homePageTitle
			}));

			return this;
		}
	});
});
