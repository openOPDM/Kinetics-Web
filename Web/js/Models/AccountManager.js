/*global define:true */
define([
	'underscore',
	'backbone',
	'DataLayer/Constants',
	'DataLayer/ErrorConstants',
	'DataLayer/ServerCommandExecutor',
	'DataLayer/ModelSyncExtension',
	'DataLayer/ServerInteractionSerializersHash',
	'Models/Constants',
	'Models/AccountData',
	'Models/UserProfile',
	'Utils/SimpleRequest',
	'Utils/ConsoleStub'
], function (_, Backbone, DataConstants, ErrorConstants, ServerCommandExecutor, ModelSyncExtension, ServerInteractionSerializersHash, Constants, AccountData, UserProfile, SimpleRequest) {
	'use strict';

	return Backbone.Model.extend({
		defaults: {
			currentUser: null
		},

		_accountData: null,

		viewedUser: null,

		initialize: function () {
			_.bind(this._initializeCurrentUser, this);

			this.on("change: currentUser", function (model, currentUser) {
				var previous = this.previous("currentUser");
				if (previous) {
					this.stopListening(previous);
					previous.off();
				}

				if (currentUser) {
					this.listenTo(currentUser, "change", this._saveCurrentUserLocally);
				}
			});

			if (this.isUserSignedIn()) {
				this._getRoles();
			}

			this._previousRole = null;
		},

		_getRoles: function () {
			//todo: check permission before

			SimpleRequest({
				target: 'AccountManager',
				method: 'getRoleList',
				options: {
					sessionToken: this.getSessionToken()
				},
				success: function (data) {
					if (data && data.role) {
						_.each(data.role, function (e) {
							Constants.UserRoleId[e.name] = e.id;
						});
					}
				}
			});
		},

		// Initialize ane return current user
		currentUser: function () {
			this.accountData(); //wtf????
			return this.get("currentUser");
		},

		// Get account data
		accountData: function () {
			if (!this._accountData) {
				this._accountData = new AccountData();
				this._accountData.fetch();

				// Get user information from local cache
				if (this._accountData.has("sessionToken")) {
					var currentUser = new UserProfile(),
						that = this;

					currentUser.fetch({ local: true, localId: Constants.CurrentUserIdMarker});
					this.set("currentUser", currentUser);
					if (currentUser.get('project').length) {
						setTimeout(function () { //fixme, SITE_admin bug
							that.trigger('project-selected', currentUser.get('project'), currentUser.get('projectId'));
						}, 100);
					}
				}
			}
			return this._accountData;
		},

		isUserSignedIn: function () {
			return this.accountData().has("sessionToken");
		},

		getSessionToken: function () {
			var sessionToken = this.accountData().get("sessionToken");
			if (!sessionToken) {
				this.trigger('sign-out');
				//throw new Error("User not signed in.");
			}
			return sessionToken;
		},

		_initializeCurrentUser: function (sessionToken, success, error, project) {
			// Create current user model
			var currentUser = new UserProfile();

			// Fetch user info from server
			var that = this;
			var options = {
				accountManager: this,
				error: function (model, xhr, options) {
					error(options.responseError);
				},
				success: function (model/*, xhr, options*/) {
					currentUser.set({projectId: project});
					that._saveCurrentUserLocally(currentUser);
					that.set("currentUser", currentUser);
					if (currentUser.get('project').length) {
						that.trigger('project-selected', currentUser.get('project'), currentUser.get('projectId'));
					}
					success(model);
				}
			};
			currentUser.fetch(options);
			this._getRoles();
		},

		_saveCurrentUserLocally: function (currentUser) {
			currentUser = currentUser || this.currentUser();

			currentUser.configure('user');
			currentUser.save({}, {
				validate: false,
				local: true,
				localId: Constants.CurrentUserIdMarker
			});
		},

		signIn: function (email, password, project) {
			var that = this;

			var error = function (model, xhr, options) {

				that.trigger("error error:sign-in", options.responseError, options);
			};

			var success = function (model, sessionToken) {
				that._storeCredentials(email, password, sessionToken, project);

				var successInitUser = function (user) {
					console.log("Sign in SUCCESS. Session token {0}".format(sessionToken));
					that.trigger("authenticated", user);
				};

				that._initializeCurrentUser(sessionToken, successInitUser, error, project);
			};

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.login, {
				email: email,
				password: password,
				project: project,
				success: success,
				error: error
			});


		},

		authenticate: function (email, password, login) {
			var that = this,
				error = function (model, xhr, options) {
					if (_.indexOf([801, 702, 805], options.responseError.code) >= 0) {
						options.responseError.description = ErrorConstants.genericErrors.invalidCredentials;
					}
					that.trigger("error error:sign-in", options.responseError, options);
				},
				success = function (model, xhr, options) {
					login(options.email, options.password, xhr);
				};

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.authenticate, {
				email: email,
				password: password,
				success: success,
				error: error
			});
		},

		_storeCredentials: function (email, password, sessionToken, project) {
			// Store user credentials in local storage
			this.accountData().save({
				email: email,
				sessionToken: sessionToken,
				project: project
			});
		},

		resetCredentials: function () {
			this.accountData().set({
				email: null,
				sessionToken: null
			});

			// Remove user credentials from local storage
			this.accountData().destroy();

			/**
			 * Need this to distinguish later whether to show not-found page or home page
			 * if user with another role logged in after session timeout
			 */
			this._previousRole = this.currentUser().get("role");

			// Remove reference to currently signed in user
			this.unset("currentUser");

		},

		signOut: function () {
			var that = this;

			var success = function () {
				that.resetCredentials();

				console.log("Sign out SUCCESS.");
				that.trigger("sign-out");
			};

			var error = function (model, xhr, options) {
				that.resetCredentials();

				if (ErrorConstants.GetServerError(options.responseError.code)) {
					success();
				} else {
					console.log("Sign out FAILED. Error code {0}. {1}".format(
						options.responseError.code,
						options.responseError.description
					));
					that.trigger("sign-out");
				}
			};

			var sessionToken = that.getSessionToken();
			if (sessionToken) {
				ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.logout, {
					sessionToken: sessionToken,
					success: success,
					error: error
				});
			} else {
				success();
			}
		},

		confirm: function (email, confirmationCode, token) {
			var that = this;

			var error = function (model, xhr, options) {
				that.trigger("error error:confirm", options.responseError);
			};

			var success = function () {
				that.trigger("email-confirmed", email, token);
			};

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.confirmCreate, {
				email: email,
				confirmationCode: confirmationCode,
				success: success,
				error: error
			});
		},

		resendConfirmation: function (email, token) {
			var that = this;

			var error = function (model, xhr, options) {
				that.trigger("error error:resend-confirmation", options.responseError);
			};

			var success = function () {
				that.trigger("confirmation-email-resent", email, token);
			};

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.resendConfirmation, {
				email: email,
				token: token,
				success: success,
				error: error
			});
		},

		resetPassword: function (email) {
			var that = this;

			var error = function (model, xhr, options) {
				that.trigger("error error:reset-password", options.responseError);
			};

			var success = function () {
				that.trigger("password-reset", email);
			};

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.resetPassword, {
				email: email,
				success: success,
				error: error
			});
		},

		setPassword: function (options) {
			var that = this;

			options.error = function (model, xhr, options) {
				that.trigger("error error:reset-password", options.responseError);
			};
			options.success = function () {
				that.trigger("password-reset", null);
//                    that.signIn(options.email, options.password, 6, false); //todo: auto sign-in
			};

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.setPassword, options);
		},

		switchProject: function (options) {
			var that = this,
				id = options.id,
				currentUser = this.get("currentUser");

			options.accountManager = this;

			options.error = function (model, xhr, options) {
				that.trigger("error error:update-current-project", options.responseError);
			};

			options.success = function () {
				currentUser.set({projectId: id});
				that._saveCurrentUserLocally(currentUser);
				that.set("currentUser", currentUser);
				that.trigger('project-changed-success', currentUser.get('project'), currentUser.get('projectId'));
			};
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.ProjectManager.switchProject, options);
		}
	});
});
