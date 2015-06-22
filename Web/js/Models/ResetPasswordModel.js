/*global define: true */
define([
	'backbone',
	'underscore',
	'Models/Constants',
	'Models/ErrorConstants'
], function (Backbone, _, Constants, ErrorConstants) {
	'use strict';

	var isTrimmedEmpty = function (value) {
		return !_.isString(value) || (_.isString(value) && $.trim(value).length === 0);
	};

	return Backbone.Model.extend({
		defaults: {
			email: null,
			project: null,
			accountManager: null,
            finishStep:null,
            token:null
		},

		initialize: function () {
			var accountManager = this.get("accountManager");
			if (!accountManager) {
				throw new Error("Attribute 'accountManager' not set.");
			}

			// Retransmits events
			this.listenTo(accountManager, {
				"error:reset-password": function (errorObject) {
					this.trigger("error:reset-password", errorObject);
				}
			});
		},

		dispose: function () {
			this.stopListening();
		},

		validate: function (attrs) {
            if (attrs.token) {
                if (!attrs.password) {
                    return ErrorConstants.Validation.EmptyPassword;
                } else {
                    if (attrs.password != attrs.re_password){
                        return ErrorConstants.Validation.InvalidPasswordConfirmation
                    }
                }
            } else {
                if (isTrimmedEmpty(attrs.email)) {
                    return ErrorConstants.Validation.EmptyEMail;
                } else if (!attrs.email.match(Constants.EmailPattern)) {
                    return ErrorConstants.Validation.InvalidEMail;
                }
            }

		},

		validateModel: function (options) {
			var error = this.validate(this.attributes);
			options = options || {};
			if (error && !options.silent) {
				this.trigger('invalid', this, error, {});
			}
			return !error;
		},

		isReadyToConfirm: function () {
			return this.validateModel({ silent: true });
		},

		resetPassword: function () {
			var accountManager = this.get("accountManager");
			accountManager.resetPassword(this.get("email"));
		},

        setPassword:function(){
            this.get('accountManager').setPassword({
                password:this.get('password'),
                token:this.get('token'),
                email:this.get('email')
            });
        }
	});

});
