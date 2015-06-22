define([
	'jQuery',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Models/Constants',
	'Models/ConfirmModel',
	'Models/CountdownTimer',
	'Views/Constants',
	'Views/ConfirmView',
	'Views/ConfirmSuccessView',
	'formatter',
	'jQuery.base64'
], function ($, Constants, ControllerBase, ModelsConstants, ConfirmModel, CountdownTimer, ViewsConstants, ConfirmView, ConfirmSuccessView) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
			this._checkAttribute("accountManager");
		},

		parseParams: function (params) {
			var result = {};
			try {
				if (params.length > 0) {
					result.email = $.base64.decode(params[0]);
				}

				if (params.length > 1) {
					result.code = $.base64.decode(params[1]);
				}

				if (params.length > 2) {
					result.sharingToken = $.base64.decode(params[2]);
				}
			}
			catch (e) {
			}

			return result;
		},

		activate: function (params) {
			this.sharingToken = params.sharingToken;

			if (!params.email) {
				this.trigger("invalid-parameters");
				return;
			}

			var accountManager = this.get("accountManager");
			this.model = new ConfirmModel({
				confirmationCode: params.code,
				email: params.email,
				accountManager: accountManager,
				project: params.project,
				token: this.sharingToken
			});

			this.view = new ConfirmView({ model: this.model });

			// Start listening control events
			this.listenTo(accountManager, {
				"email-confirmed": function (email, token) {
					this.email = email;
					this._showSuccessView();
				}
			});

			// Initialize menu
			var applicationView = this.get("applicationView");
			applicationView.header.showMenu(ViewsConstants.HeaderMenu.Authorization);

			// Show view
			applicationView.showView(this.view);

			// If code specified in parameters and is valid then perform confirmation
			if (this.model.isReadyToConfirm()) {
				this.model.confirm();
			}
		},

		deactivate: function () {
			this._reset();
		},

		_showSuccessView: function () {
			this._reset();

			this.model = new CountdownTimer({ remainedSeconds: Constants.RedirectTimeout });
			this.view = new ConfirmSuccessView({ model: this.model });

			this.listenTo(this.model, "complete", this._timeoutComplete);

			// Show view
			var applicationView = this.get("applicationView");
			applicationView.showView(this.view);

			this.model.start();
		},

		_timeoutComplete: function () {
			this.trigger("email-confirmed", this.email, this.sharingToken);
		}
	});

});

