/*global define:true, alert: true */
define([
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Views/Constants',
	'Models/Constants',
	'Views/ProfileView',
	'Views/PatientProfileView',
	'Views/PatientProfileWaitingView',
	'Models/UserProfile',
	'Models/UserPasswordModifier',
	'Models/UserProjectModifier',
	'Models/ProjectCollection',
	'Models/Sharing',
	'Utils/SimpleRequest',
	'DataLayer/ErrorConstants',
	'Utils/Dialog',
	'text!Templates/UserNotAccessible.html',
	'formatter'
], function (_, Constants, ControllerBase, ViewsConstants, ModelsConstants, ProfileView, PatientProfileView, PatientProfileWaitingView, UserProfile, UserPasswordModifier, UserProjectModifier, ProjectCollection, SharePopup, SimpleRequest, ErrorConstants, Dialog, UserNotAccessible) {
	'use strict';

	return ControllerBase.extend({
		// Synchronization flag that join simultaneously executed requests
		// 'save' and 'change password' in the method '_onSuccess'.
		_analystMode: false,
		projectsList: [],

		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);

			this._checkAttribute("accountManager");
			this._checkAttribute("homePage");
			this._checkAnalystMode();
			this.models = {};
			this.dialog = new Dialog();
			this._activeSection = null;
		},

		_checkAnalystMode: function () {
			this._analystMode = this.get('accountManager').isUserSignedIn() && this.get('accountManager').currentUser().get("isAnalyst");
		},

		parseParams: function (params) {
			var result = {};
			if (params.length === 2 && params[0] === Constants.ActionMarker) {
				result.action = params[1];
			}
			if (params.length === 1) {
				result.userId = params[0];
			}
			return result;
		},

		activate: function (params) {
			this.userId = params.userId;
			this.get('accountManager').trigger('viewed-user-updated', this.userId);

			if (!this._initializeModel()) {
				return;
			}
			this._sharing = params.sharing || null;
			if (!this.userId) {
				this._fetchProjects();
			}
		},

		_fetchProjects: function () {
			var options = this._getFetchOptions(true, this._onProjectsFetched, this._fetchProjects, this);
			this.models.project.fetch(options);
		},

		_onProjectsFetched: function () {
			var that = this;
			this.sharePopup = new SharePopup();
			this.sharePopup.getAll({
				accountManager: this.get("accountManager"),
				sessionToken: this.get("accountManager").getSessionToken(),
				success: function (model, data, options) {
					that.models.shares = data;
					that._initializeView();
				}
			});
		},

		_initializeModel: function () {
			this._checkAnalystMode();
			if (this.userId) {
				this.models = {
					userProfile: new UserProfile({ id: this.userId, analystMode: this._analystMode }),
					homePageTitle: this.get("homePage").title
				};

				var options = this._getFetchOptions(true, this._onOneUserInfoFetched, this._fetchOneUserProfile, this),
					that = this;
				options.analystMode = this._analystMode;

				options.error = function (model, xhr, options) {
					if (options.responseError.code === ErrorConstants.ServerErrorsCodes.NoPermission) {
						that.trigger('invalid-parameters');
						that.get('accountManager').viewedUser = null;
					}
					if (options.responseError.code === ErrorConstants.ServerErrorsCodes.UserDoesNotExist) {
						var dropDownEntry = $('.username-text .id-username').find('option[value="' + that.get('accountManager').viewedUser + '"]');
						if (dropDownEntry.length) {
							var dialog = $('#userNotAccessible');
							dialog = dialog.length ? dialog : $('<div id="userNotAccessible"></div>');
							dialog.html(_.template(UserNotAccessible)({username: dropDownEntry.text()})).dialog({modal: true});
							setTimeout(function () {
								dialog.dialog('destroy');
								that.trigger('invalid-parameters');
								that.get('accountManager').viewedUser = null;
							}, 3000);

						} else {
							that.trigger('invalid-parameters');
							that.get('accountManager').viewedUser = null;
						}
					}
				};

				this.models.userProfile.fetch(options);

			} else {
				var userProfile = this.get("accountManager").get("currentUser");
				if (!userProfile || !(userProfile instanceof UserProfile)) {
					this.trigger("invalid-parameters");
					return false;
				}
				this.models = {
					userProfile: userProfile,
					project: new ProjectCollection(),
					passwordModifier: new UserPasswordModifier(),
					projectModifier: new UserProjectModifier(),
					homePageTitle: this.get("homePage").title
				};
			}
			return true;
		},

		_fetchUserProfile: function () {
			var options = this._getFetchOptions(true, this._onUserInfoFetched, this._fetchUserProfile, this);
			this.models.userProfile.fetch(options);
		},

		_onUserInfoFetched: function () {
			//this._initializeView();
		},

		_fetchOneUserProfile: function () {
			var options = this._getFetchOptions(true, this._onOneUserInfoFetched, this._fetchOneUserProfile, this);
			this.models.userProfile.fetch(options);
		},

		_onOneUserInfoFetched: function () {
			this._initializeView();
		},

		_initializeView: function () {
			var that = this;
			if (this.userId) {
				if (this.models.userProfile.get("status") === ModelsConstants.UserStatus.Waiting) {
					this.view = new PatientProfileWaitingView({
						model: this.models
					});
					this.listenTo(this.view, {
						"save": this._onSaveProfile,
						"cancel": this._onCancel,
						"resend": this._onResend
					});
				} else {
					this.view = new PatientProfileView({
						model: this.models
					});
				}
			} else {
				this.view = new ProfileView({
					model: this.models,
					sharing: this._sharing,
					activeSection: this._activeSection
				});

				// Start listening control events
				this.listenTo(this.view, {
					"saveProfile": this._onSaveProfile,
					"savePassword": this._onSavePassword,
					"saveProject": this._onSaveProject,
					"cancel": this._onCancel,
					"destroy": this._onDestroy,
					'unshare': this._unshare,
					'unshare-test': this._unshareTest,
					'leave-share': this._leaveShare,
					'share-all': this._shareAll,
					'share-test': this._shareTest,
					"subsection-changed": this._updateActiveSection
				});

			}

			this.listenTo(this.get("accountManager"), {
				"viewed-patient-changed": function (id) {
					this.trigger('change-patient', id);
				},
				"project-changed": function (id) {
					console.log('__CONROLLER', id);
				},
				'updated-shares': function () {
					this.sharePopup.getAll({
						accountManager: that.get("accountManager"),
						sessionToken: that.get("accountManager").getSessionToken(),
						success: function (model, data, options) {
							that.models.shares = data;
							that.view.trigger('updated-shares');
						}
					});
				}
			});


			// Show view
			this.get("applicationView").showView(this.view);
		},

		// Initialize menu
		initializeMenu: function () {
			this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.Default, "profile");
		},

		deactivate: function () {
			this._reset();
		},

		_onSaveProfile: function (model, attributes, patientUpdate) {
			this._save(model, attributes, patientUpdate);
		},

		_onSavePassword: function (model, attributes) {
			if (this.models.passwordModifier && this.models.passwordModifier.fieldsFilledAndValid()) {
				this._changePassword();
			}
		},

		_unshare: function (email) {
			var that = this;
			this.sharePopup.unshare({
				email: email,
				accountManager: this.get("accountManager"),
				success: function () {
					that.models.userProfile.trigger('unshared', email);
				}
			});
		},

		_unshareTest: function (id) {
			var that = this;
			this.sharePopup.dropToken({
				id: id,
				accountManager: this.get("accountManager"),
				success: function () {
					that.models.userProfile.trigger('unshared-test', id);
				}
			});
		},

		_leaveShare: function (id, project) {
			var that = this;
			this.sharePopup.leaveShare({
				user: id,
				project: project,
				accountManager: this.get("accountManager"),
				success: function () {
					that.models.userProfile.trigger('left-shared', id, project);
				}
			});
		},

		_shareAll: function () {
			this.trigger('share-all');
		},

		_shareTest: function (token) {
			this.trigger('share-test', token);
		},

		_onSaveProject: function (model, attributes) {
			this.projectsList = attributes;
			this._changeProjects(model);
		},

		_save: function (model, attributes, patientUpdate) {
			var that = this;
			model.configure(patientUpdate ? 'patient' : 'user');
			model.save(attributes, {
				validate: true,
				accountManager: this.get("accountManager"),
				errorOther: function (models, xhr, options) {
					that.trigger("error", options.responseError);
				},
				errorUnauthenticated: function () {
					that._sleep(_.bind(that._onSaveProfile, that, model, attributes));
				},
				success: function () {
					that._onSuccess();
				},
				patientUpdate: patientUpdate
			});
		},

		_changePassword: function () {
			var that = this;
			this.models.passwordModifier.changePassword({
				accountManager: this.get("accountManager"),
				errorOther: function (models, xhr, options) {
					that.trigger("error", options.responseError);
				},
				errorUnauthenticated: function () {
					that._sleep(_.bind(that._onSavePassword, that));
					//todo: check me via remove token
				},
				success: function () {
					that._onSuccess();
				}
			});
		},

		_changeProjects: function (model) {
			var that = this;
			this.models.projectModifier.changeProject({
				accountManager: this.get("accountManager"),
				ids: that.projectsList,
				errorOther: function (models, xhr, options) {
					that.trigger("error", options.responseError);
				},
				errorUnauthenticated: function () {
					that._sleep(_.bind(that._onSaveProfile, that, model));
					//todo: check me via remove token
				},
				success: function () {
                    that._onSuccess();
					that.get('accountManager').trigger('project-selected');
				}
			});
		},

		_onSuccess: function () {
            this.get('accountManager')._saveCurrentUserLocally();
			this.trigger("save");
		},

		_onCancel: function () {
			this.trigger("cancel");
		},
		_onResend: function () {
			var that = this, email = this.models.userProfile.get("email");
			console.log('resend', email);
			if (!email) {
				return;
			}
			SimpleRequest({
				target: 'AccountManager',
				method: 'sendPatientInvite',
				options: {
					email: email,
					sessionToken: this.get("accountManager").getSessionToken()
				},
				model: this.models.userProfile,
				success: function (data) {
					that.dialog.show('alert', 'Invitation email was sent');
				}
			});
		},

		_onDestroy: function () {
			var that = this;
			this.models.userProfile.destroy({
				wait: true,
				accountManager: this.get("accountManager"),
				errorOther: function (models, xhr, options) {
					if (options.responseError.code === ErrorConstants.ServerErrorsCodes.LastSiteAdmin) {
						that.view.trigger('last-site-admin');
					} else {
						that.trigger("error", options.responseError);
					}
				},
				success: function () {
					that.get("accountManager").resetCredentials();
					that.get("accountManager").trigger('sign-out');
					that.trigger("destroy");
				}
			});
		},

		_updateActiveSection: function (section) {
			this._activeSection = section;
		}

	});

});
