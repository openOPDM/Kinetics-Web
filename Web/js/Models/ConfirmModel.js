define([
	'backbone',
	'Models/Constants',
	'Models/ErrorConstants'
], function (Backbone, Constants, ErrorConstants) {
	'use strict';

	var isTrimmedEmpty = function (value) {
		return !_.isString(value) || (_.isString(value) && $.trim(value).length == 0);
	};

	return Backbone.Model.extend({
		defaults: {
			email: null,
			confirmationCode: null,
			confirmBy: null,
			accountManager: null,
			project: null
		},

		initialize: function () {
			var accountManager = this.get("accountManager");
			if (!accountManager) {
				throw new Error("Attribute 'accountManager' not set.");
			}

			// Retransmits events
			this.listenTo(accountManager, {
				"error:resend-confirmation": function (errorObject) {
					this.trigger("error:resend-confirmation", errorObject);
				},
				"error:confirm": function (errorObject) {
					this.trigger("error:confirm", errorObject);
				}
			});
		},

		dispose: function () {
			this.stopListening();
		},

		validate: function (attrs) {
			if (isTrimmedEmpty(attrs.confirmationCode)) {
				return ErrorConstants.Validation.EmptyConfirmationCode;
			}
		},

		validateModel: function (options) {
			var error = this.validate(this.attributes);
			options = options || {};
			if (error && !options.silent) {
				this.trigger('invalid', this, error, {});
			}
			return error == null;
		},

		isReadyToConfirm: function () {
			return this.validateModel({ silent: true });
		},

		confirm: function () {
			if (this.validateModel()) {
				var accountManager = this.get("accountManager");

				// NOTE: This is stub for testing confirmation success screen
				accountManager.confirm(this.get("email"), this.get("confirmationCode"), this.get('token'));
			}
		},

		resendConfirmation: function () {
			var accountManager = this.get("accountManager");
			accountManager.resendConfirmation(this.get("email"), this.get('token'));
		}
	});
});
