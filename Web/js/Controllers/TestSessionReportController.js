/*global define: true */
define([
	'underscore',
	'jQuery',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Models/Constants',
	'Models/UserProfile',
	'Models/TestSessionResultsRow',
	'Views/Constants',
	'Views/TestSessionReportView',
	'Views/KeyboardTestSessionReportView',
	'Views/TestSessionCustomFieldsReportView',
	'DataLayer/ErrorConstants',
	'formatter'
], function (_, $, Constants, ControllerBase, ModelsConstants, UserProfile, TestSessionResultsRow, ViewsConstants, TestSessionReportView, KeyboardTestSessionReportView, TestSessionCustomFieldsReportView, ErrorConstants) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
			this._checkAttribute("accountManager");
			_.bindAll(this, "_onTestSessionResultsRowFetched", "_onUserProfileFetched");
			this.models = {};
		},

		parseParams: function (params) {
			var result = {};
			if (params.length >= 1) {
				if (/^[0-9]+$/.test(params[0])) {
					result.testSessionId = params[0];
				} else {
					result.token = params[0];
				}
			}
			if (params.length === 2 || params.length === 4) {
				result.userId = params[1];
			}
			if (params.length === 3 && params[1] === Constants.ActionMarker) {
				result.action = params[2];
			}
			else if (params.length === 4 && params[2] === Constants.ActionMarker) {
				result.action = params[3];
			}

			return result;
		},

		activate: function (params) {
			if (!params.testSessionId && !params.token) {
				this.trigger("invalid-parameters");
				return;
			}

			this.sharingToken = params.token;
			this.testSessionId = params.testSessionId;

			this._initializeTestSessionResultsRow(params.testSessionId);
			this._fetchTestSessionResultsRow();

			this.model.social = !!params.token;

		},

		_initializeTestSessionResultsRow: function (testSessionId) {
			this.model = new TestSessionResultsRow({ id: testSessionId });
		},

		_fetchTestSessionResultsRow: function () {
			var that = this,
				options = this._getFetchOptions(true, this._onTestSessionResultsRowFetched, this._fetchTestSessionResultsRow);
			options.error = function (model, xhr, options) {
				if (options.responseError.code === ErrorConstants.ServerErrorsCodes.NoPermission || options.responseError.code === ErrorConstants.ServerErrorsCodes.NoTestFound) {
					that.trigger('invalid-parameters');
					that.get('accountManager').viewedUser = null;
				}
			};
			this.model.configure(this.sharingToken ? 'token' : '');
			options.token = this.sharingToken;

			this.model.fetch(options);
		},

		_fetchUserProfile: function () {
			var options = this._getFetchOptions(true, this._onUserProfileFetched, this._fetchUserProfile);
			this.models.userProfile.fetch(options);
		},

		_onTestSessionResultsRowFetched: function () {
			if (this.get("accountManager") && this.get("accountManager").get("currentUser")) {
				this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.Default);
			} else {
				this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.Authorization);
			}
			this._initializeUserProfile(this.model.get("userId"));
			this._initializeView();
		},

		_onUserProfileFetched: function () {
			this._initializeLinkToTestRoom();
		},

		_initializeView: function () {
			this.view = this._initializeReportView();

			var customFields = this.model.get('extension');
			if (customFields && customFields.length) {
				this._initializeCustomFieldsReport();
			}

			if (this.model.getType() === ModelsConstants.TestSessionType.Keyboard) {
				this._initializeKeyboardTestSessionReport();
			}

		},

		_initializeCustomFieldsReport: function () {
			var customFieldsView = new TestSessionCustomFieldsReportView({
				model: this.model
			});
			// Show view
			this.view.showContentView(customFieldsView);
		},

		_initializeUserProfile: function (userId) {
			var currentUser = this.get("accountManager").get("currentUser");
			if (currentUser && +currentUser.id !== +userId) {
				this.models.userProfile = new UserProfile({ id: userId });
				this._fetchUserProfile();
			}
		},

		// Initialize and return header view
		_initializeReportView: function () {
			var reportView = new TestSessionReportView({
				model: this.model
			});

			this._initializeLinkToTestRoom();

			this.listenTo(reportView, {
				"user-test-room": this._onNavigateToUserTestRoom
			});

			// Show view
			this.get("applicationView").showView(reportView);

			return reportView;
		},

		_initializeLinkToTestRoom: function () {
			if (this.view && this.models.userProfile) {
				this.view.showLinkToTestRoom(this.models.userProfile);
			}
		},

		_initializeKeyboardTestSessionReport: function () {
			var testSessionResults = this.model.buildTestSessionResults();
			var currentUser = this.get("accountManager").get("currentUser");
			var contentView = new KeyboardTestSessionReportView({
				model: testSessionResults
			});

			// Show view
			this.view.showContentView(contentView);

			contentView.drawGraph();
		},

		deactivate: function () {
			this._reset();
		},

		_onNavigateToUserTestRoom: function () {
			// Retransmits event
			this.trigger("user-test-room", this.model.get("userId"));
		}
	});
});

