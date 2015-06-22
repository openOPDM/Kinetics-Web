/*global define:  true */
define([
	'underscore',
	'moment',
	'backbone',
	'Models/Constants',
	'Utils/Dialog',
	'text!Templates/AnalystRoomRow.html',
	'text!Templates/AnalystRoomConfirmation.html'
], function (_, moment, Backbone, ModelsConstants, Dialog, templateHtml, templateConfirmationHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "result-row",
		template: _.template(templateHtml),
		templateConfirmation: _.template(templateConfirmationHtml),

		events: {
			"click .id-button-detail": "_onClickDetail",
			"click .id-button-remove": "_onClickRemove"
		},

		initialize: function () {
			var that = this;
			this.listenTo(this.model, "change", this.render);
			this.dialog = new Dialog();
			this.listenTo(this.dialog, {
				'unassign-confirmed': function () {
					that.model.trigger("unassign", that.model);
				}
			});
		},

		render: function () {
			this.$el.html(this.template({
				model: this.model,
				moment: moment,
				Constants: ModelsConstants
			}));

			return this;
		},

		_onClickDetail: function () {
			this.model.trigger("detail", this.model);
		},

		_onClickRemove: function () {
			this.dialog.show('confirm', this.templateConfirmation({ model: this.model }), 'unassign');
		}
	});
});