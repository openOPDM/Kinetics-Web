/*global define:true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'recaptcha',
	'Views/Constants',
	'Models/Constants',
	'Models/ErrorConstants',
	'text!Templates/SignUp.html',
	'text!Templates/CreateUser.html',
	'text!Templates/CreateSharedUser.html',
	'jQuery.placeholder',
	'formatter'
], function ($, _, Backbone, Recaptcha, Constants, ModelsConstants, ErrorConstants, signUpHtml, createUserHtml, createSharedUserHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		signUpTemplate: _.template(signUpHtml),
		createUserTemplate: _.template(createUserHtml),
		createSharedUserTemplate: _.template(createSharedUserHtml),

		events: {
			"click .id-sign-up": "_signUp",
			"click .id-cancel": "_cancel",
			"change .id-role": "_changeUserRole",
			"change .select-all": "_toggleProjectSelection",
			"change input[name='project']": "_updateToggleCheckbox",
			"keypress #password, #password-confirmation": "_validatePassword"
		},

		initialize: function () {
			this.listenTo(this.model.profile, {
				"invalid": function (model, errors) {
					this._updateErrorMessage(errors);
				},
				"error": function (error) {
					if (error.code === 809) {
						Recaptcha.reload();
					}
					this._updateErrorMessage([ error ]);
				}
			});
		},

		render: function (params) {
			switch (this.model.mode) {
			case 'sa-create-user':
				this.$el.html(this.createUserTemplate({
					Constants: ModelsConstants,
					profile: this.model.profile,
					projects: this.model.projects,
					roles: ModelsConstants.UserRole,
					showProjectSelect: this.model.projects.length > 1
				}));
				break;
			case 'invite':
				this.$el.html(this.signUpTemplate({
					Constants: ModelsConstants,
					profile: this.model.profile,
					projects: this.model.projects,
					showProjectSelect: false
				}));
				break;
			case 'shared':
				this.$el.html(this.createSharedUserTemplate({
					Constants: ModelsConstants,
					profile: this.model.profile
				}));
				break;
			default:
				this.$el.html(this.signUpTemplate({
					Constants: ModelsConstants,
					profile: this.model.profile,
					projects: this.model.projects,
					showProjectSelect: this.model.projects.length > 1
				}));

			}

			this.$firstName = this.$(".id-first-name");
			this.$secondName = this.$(".id-second-name");
			this.$birthday = this.$(".id-birthday");
			this.$genderRadios = this.$("input:radio[name=gender]");

			this.$email = this.$(".id-email");

			this.$passwordOld = this.$(".id-password");

			this.$passwordConfirmation = this.$(".id-password-confirmation");
			this.$errorEmail = this.$(".id-error-email");

			this.$project = this.$('input[name="project"]');

			this.selectedProjects = function () {
				var val = [];
				this.$project.each(function () {
					var $this = $(this);
					if ($this.is(':checked')) {
						val.push($this.val());
					}
				});
				return val;
			};

			this.$errorProject = this.$(".id-error-project");

			this.$role = this.$('.id-role');

			this.$errorBirthday = this.$(".id-error-birthday");
			this.$errorGender = this.$(".id-error-gender");
			this.$errorPassword = this.$(".id-error-password");
			this.$errorPasswordConfirmation = this.$(".id-error-password-confirmation");
			this.$errorGeneral = this.$(".id-error-general");
			this.$errorFirstName = this.$(".id-error-first-name");
			this.$errorSecondName = this.$(".id-error-second-name");
			this.$errorCaptcha = this.$(".id-error-captcha");

			this.$capsLockWarning = this.$(".id-warning-message");


			this.$("input, textarea").placeholder();

			this._hideErrorsAndStatuses();

			this.$birthday.datepicker({
				minDate: '-150y',
				maxDate: "-1y",
				yearRange: "-150:-1",
				dateFormat: 'mm/dd/yy',
				changeMonth: true,
				changeYear: true
			});

			this._setUserProjects(-1);

			var that = this; //todo:refacor this to change render->afterRender events
			setTimeout(function () {
				that.$firstName.focus();
			});

			return this;
		},

		showCaptcha: function () {
			Recaptcha.create(Constants.ReCaptchaPublicKey, "reCaptcha", {
				theme: "clean"
			});
			//TODO: refactor this
			setTimeout(function () {
				this.$("#recaptcha_reload_btn, #recaptcha_switch_audio_btn, #recaptcha_whatsthis_btn").attr("tabindex", -1);
			}, 500);
		},

		// Overload remove() method to reset reCaptcha inner state.
		remove: function () {
			Recaptcha.destroy();

			// Call base implementation
			Backbone.View.prototype.remove.apply(this, arguments);
		},

		_hideErrorsAndStatuses: function () {
			this.$('.sign-row-error').hide().removeAttr('title');
			this.$('input, select').removeClass('errored');
		},

		_signUp: function () {
			this._hideErrorsAndStatuses();
			var values = {
				firstName: $.trim(this.$firstName.val()),
				secondName: $.trim(this.$secondName.val()),
				projectId: this.model.profile.get('projectId') || this.model.projects && (this.model.projects.length > 1 ? this.selectedProjects() || [] : [this.model.projects[0].get('id')]),
				birthdayFormatted: $.trim(this.$birthday.val()),
				email: $.trim(this.$email.val()) || this.model.profile.get('email'),
				gender: this.$genderRadios.filter(":checked").val(),
				password: this.$passwordOld.val(),
				role: this.$role.val(),
				passwordConfirmation: this.$passwordConfirmation.val(),
				recaptchaChallenge: Recaptcha && Recaptcha.get_challenge(),
				recaptchaResponse: Recaptcha && Recaptcha.get_response()
			};

			switch (this.model.mode) {
			case 'sa-create-user':
				if (this.model.profile.set(values, { validate: true, passwordRequired: false, birthdayRequired: false, genderRequired: false })) {
					this.trigger("sign-up", this.model.profile);
				}
				break;
			case 'invite':
				if (this.model.profile.set(values, { validate: true, passwordRequired: true, projectNotRequired: true, birthdayRequired: true, genderRequired: true })) {
					this.trigger("sign-up", this.model.profile);
				}
				break;
			case 'shared':
				if (this.model.profile.set(values, { validate: true, passwordRequired: true, projectNotRequired: true, birthdayRequired: true, genderRequired: true })) {
					this.trigger("sign-up", this.model.profile);
				}
				break;
			default:
				if (this.model.profile.set(values, { validate: true, passwordRequired: true, birthdayRequired: true, genderRequired: true  })) {
					this.trigger("sign-up", this.model.profile);
				}
			}
		},

		_cancel: function () {
			this.trigger('cancel-creation');
		},

		_updateErrorMessage: function (errors) {
			_.forEach(errors, function (error) {
				var errored = {
					$container: null
				};

				switch (error.code) {
				case ErrorConstants.Validation.EmptyFirstName.code:
					errored.$container = this.$errorFirstName;
					break;

				case ErrorConstants.Validation.EmptySecondName.code:
					errored.$container = this.$errorSecondName;
					break;

				case ErrorConstants.Validation.EmptyEMail.code:
				case ErrorConstants.Validation.InvalidEMail.code:
					errored.$container = this.$errorEmail;
					break;

				case ErrorConstants.Validation.EmptyBirthday.code:
				case ErrorConstants.Validation.InvalidBirthday.code:
					errored.$container = this.$errorBirthday;
					break;

				case ErrorConstants.Validation.EmptyGenderSelected:
				case ErrorConstants.Validation.EmptyGenderSelected.code:
					errored.$container = this.$errorGender;
					break;

				case ErrorConstants.Validation.EmptyPassword.code:
					errored.$container = this.$errorPassword;
					break;

				case ErrorConstants.Validation.InvalidPasswordConfirmation.code:
					errored.$container = this.$errorPasswordConfirmation;
					break;

				case ErrorConstants.Validation.NoProjectSelected.code:
					errored.$container = this.$errorProject;
					break;

				case ErrorConstants.Validation.EmptyCaptcha.code:
					errored.$container = this.$errorCaptcha.show();
					break;


				default:
					errored.$container = this.$errorGeneral;
					break;
				}

				errored.$container.show().html(error.description)
					.attr('title', error.description);

				errored.$input = errored.$input || errored.$container.closest('.sign-row').find('input[type!=radio], select');
				errored.$input.addClass('errored');

			}, this);
		},

		_validatePassword: function (e) {
			var keyCode = e.which;
			if (keyCode >= 65 && keyCode <= 90) {
				this._toggleCapsLockWarning(!e.shiftKey);

			} else if (keyCode >= 97 && keyCode <= 122) {
				this._toggleCapsLockWarning(e.shiftKey);
			}
		},

		_toggleCapsLockWarning: function (showWarning) {
			if (showWarning) {
				this._capsLock = true;
				this.$capsLockWarning.show();
			} else {
				this._capsLock = false;
				this.$capsLockWarning.hide();
			}
		},

		_changeUserRole: function () {
			this._setUserProjects(this.$role.val().toUpperCase() === ModelsConstants.UserRole.SiteAdmin.toUpperCase());
		},

		_setUserProjects: function (params) {
			this.$project.removeAttr('disabled').removeClass('semitransparent');

			switch (params - 0) {
			case 1:
				this.$project.attr('disabled', 'disabled').addClass('semitransparent')
					.find('option').each(function () {
						$(this).removeAttr('selected');
					});
				var $row = this.$project.closest('.sign-row');
				$row.find('select').removeClass('errored');
				$row.find('.sign-row-error').hide();
				break;

			case -1:
				this.$role.val(ModelsConstants.UserRole.Patient.toUpperCase());
				this.$project.find('option').each(function () {
					$(this).removeAttr('selected');
				});
				break;

			default:
				break;
			}
		},

		_toggleProjectSelection: function (e) {
			var $this = $(e.target);
			if ($this.is(':checked')) {
				this.$project.attr('checked', true);
			} else {
				this.$project.attr('checked', false);
			}
		},

		_updateToggleCheckbox: function () {
			$('.select-all').attr('checked', $('input[name="project"]:checked').length === $('input[name="project"]').length);
		}
	});
});
