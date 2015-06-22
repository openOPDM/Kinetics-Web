/*global define: true, alert: true */
define([
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Views/Constants',
	'Views/TestRoomView',
	'Views/PatientInfoView',
	'Models/Constants',
	'Models/UserProfile',
	'Models/TestSessionResultsRowCollection',
	'Models/Sharing',
	'DataLayer/ErrorConstants',
	'Utils/Dialog',
	'text!Templates/UserNotAccessible.html'
], function (_, Constants, ControllerBase, ViewsConstants, TestRoomView, PatientInfoView, ModelsConstants, UserProfile, TestSessionResultsRowCollection, Sharing, ErrorConstants, Dialog, UserNotAccessible) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);

			this._checkAttribute("accountManager");
			var testingController = this._checkAttribute("testingController");
			this._checkAttribute("globalModels");

			// Bind methods with 'this' reference
			_.bindAll(this, "_fetchRowCollection", "_fetchUserProfile", "_initializeView", "_onUserInfoFetched");

			// Attach permanent listener to testing controller
			testingController.on("submit", this._onSubmitNewTestSessionResults, this);

			this.models = {};

			this.dialog = new Dialog();
			this.sharing = new Sharing();
		},

		parseParams: function (params) {
			var result = {};
			if (params.length === 1 || params.length === 3) {
				result.userId = +params[0];
			}
			if (params.length === 2 || params.length === 4) {
				try {
					result.userId = +$.base64.decode(params[0]);
					result.project = +$.base64.decode(params[1]);

				} catch (e) {
					this.trigger('parsing-error');
				}

			}
			return result;
		},

		activate: function (params) {
			var accountManager = this.get("accountManager"),
				currentUserRole = accountManager && accountManager.get("currentUser") && accountManager.get("currentUser").get("role");
			if (!params.userId && currentUserRole === ModelsConstants.UserRole.SiteAdmin) {
				this.trigger("missing-user-id");
				return;
			}
			var that = this;
			this.refreshOnly = false;
			this._readOnly = !!params.userId && !!params.project;

			this.userId = params.userId;
			this.project = params.project;
			accountManager.trigger('viewed-user-updated', this.userId);

			// Start listening control events
			this.listenTo(accountManager, {
				'project-changed-success': this._refreshView
			});

			this.analystMode = currentUserRole === ModelsConstants.UserRole.Analyst;
			this.ownTestRoom = !this.userId;

			this._viewInitialized = false;
			this._userProfileInitialized = false;

			this._initializeRowCollection(params.userId, params.project);
			if (params.userId && currentUserRole !== ModelsConstants.UserRole.Patient) {
				this._initializeUserProfile(params.userId);
			}

			this.listenTo(this.dialog, {
				'generate-link-confirmed': function () {
					that._getOrGenerateToken(that._lastSharedTestId);
				}
			});

		},

		_initializeRowCollection: function (userId, project) {
			this.models.rowCollection = new TestSessionResultsRowCollection(null, { userId: userId, project: project });
			this.listenTo(this.models.rowCollection, {
				"detail": this._onDetail,
				"change: isValid": this._onChangeIsValid,
				"shareTest": this._onShareTest
			});
			this._fetchRowCollection();
		},

		_fetchRowCollection: function () {
			var options = this._getFetchOptions(true, this._initializeView, this._fetchRowCollection);
			options.analystMode = this.analystMode;
			this.models.rowCollection.fetch(options);
		},

		_initializeUserProfile: function (userId) {
			this.models.userProfile = new UserProfile({ id: userId, analystMode: this._analystMode });
			this._fetchUserProfile();
		},

		_fetchUserProfile: function () {
			var options = this._getFetchOptions(true, this._onUserInfoFetched, this._fetchUserProfile),
				that = this;
			options.analystMode = this.analystMode;
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
		},

		_onUserInfoFetched: function () {
			this._userProfileInitialized = true;
			if (this.analystMode) {
				this._showUserInfo();
			} else {
				this.view = new PatientInfoView({
					model: this.models.userProfile
				});
				this.get("applicationView").showView(this.view);

			}
		},

		_showUserInfo: function () {
			if (this._viewInitialized && this._userProfileInitialized) {
				this.view.showUserInfo(this.models.userProfile);
			}
		},

		_initializeView: function () {
			this.view = new TestRoomView({
				model: this.models.rowCollection,
				analystMode: this.analystMode,
				ownTestRoom: this.ownTestRoom,
				readOnly: this._readOnly
			});


			if (!this.refreshOnly) {
				// Show view
				this.get("applicationView").showView(this.view);
			} else {
				// Update view
				this.get("applicationView").updateView(this.view);
			}

			this.listenTo(this.view, {
				"start-test": this._onStartTest,
				"delete": this._onDelete,
				"trend-report": this._onTrendReport,
				"share-all": this._onShareAll
			});

			this.listenTo(this.get("accountManager"), {
				"viewed-patient-changed": function (id) {
					this.trigger('change-patient', id);
				}
			});

			this._viewInitialized = true;
			this._showUserInfo();
		},

		_refreshView: function () {
			var currentUserRole = this.get("accountManager") && this.get("accountManager").get("currentUser") && this.get("accountManager").get("currentUser").get("role");
			this.analystMode = currentUserRole === ModelsConstants.UserRole.Analyst;

			if (this.analystMode) {
				return;
			}
			this.refreshOnly = true;
			this._initializeRowCollection(this.userId);
		},

		// Initialize menu
		initializeMenu: function () {
			var activeButton = !this.userId ? "testRoom" : null;
			this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.Default, activeButton);
		},

		deactivate: function () {
			this._reset();
		},

		_onStartTest: function () {
			this.trigger("start-test", this.userId);
		},

		_onDelete: function (selectedModels) {
			var that = this;
			if (this.models.rowCollection) {
				this.models.rowCollection.destroyMany(selectedModels, {
					wait: true,
					accountManager: this.get("accountManager"),
					errorOther: function (models, xhr, options) {
						that.trigger("error", options.responseError);
					},
					success: function (models) {
						that.dialog.show('alert', "A {0} test result{1} successfully deleted.".format(
							models.length,
							models.length === 1 ? "" : "s"
						));
					}
				});
			}
		},

		_onSubmitNewTestSessionResults: function (testSessionResultsContainer) {
			if (this.models.rowCollection) {
				this.models.rowCollection.add(testSessionResultsContainer);
			}
		},

		_onDetail: function (model) {
			this.trigger("detail", model.id, model.collection.userId);
		},

		_onChangeIsValid: function (model, isValid) {
			var that = this;
			var ids = [ model.id ];
			var options = this._getFetchOptions(true, null, _.bind(that._onChangeIsValid, that, ids, isValid));
			this.models.rowCollection.updateIsValid(ids, isValid, _.extend(options, { wait: true }));
		},

		_onTrendReport: function () {
			if (this._readOnly) {
				this.trigger("trend-report", $.base64.encode(this.userId), $.base64.encode(this.project));
			} else {
				this.trigger("trend-report", this.userId);
			}
		},

		_onShareAll: function () {
			this.trigger('share-all');
		},

		_onShareTest: function (id) {
			var that = this;
			this.sharing.checkToken({
				accountManager: this.get("accountManager"),
				id: id,
				success: function (model, token, options) {
					if (token) {
						that.trigger('share-test', token, id);
					} else {
						that._lastSharedTestId = id;
						that.dialog.show('confirm', 'Would you like to generate a link to share this test in social networks?', 'generate-link');
					}

				}
			});
		},

		_getOrGenerateToken: function (id) {
			var that = this;
			this.sharing.generateToken({
				accountManager: this.get("accountManager"),
				id: id,
				success: function (model, token, option) {
					that.trigger('share-test', token, id);
				}
			});
		}
	});

});