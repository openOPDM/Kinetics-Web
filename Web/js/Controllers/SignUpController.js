/*global define:true */
define([
	'underscore',
	'backbone',
	'Controllers/Constants',
	'DataLayer/Constants',
	'DataLayer/ErrorConstants',
	'Models/Constants',
	'Controllers/ControllerBase',
	'Models/UserProfile',
	'Views/Constants',
	'Views/SignUpView',
	'Models/ProjectCollection',
	'formatter'
], function (_, Backbone, Constants, DataConstants, ErrorConstants, ModelConstants, ControllerBase, UserProfile, ViewsConstants, SignUpView, ProjectCollection) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
			this._checkAttribute("accountManager");

			_.bindAll(this, "_fetchData");
		},

		_fetchData: function () {
			var options = this._getFetchOptions(true, this._onProjectsFetched, this._fetchData, this);
			this.models.projects.fetch(options);
		},

		_onProjectsFetched: function () {
			if (this._siteAdminMode) {
				this.models.projects = this.models.projects.models;
			} else {
				this.models.projects = this.models.projects.where({status: ModelConstants.ProjectStatus.Active});
			}

			this.models.projects = _.sortBy(this.models.projects, function (project) {
				return project.get("name");
			}, this);


			this.view = new SignUpView({model: this.models});
			this.listenTo(this.view, {
				"sign-up": this._onSignUp,
				"cancel-creation": this._onCancelCreation
			});
			this.get("applicationView").showView(this.view);
			if (this.models.mode === 'sign-up') {
				this.view.showCaptcha();
			}

		},

		parseParams: function (params) {
			var result = {};
			switch (params.length) {
			case 1:
				if (/sign-up/.test(Backbone.history.fragment)) {
					result.token = params[0];
				} else {
					result.invite = params[0];
				}
				break;
			case 3:
				try {
					result.shared = {
						email: $.base64.decode(params[0]),
						userId: $.base64.decode(params[1]),
						project: $.base64.decode(params[2])
					};
				} catch (e) {
					this.trigger('invalid-share-params');
				}
				break;
			}
			return result;
		},

		activate: function (params) {
			var accountManager = this.get('accountManager'),
				currentUser = accountManager.currentUser();
			if (currentUser) {
				this._siteAdminMode = currentUser.get("isSiteAdmin");
			} else {
				this._siteAdminMode = false;
			}

			this.sharingToken = params.token;
			this._shared = params.shared;
			this._project = params.project;

			switch (true) {
			case !!params.invite:
				try {
					this.inviteEmail = $.base64.decode(params.invite.split('/')[0]);
					this.inviteId = $.base64.decode(params.invite.split('/')[1]);
				} catch (e) {
					console.log('ERROR: invalid code:' + params.invite);
				}

				this.model = new UserProfile();
				var options = this._getFetchOptions(true, this._onUserInfoFetched, this._fetchUserProfile, this);
				options.inviteId = this.inviteId;
				options.inviteEmail = this.inviteEmail;
				this.model.fetch(options);
				break;
			case !!params.shared:
				this.model = new UserProfile();
				this.model.set('email', params.shared.email);
				this.model.set('projectId', [params.shared.project]);

				this.model.set('email', params.shared.email);

				this.view = new SignUpView({
					model: {
						profile: this.model,
						mode: 'shared'
					},
					shared: this.shared
				});
				this.get("applicationView").showView(this.view);
				this.listenTo(this.view, {
					"sign-up": this._onSignUp,
					"cancel-creation": this._onCancelCreation
				});
				break;
			case this._siteAdminMode:
				this.models = {
					profile: new UserProfile(),
					projects: new ProjectCollection(),
					mode: 'sa-create-user',
					roles: {}
				};
				this._fetchData();
				break;
			default:
				this.models = {
					profile: new UserProfile(),
					projects: new ProjectCollection(),
					mode: 'sign-up'
				};
				this._fetchData();
			}

			this.listenTo(accountManager, {
				"authenticated": this._onAuthenticated
			});
		},

		_onAuthenticated: function () {
			if (!!this._shared) {
				this.trigger('shared-login', this._shared);
			} else {
				this.trigger('shared-fail');
			}
		},

		_fetchUserProfile: function () {
			var options = this._getFetchOptions(true, this._onUserInfoFetched, this._fetchUserProfile, this);
			this.model.fetch(options);
		},

		_onUserInfoFetched: function () {
			this.view = new SignUpView({ model: {
				profile: this.model,
				mode: 'invite'
			} });
			this.get("applicationView").showView(this.view);
			// Start listening control events
			this.listenTo(this.view, {
				"sign-up": this._onSignUp
			});
		},

		// Initialize menu
		initializeMenu: function () {
			if (this._siteAdminMode) {
				this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.SiteAdmin);
			} else {
				this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.Authorization);
			}

		},

		deactivate: function () {
			this._reset();
		},

		_onCancelCreation: function () {
			this.trigger('cancel-creation', this._project);
		},

		_onSignUp: function (model) {
			var that = this;
			model.configure(!!that.inviteId ? 'confirm' : 'user');

			if (localStorage && localStorage.getItem('kinetics-TestResults')) {
				model.set('testSessionResults', JSON.parse(localStorage.getItem('kinetics-TestResults')));
				model.createUserConfigure('testUser');
			} else {
				model.createUserConfigure(null);
			}

			if (this._siteAdminMode) {
				model.createUserConfigure('userCreation');
			}



			var options = {
				confirmationCode: this.inviteId,
				birthdayRequired: true,
				genderRequired: true,
				accountManager: this.get("accountManager"),
				wait: true,
				token: this.sharingToken,
				error: function (model, xhr, options) {
					if (ErrorConstants.ServerErrorsCodes.CannotAccessSharedData === options.responseError.code) {
						that.get("accountManager").signIn(model.get('email'), model.get('password'), model.get('projectId')[0]);
						that._shared = null;
					} else {
						model.trigger("error", options.responseError);
					}

				},
				success: function (/*model*/) {
					if (localStorage && localStorage.getItem("kinetics-TestResults")) {
						localStorage.removeItem("kinetics-TestResults");
					}
					if (that._shared) {
						that.get("accountManager").signIn(model.get('email'), model.get('password'), model.get('projectId')[0]);
					} else {
						that.trigger("sign-up-success", model.get("email"), !!that.inviteId, model.get("projectId"), that._siteAdminMode, that._project, that.sharingToken);
					}
				}
			};

			if (!!this._shared) {
				model.createUserConfigure('createShared');
				options.user = this._shared.userId;
			}

			if (!this.inviteId) {
				options.birthdayRequired = false;
				options.genderRequired = false;
			}

			model.save({}, options);
		}
	});

});
