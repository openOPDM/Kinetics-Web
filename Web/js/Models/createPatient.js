/*global define: true */
define([
	'jQuery',
	'moment',
	'backbone',
	'underscore',
	'Models/Constants',
	'Models/ErrorConstants',
	'DataLayer/ModelSyncExtension',
	'DataLayer/Constants',
	'DataLayer/ServerInteractionSerializersHash',
	'Utils/StringExtensions',
	'backbone.localStorage'
], function ($, moment, Backbone, _, Constants, ErrorConstants, ModelSyncExtension, DataConstants, ServerInteractionSerializersHash, StringExtensions) {
	'use strict';

	var UserProfile = Backbone.Model.extend({
		defaults: {
			sessionToken: null,
			email: null,
			firstName: null,
			secondName: null,
			birthdayFormatted: null,
			birthday: null,
			gender: null
		},

		localStorage: new Backbone.LocalStorage("kinetics-UserProfile"),

		initialize: function () {
			this._updateBirthdayUIFields(this.get("birthday"));
			this.on({
				"change: birthday": this._updateBirthdayUIFields,
				"change: birthdayFormatted": this._updateBirthday
			});
		},

		_updateBirthdayUIFields: function (model, birthday) {
			if (birthday) {
				var m = moment(birthday);
				this.set("birthdayFormatted", m.format("MM/DD/YYYY"));
			}
		},

		_updateBirthday: function () {
			var birthdayFormatted = this.get("birthdayFormatted");

			if (birthdayFormatted) {
				var birthday = moment(birthdayFormatted);
				if (birthday.isValid()) {
					this.set("birthday", birthday.format('YYYY-MM-DD'));
				}
			}
		},

		validate: function (attrs, options) {
			options = options || {};

			var errors = [];

			if (!StringExtensions.isTrimmedEmpty(attrs.email) && !attrs.email.match(Constants.EmailPattern)) {
				errors.push(ErrorConstants.Validation.InvalidEMail);
			}

			if (StringExtensions.isTrimmedEmpty(attrs.firstName)) {
				errors.push(ErrorConstants.Validation.EmptyFirstName);
			}

			if (StringExtensions.isTrimmedEmpty(attrs.secondName)) {
				errors.push(ErrorConstants.Validation.EmptySecondName);
			}

			if (options.birthdayRequired) {
				if (StringExtensions.isTrimmedEmpty(attrs.birthdayFormatted)) {
					errors.push(ErrorConstants.Validation.EmptyBirthday);
				} else {
					var birthdayDate = moment(attrs.birthdayFormatted, "MM/DD/YYYY");
					if (!birthdayDate.isValid()) {
						errors.push(ErrorConstants.Validation.InvalidBirthday);
					}
					else {
						var age = (new Date()).getFullYear() - birthdayDate.year(); //birthdayYear = birthdayDate.year()
						if (age < 1 || age > 150) {
							errors.push(ErrorConstants.Validation.InvalidBirthday);
						}
					}
				}
			}

			if (options.passwordRequired) {
				if (StringExtensions.isEmpty(attrs.password)) {
					errors.push(ErrorConstants.Validation.EmptyPassword);
				}
				if (attrs.password !== attrs.passwordConfirmation) {
					errors.push(ErrorConstants.Validation.InvalidPasswordConfirmation);
				}
			}

			if (options.genderRequired && !attrs.gender) {
				errors.push(ErrorConstants.Validation.EmptyGenderSelected);
			}

			if (errors.length > 0) {
				return errors;
			}
		},

		toJSON: function (options) {
			this._updateBirthday();
			var result = Backbone.Model.prototype.toJSON.call(this, options);

			if (options.local) {
				result = _.pick(result,
					"email",
					"firstName",
					"secondName",
					"birthday",
					"gender"
				);
			}

			return result;
		},

		_checkUserRole: function () {
			// TODO: Support multiple roles?
			var that = this;
			_.each(this.get("roles"), function (role) {
				that.set('role', role.name.toLowerCase());
			});
		}
	});

	// Extend instance with server command to get/update information only for current user
	ModelSyncExtension.extend(UserProfile.prototype, {
		create: ServerInteractionSerializersHash.AccountManager.createPatient
	});

	return UserProfile;
});