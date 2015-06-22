/*global define:true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'Views/Constants',
	'Models/Constants',
	'Models/ErrorConstants',
	'text!Templates/CreatePatient.html',
	'jQuery.placeholder',
	'formatter'
], function ($, _, Backbone, Constants, ModelsConstants, ErrorConstants, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper create-patient",
		template: _.template(templateHtml),

		events: {
			"click .id-create-patient": "_onCreatePatient",
			"click .id-cancel": "_onCancel",
			"keypress input": "_submitOnEnter"
		},

		initialize: function () {
			this.listenTo(this.model, {
				"invalid": function (model, errors) {
					this._updateErrorMessage(errors);
				},
				"error": function (error) {
					this._updateErrorMessage([ error ]);
				}
			});
		},

		render: function () {
			this.$el.html(this.template({
				Constants: ModelsConstants,
				model: this.model
			}));

			this.$firstName = this.$(".id-first-name");
			this.$secondName = this.$(".id-second-name");
			this.$birthday = this.$(".id-birthday");
			this.$genderRadios = this.$("input:radio[name=gender]");

			this.$email = this.$(".id-email");

			this.$errorEmail = this.$(".id-error-email");

			this.$errorGender = this.$(".id-error-gender");
			this.$errorBirthday = this.$(".id-error-birthday");
			this.$errorGeneral = this.$(".id-error-general");
			this.$errorFirstName = this.$(".id-error-first-name");
			this.$errorSecondName = this.$(".id-error-second-name");

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

            var that = this; //todo:refacor this to change render->afterRender events
            setTimeout(function(){
                that.$firstName.focus();
            });

			return this;
		},


		// Overload remove() method to reset reCaptcha inner state.
		remove: function () {
			// Call base implementation
			Backbone.View.prototype.remove.apply(this, arguments);
		},

		_hideErrorsAndStatuses: function () {

            this.$('.sign-row-error').hide().removeAttr('title');
            this.$('input, select').removeClass('errored');
		},

		_onCancel: function () {
			this.trigger('cancel-creation');
		},

		_onCreatePatient: function () {
			this._hideErrorsAndStatuses();

			var values = {
				firstName: $.trim(this.$firstName.val()),
				secondName: $.trim(this.$secondName.val()),
				birthdayFormatted: $.trim(this.$birthday.val()),
				email: $.trim(this.$email.val()) || null,
				gender: this.$genderRadios.filter(":checked").val()
			};

			if (this.model.set(values,{ validate: true, passwordRequired: false, birthdayRequired:true, genderRequired:true })) {
				this.trigger("create-patient", this.model);
			}
		},

		_submitOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._onCreatePatient();
			}
		},

		_updateErrorMessage: function (errors) {
			_.forEach(errors, function (error) {
                var errored = {
                    $container:this.$errorGeneral
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
				}

                errored.$container.show().html(error.description)
                    .attr('title', error.description)

                errored.$input = errored.$input || errored.$container.closest('.sign-row').find('input[type!=radio], select');
                errored.$input.addClass('errored');

			}, this);
		}
	});

});
