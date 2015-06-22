/*global define: true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'text!Templates/ResetPassword.html'
], function (_, Backbone, ModelsConstants, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper reset-password",
		template: _.template(templateHtml),

		events: {
			"click .id-button-reset-password": "_resetPassword",
			"keypress input": "_submitOnEnter"
		},

		initialize: function () {
			this.listenTo(this.model.reset, {
				"invalid": function (model, errors) {
					this._updateValidationError(errors);
				},
				"error:reset-password": this._updateResetError
			});
		},

		render: function () {
			this.model.Constants = ModelsConstants;
			this.$el.html(this.template(this.model));
			this.$email = this.$(".id-email");
			this.$error = this.$(".id-error").hide();

			if (this.model.reset.get('email')) {
				this.$email.val(this.model.reset.get('email'));
			}

			var that = this; //todo:refacor this to change render->afterRender events
			setTimeout(function () {
				that.$email.focus();
			});

			return this;
		},

		_updateResetError: function (error) {
			this.$error.html(error.description)
				.show();
		},

		_updateValidationError: function (error) {
			this.$error.html(error.description)
				.show();
		},

		_hideErrorsAndStatuses: function () {
			this.$error.hide();
		},

		_resetPassword: function () {
			this._hideErrorsAndStatuses();
			var email = $.trim(this.$email.val());
			if (this.model.reset.set("email", email, { validate: true })) {
				this.model.reset.resetPassword();
			}
		},

		_submitOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._resetPassword();
			}
		}

	});

});
