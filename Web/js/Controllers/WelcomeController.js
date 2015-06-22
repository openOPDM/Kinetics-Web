/*global define: true */
define([
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'DataLayer/Constants',
	'DataLayer/ErrorConstants',
	'Views/Constants',
	'Views/WelcomeView',
	'formatter'
], function (_, Constants, ControllerBase, DataConstants, ErrorConstants, ViewsConstants, WelcomeView) {
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
				result.backToLocation = params[0];
				if (/^shared-test\//.test(params[0])) {
					result.shareToken = params[0].split('/')[1];
				}
			}
			return result;
		},

		_onAuthenticate: function (email, password) {
			var accountManager = this.get("accountManager"),
				that = this;

			accountManager.authenticate(email, password, function (email, password, projects) {
				if (projects) {
					if (projects.length === 1) {
						accountManager.signIn(email, password, projects[0].id);
					} else {
						that.view.trigger('projectSelection', projects);
					}
				} else {
					accountManager.signIn(email, password);
				}
			});

		},

		_onProjectSelected: function (email, password, project) {
			this.get("accountManager").signIn(email, password, project);
		},

		activate: function (params) {
			this.backToLocation = params.backToLocation;

			this.shareToken = params.shareToken;

			var accountManager = this.get("accountManager");
			this._email = params.email;

			if (accountManager.isUserSignedIn()) {
				this.trigger("user-already-sign-in");
				return;
			}

			this.view = new WelcomeView({ model: {
				accountManager: accountManager,
				email: this._email
			}});

			// Start listening control events
			this.listenTo(accountManager, {
				"error": this._onError,
				"authenticated": this._onAuthenticated
			});

			this.listenTo(this.view, {
				"sign-up": this._onSignUp,
				"forgot-password": this._onForgotPassword,
				"authenticate": this._onAuthenticate,
				"projectSelected": this._onProjectSelected
			});

			// Initialize menu
			var applicationView = this.get("applicationView");
			applicationView.header.showMenu(ViewsConstants.HeaderMenu.Welcome);

			// Show view
			applicationView.showView(this.view);

		},

		deactivate: function () {
			this._reset();
		},

		_reset: function () {
			ControllerBase.prototype._reset.call(this);
			delete this.backToLocation;
		},

		_onAuthenticated: function () {
			var accountManager = this.get("accountManager"),
				back;
			back = accountManager._previousRole === accountManager.currentUser().get("role") ?
				this.backToLocation : null;
			// Retransmits event
			this.trigger("authenticated", { back: back });
		},

		_onSignUp: function () {
			// Retransmits event
			this.trigger("sign-up", this.shareToken);
		},

		_onForgotPassword: function (email) {
			// Retransmits event
			this.trigger("forgot-password", email);
		},

		_onError: function (error, options) {
			if (+error.code === +ErrorConstants.ServerErrorsCodes.UserIsNotActivated) {
				this.trigger("user-is-not-activated", options.email);
			}
		}
	});
});
