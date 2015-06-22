/*global define: true */
define([
	'moment',
	'backbone',
	'underscore',
	'Models/Constants',
	'Models/ErrorConstants',

	'DataLayer/Constants',
	'DataLayer/ModelSyncExtension',
	'DataLayer/ServerInteractionSerializersHash',
	'Utils/StringExtensions',
	'backbone.localStorage'
], function (moment, Backbone, _, Constants, ErrorConstants, DataConstants, ModelSyncExtension, ServerInteractionSerializersHash, StringExtensions) {
	'use strict';

	var UserProfile = Backbone.Model.extend({
		defaults: {
			userId: null,
			email: null,
			firstName: null,
			secondName: null,
			creationDate: null,
			timestamp: null,
			status: null,
			birthdayFormatted: null,
			birthday: null,
			gender: null,
			uid: null,
			passHash: null,
			password: null,
			passwordOld: null,
			passwordNew: null,
			passwordConfirmation: null,
			role: null,
			recaptchaChallenge: null,
			recaptchaResponse: null,
			project: [],
			projectId: null
			/*projectId: null,
			project: DataConstants.predefinedProject ? DataConstants.predefinedProjectId : null*/
		},

		localStorage: new Backbone.LocalStorage("kinetics-UserProfile"),

		initialize: function () {
			this._updateBirthdayUIFields(this.get("birthday"));
			this.on({
				"change:birthday": this._updateBirthdayUIFields,
				"change:birthdayFormatted": this._updateBirthday
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
					this.set("birthday",  birthday.format("YYYY-MM-DD"));
				}
			}
		},

		validate: function (attrs, options) {
			options = options || {};
			var errors = [];
			if (StringExtensions.isTrimmedEmpty(attrs.firstName)) {
				errors.push(ErrorConstants.Validation.EmptyFirstName);
			}

			if (StringExtensions.isTrimmedEmpty(attrs.secondName)) {
				errors.push(ErrorConstants.Validation.EmptySecondName);
			}

			if (typeof(options.birthdayRequired) === 'undefined' || options.birthdayRequired) {
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

			if (StringExtensions.isTrimmedEmpty(attrs.email)) {
				if (!options.patientUpdate) {
					errors.push(ErrorConstants.Validation.EmptyEMail);
				}
			} else if (!attrs.email.match(Constants.EmailPattern)) {
				errors.push(ErrorConstants.Validation.InvalidEMail);
			}

			if ((typeof(options.genderRequired) === 'undefined' || options.genderRequired) && !attrs.gender) {
				errors.push(ErrorConstants.Validation.EmptyGenderSelected);
			}

			if (!(attrs.role && (attrs.role.toUpperCase() === Constants.UserRole.SiteAdmin.toUpperCase())) && attrs.projectId && attrs.projectId.length === 0) {
				errors.push(ErrorConstants.Validation.NoProjectSelected);
			}

			if (options.passwordRequired) {
				if (StringExtensions.isEmpty(attrs.password)) {
					errors.push(ErrorConstants.Validation.EmptyPassword);
				}
				if (attrs.password !== attrs.passwordConfirmation) {
					errors.push(ErrorConstants.Validation.InvalidPasswordConfirmation);
				}
			}

			if (/*options.capchaRequired && */(attrs.recaptchaResponse !== null) && StringExtensions.isTrimmedEmpty(attrs.recaptchaResponse)) {
				errors.push(ErrorConstants.Validation.EmptyCaptcha);
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
					"dbId",
					"email",
					"firstName",
					"secondName",
					"creationDate",
					"status",
					"birthday",
					"gender",
					"uid",
					"role",
					"isAnalyst",
					"isSiteAdmin",
					"projectId",
					"project"
				);
			}

			return result;
		},

		configure: function (target) {
			switch (target) {
			case 'patient':
				this.syncCommands.update = ServerInteractionSerializersHash.AccountManager.modifyPatientInfo;
				break;
			case 'user':
				this.syncCommands.update = ServerInteractionSerializersHash.AccountManager.modifyUserInfo;
				break;
			case 'confirm':
				this.syncCommands.update = ServerInteractionSerializersHash.AccountManager.confirmPatientProfile;
				break;
			}
		},

		createUserConfigure: function (target) {
			switch (target) {
			case 'testUser':
				this.syncCommands.create = ServerInteractionSerializersHash.AccountManager.createUserWithTest;
				break;
			case 'createShared':
				this.syncCommands.create = ServerInteractionSerializersHash.AccountManager.createShareUser;
				break;
			case 'userCreation':
				this.syncCommands.create = ServerInteractionSerializersHash.AccountManager.createUserByAdmin;
				break;
			default:
				this.syncCommands.create = ServerInteractionSerializersHash.AccountManager.createUserCaptcha;
			}
		},

		fetch: function (options) {
			var that = this;
			var success = options.success;
			options.success = function (model, xhr, options) {
				that._checkUserRole();
				if (success) {
					success(model, xhr, options);
				}
			};
			//todo: rewrite this
			// Select read command
			if (this.has(this.idAttribute) && !options.getOwn) {
				if (options.analystMode) {
					this.syncCommands.read = ServerInteractionSerializersHash.AccountManager.getPatientInfoById;
					//this.syncCommands.update = ServerInteractionSerializersHash.AccountManager.modifyPatientInfo;
				} else {
					this.syncCommands.read = ServerInteractionSerializersHash.AccountManager.getUserInfoById;
					//this.syncCommands.update = ServerInteractionSerializersHash.AccountManager.modifyUserInfo;
				}

			} else {
				if (options.inviteId) {
					this.syncCommands.read = ServerInteractionSerializersHash.AccountManager.getPatientInfoByConfCode;
					//this.syncCommands.update = ServerInteractionSerializersHash.AccountManager.confirmPatientProfile;
				} else {
					this.syncCommands.read = ServerInteractionSerializersHash.AccountManager.getUserInfo;
					//this.syncCommands.update = ServerInteractionSerializersHash.AccountManager.modifyUserInfo;
				}
			}

			// Call base implementation
			Backbone.Model.prototype.fetch.call(this, options);
		},

		_checkUserRole: function () {
			// TODO: Support multiple roles?
			var that = this, roles = this.get("roles");
			_.each(this.get("roles"), function (role) {
				that.set('role', role.name.toLowerCase());
				if (role.name.toLowerCase() === Constants.UserRole.Analyst) {
					that.set('isAnalyst', true);
				}
				if (role.name.toLowerCase() === Constants.UserRole.SiteAdmin) {
					that.set('isSiteAdmin', true);
				}
			});

		}
	});

	// Extend instance with server command to get/update information only for current user
	ModelSyncExtension.extend(UserProfile.prototype, {
//		create: ServerInteractionSerializersHash.AccountManager.createUserCaptcha,
		update: ServerInteractionSerializersHash.AccountManager.modifyUserInfo,
		'delete': ServerInteractionSerializersHash.AccountManager.deleteUser
	});

	return UserProfile;
});