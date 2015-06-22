/*global define:true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'Models/Constants',
	'Models/ErrorConstants',
	'text!Templates/Confirm.html'
], function ($, _, Backbone, Constants, ErrorConstants, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),

		events: {
			"click .id-button-confirm": "_confirm",
			"click .id-button-resend": "_resendConfirmation",
			"keypress input": "_submitOnEnter"
		},

		initialize: function () {
			var that = this;
			this.listenTo(this.model, {
				"invalid": function (model, errors) {
					that._updateConfirmError(errors);
				},
				"error:resend-confirmation": this._updateResendError,
				"error:confirm": this._updateConfirmError
			});
		},

		render: function () {
			var that = this;
			this.$el.html(this.template(this.model.attributes));
			this.$confirmationCode = this.$(".id-code");
			this.$email = this.$(".id-email");
			this.$errorCode = this.$(".id-error-code");
			this.$errorResend = this.$(".id-error-resend");

			this._hideErrorsAndStatuses();
			setTimeout(function () {
				that.$confirmationCode.focus();
			});
			return this;
		},

		_updateResendError: function (error) {
			this.$errorResend.show().html(error.description);
			this.$email.addClass('errored');
		},

		_updateConfirmError: function (error) {
			this.$errorCode.show().html(error.description);
            this.$confirmationCode.addClass('errored');
		},

		_hideErrorsAndStatuses: function () {
			this.$errorCode.hide();
			this.$errorResend.hide();
            this.$confirmationCode.removeClass('errored');
            this.$email.removeClass('errored');
		},

		_resendConfirmation: function () {
			this._hideErrorsAndStatuses();
			this.model.resendConfirmation();
		},

		_confirm: function () {
			this._hideErrorsAndStatuses();
			var confirmationCode = $.trim(this.$confirmationCode.val());
			if (this.model.set("confirmationCode", confirmationCode, { validate: true })) {
				this.model.confirm();
			}
		},

		_submitOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._confirm();
			}
		}
	});

});
