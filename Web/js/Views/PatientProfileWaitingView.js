/*global define:true, alert: true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'Models/ErrorConstants',
	'Utils/Dialog',
	'text!Templates/PatientProfileWaiting.html'
], function (_, Backbone, Constants, ErrorConstants, Dialog, templateHtml) {
	'use strict';

	var SuccessStyle = "sign-row-success";
	var ErrorStyle = "sign-row-error";

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),

		events: {
			"click .id-save": "_onSave",
			"click .id-cancel": "_onCancel",
			"click .id-resend": "_onResend",
			"change input[type=text], input[type=radio]": "_onChangeInput",
			"keypress input[type=text]": "_onKeyPress"
		},

		initialize: function () {
			var initialLoad = true;
			this.listenTo(this.model.userProfile, {
				"invalid": function (model, errors) {
					this._updateErrorMessage(errors);
				},

				//TODO: URGENT!!! FIX error messages
				"error": function (error, xhr, options) {
					this._updateErrorMessage((options ? [options.responseError] : [error]));
				},

				"sync": function () {
					if (!initialLoad) {
						this._setSaveStatus({ success: true });
					} else {
						initialLoad = false;
					}

				}
			});

			this.emailChanged = false;
			this.dialog = new Dialog();
		},

		render: function () {
			var that = this;
			this.$el.html(this.template({
				Constants: Constants,
				model: this.model.userProfile,
				homePageTitle: this.model.homePageTitle
			}));

			this.$email = this.$(".id-email");
			this.$firstName = this.$(".id-first-name");
			this.$secondName = this.$(".id-second-name");
			this.$genderRadios = this.$("input:radio[name=gender]");
			this.$birthday = this.$(".id-birthday");

			this.$errorEmail = this.$(".id-error-email");
			this.$errorFirstName = this.$(".id-error-first-name");
			this.$errorSecondName = this.$(".id-error-second-name");
			this.$errorGender = this.$(".id-error-gender");
			this.$errorBirthday = this.$(".id-error-birthday");

			this.$saveStatus = this.$(".id-save-status");

			this.$genderRadios.filter('[value="' + this.model.userProfile.get("gender") + '"]').attr("checked", true);

			this.$birthday.datepicker({
				minDate: '-150y',
				maxDate: "-1y",
				yearRange: "-150:-1",
				dateFormat: 'mm/dd/yy',
				changeMonth: true,
				changeYear: true
			});

			this._hideErrorsAndStatuses();

			return this;
		},
		_hideErrorsAndStatuses: function () {
			this.$("." + ErrorStyle).hide().removeAttr('title');
			this.$('input, select').removeClass('errored');
			this.$saveStatus.hide();
		},


		_onSave: function () {
			this._hideErrorsAndStatuses();
			var userProfileValues = {
				email: $.trim(this.$email.val()),
				firstName: $.trim(this.$firstName.val()),
				secondName: $.trim(this.$secondName.val()),
				birthdayFormatted: $.trim(this.$birthday.val()),
				gender: this.$genderRadios.filter(":checked").val()
			};
			this.trigger("save", this.model.userProfile, userProfileValues, true);
			this.emailChanged = false;
		},

		_updateErrorMessage: function (errors) {
			_.forEach(errors, function (error) {
				switch (error.code) {
				case ErrorConstants.Validation.EmptyFirstName.code:
					this.$errorFirstName.html(error.description);
					this.$errorFirstName.show();
					break;

				case ErrorConstants.Validation.EmptySecondName.code:
					this.$errorSecondName.html(error.description);
					this.$errorSecondName.show();
					break;


				case ErrorConstants.Validation.EmptyBirthday.code:
				case ErrorConstants.Validation.InvalidBirthday.code:
					this.$errorBirthday.html(error.description);
					this.$errorBirthday.show();
					break;

				case ErrorConstants.Validation.EmptyGenderSelected.code:
					this.$errorGender.html(error.description);
					this.$errorGender.show();
					break;

				case ErrorConstants.Validation.EmptyEMail.code:
				case ErrorConstants.Validation.InvalidEMail.code:
					this.$errorEmail.html(error.description);
					this.$errorEmail.show();
					break;

				default:
					this._setSaveStatus(error);
					break;
				}
			}, this);
		},

		_setSaveStatus: function (status) {
			var prefix;
			if (status.success) {
				prefix = "User profile updated successfully. ";
				this.$saveStatus.removeClass(ErrorStyle);
				this.$saveStatus.addClass(SuccessStyle);
			} else {
				prefix = "User profile update failed. ";
				this.$saveStatus.removeClass(SuccessStyle);
				this.$saveStatus.addClass(ErrorStyle);
			}
			this.$saveStatus.html(prefix + (status.description ? status.description : ""));
			this.$saveStatus.show();
		},


		_onCancel: function () {
			this.trigger("cancel");
		},

		_onResend: function () {
			this._hideErrorsAndStatuses();
			if (this.emailChanged) {
				//todo: refactor this
				this.dialog.show('alert', 'Please save the updated email before resending invitation');
			} else {
				this.trigger('resend');
			}
		},

		_onChangeInput: function (e) {
			if ($(e.target).hasClass("id-email")) {
				var email = this.model.userProfile.get("email") || "";
				this.emailChanged = email !== this.$email.val();
			}
			this._hideErrorsAndStatuses();
		},

		_onKeyPress: function (e) {
			if (e.keyCode === 13) {
				this._onSave();
			}
		}

	});
});
