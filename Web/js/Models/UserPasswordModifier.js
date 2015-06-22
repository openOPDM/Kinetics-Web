define([
	'backbone',
	'Models/ErrorConstants',
	'DataLayer/ServerCommandExecutor',
	'DataLayer/ServerInteractionSerializersHash',
	'Utils/StringExtensions'
], function (Backbone, ErrorConstants, ServerCommandExecutor, ServerInteractionSerializersHash, StringExtensions) {
	'use strict';

	var UserPasswordModifier = Backbone.Model.extend({
		defaults: {
			accountManager: null,
			passwordOld: null,
			passwordNew: null,
			passwordConfirmation: null
		},

		initialize: function () {
			if (this.has("accountManager")) {
				throw new Error("An 'accountManager' not set.");
			}
		},

		validate: function (attrs) {
			var errors = [];

			if (attrs.passwordOld || attrs.passwordNew || attrs.passwordConfirmation) {
				if (attrs.passwordOld || attrs.passwordNew) {
					if (StringExtensions.isEmpty(attrs.passwordOld)) {
						errors.push(ErrorConstants.Validation.EmptyOldPassword);
					}
					if (StringExtensions.isEmpty(attrs.passwordNew)) {
						errors.push(ErrorConstants.Validation.EmptyNewPassword);
					}
				}
				if (attrs.passwordNew != attrs.passwordConfirmation) {
					errors.push(ErrorConstants.Validation.InvalidPasswordConfirmation);
				}
			}

			if (errors.length > 0) return errors;
		},

		fieldsFilledAndValid: function () {
			var passwordOld = this.get("passwordOld");
			var passwordNew = this.get("passwordNew");
			var passwordConfirmation = this.get("passwordConfirmation");
			return passwordOld && passwordNew && passwordConfirmation && this.isValid();
		},

		// Change the password of current user
		changePassword: function (options) {
			if (this.fieldsFilledAndValid()) {
				var that = this;
				var success = options.success;

				options.success = function (model, resp, options) {
					that.trigger("success");
					that._resetFields();
					if (success) success(model, resp, options);
				};

				var error = options.error;
				options.error = function (model, xhr, options) {
					that.trigger("error", options.responseError);
					that._resetFields();
					if (error) error(model, xhr, options);
				};

				var passwordOld = this.get("passwordOld");
				var passwordNew = this.get("passwordNew");
				options.passHash = passwordOld;
				options.newPassHash = passwordNew;

				ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.modifyPassword, options);
			}
		},

		_resetFields: function () {
			this.set("passwordOld", "");
			this.set("passwordNew", "");
			this.set("passwordConfirmation", "");

			this.trigger("resetFields");
		}
	});

	return UserPasswordModifier;
});
