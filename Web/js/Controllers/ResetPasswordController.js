/*global define:true */
define([
	'jQuery',
	'underscore',
	'Controllers/Constants',
	'DataLayer/Constants',
	'Controllers/ControllerBase',
	'Models/Constants',
	'Models/ResetPasswordModel',
	'Views/Constants',
	'Views/ResetPasswordView',
	'Views/ResetPasswordSuccessView',
	'Views/ResetPasswordTokenView',
	'formatter'
], function ($, _, Constants, DataConstants, ControllerBase, ModelsConstants, ResetPasswordModel, ViewsConstants, ResetPasswordView, ResetPasswordSuccessView, ResetPasswordTokenView) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
			this._checkAttribute("accountManager");
		},

		parseParams: function (params) {
			var result = {};
			if (params.length > 0) {
				result.email = params[0];
				result.token = params[1];
			}
			return result;
		},

		activate: function (params) {
			var accountManager = this.get("accountManager"),
				options = {
					email: params.email,
					accountManager: accountManager
				};

			if (params.token) {
				options.email = $.base64.decode(params.email);
				options.token = $.base64.decode(params.token);
				options.finishStep = true;
			}

			this.models = {
				reset: new ResetPasswordModel(options)
			};

			if (params.token) {
				this.view = new ResetPasswordTokenView({model: this.models});
			} else {
				this.view = new ResetPasswordView({ model: this.models });
			}

			// Start listening control events
			this.listenTo(accountManager, {
				"password-reset": function (email) {
					this.email = email;
					this._showSuccessView(options.finishStep);
				}
			});

			// Initialize menu
			var applicationView = this.get("applicationView");
			applicationView.header.showMenu(ViewsConstants.HeaderMenu.Authorization);

			// Show view
			applicationView.showView(this.view);
		},

		deactivate: function () {
			this._reset();
		},

		_showSuccessView: function (finishStep) {
			this._reset();

			this.view = new ResetPasswordSuccessView({ model: { email: this.email, finishStep: finishStep } });

			this.listenTo(this.view, {
				"navigate-by-link": this._onNavigateByLink
			});

			// Show view
			var applicationView = this.get("applicationView");
			applicationView.showView(this.view);
		},

		_onNavigateByLink: function () {
			this.trigger("password-reset", this.email);
		}
	});

});

