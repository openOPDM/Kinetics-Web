/*global define:true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'text!Templates/ResetPasswordToken.html'
], function (_, Backbone, ModelsConstants, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),

		events: {
			"click .id-button-reset-password": "_updatePassword",
			"keypress input": "_submitOnEnter"
		},

		initialize: function () {
			this.listenTo(this.model.reset, {
				"invalid": function (model, errors) {
					this._updateError(errors);
				},
				"error:reset-password": this._updateError
			});
		},

		render: function () {
			this.model.Constants = ModelsConstants;
			this.$el.html(this.template(this.model));
			this.$password = this.$("#password");
			this.$re_password = this.$("#re_password");
			this.$error = this.$(".id-error").hide();

			var that = this; //todo:refacor this to change render->afterRender events
			setTimeout(function () {
				that.$password.focus();
			});

			return this;
		},

		_updateError: function (error) {
			this.$error.html(error.description).attr('title', error.description)
				.show()
				.closest('.sign-row').find('input').addClass('errored');
		},

		_hideErrorsAndStatuses: function () {
			this.$error.hide().removeAttr('title')
				.closest('.sign-row').find('input').removeClass('errored');
		},

		_updatePassword: function () {
			this._hideErrorsAndStatuses();

			var formValue = {
				password: this.$password.val(),
				re_password: this.$re_password.val()
			};

			if (this.model.reset.set(formValue, { validate: true })) {
				this.model.reset.setPassword(this.model);
			}
		},

		_submitOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._updatePassword();
			}
		}

	});
});
