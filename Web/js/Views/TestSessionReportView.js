/*global define:true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'Utils/MathExtensions',
	'text!Templates/TestSessionReport.html',
	'text!Templates/TestSessionReportTestRoomLink.html',
	'moment'
], function (_, Backbone, ModelsConstants, MathExtensions, templateHtml, templateTestRoomLinkHtml, moment) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),
		templateTestRoomLink: _.template(templateTestRoomLinkHtml),

		events: {
			"click .id-user-test-room": "_onClickUserTestRoom"
		},

		_views: null,

		initialize: function () {
			this._views = [];
		},

		render: function () {
			this.$el.html(this.template({
				model: this.model,
				clientSystemInfo: this.model.parseClientSystemInfo(),
				moment: moment,
				Constants: ModelsConstants,
				MathExtensions: MathExtensions,
				shared: /^shared/.test(Backbone.history.fragment)
			}));

			this.$userRow = this.$(".id-user-test-room");

			return this;
		},

		showContentView: function (view) {
			this.$el.append(view.render().el);
		},

		showLinkToTestRoom: function (userProfile) {
			this.$userRow.html(this.templateTestRoomLink(userProfile));
		},

		_onClickUserTestRoom: function () {
			this.trigger("user-test-room");
			return false;
		}
	});
});
