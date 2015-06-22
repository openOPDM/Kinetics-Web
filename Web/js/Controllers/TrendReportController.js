/*global define: true*/
define([
	'jQuery',
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Views/Constants',
	'Views/TrendReportView',
	'Models/TestSessionResultsRowCollection',
	'Models/TrendReportModel',
	'Models/UserProfile',
	'DataLayer/ErrorConstants',
	'text!Templates/UserNotAccessible.html'
], function ($, _, Constants, ControllerBase, ViewsConstants, TrendReportView, TestSessionResultsRowCollection, TrendReportModel, UserProfile, ErrorConstants, UserNotAccessible) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);

			this._checkAttribute("accountManager");

			// Bind methods with 'this' reference
			_.bindAll(this, "_fetchRowCollection", "_initializeTrendModel");

			// Elements of models collection will be disposed in the base class
			this.models = {};
		},

		parseParams: function (params) {
			var result = {};
			if (params.length === 1) {
				result.userId = params[0];
			}
			if (params.length === 2) {
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

			this._readOnly = !!params.userId && !!params.project;
			this.userId = params.userId;
			this.project = params.project;

			this.get('accountManager').trigger('viewed-user-updated', this.userId);

			this._viewInitialized = false;

			this._initializeRowCollection(params.userId, params.project);
		},

		_initializeRowCollection: function (userId, project) {
			this.models.testResults = new TestSessionResultsRowCollection(null, { userId: userId, project: project });
			this.models.testResults.comparator = "creationDate";
			this._fetchRowCollection();
		},

		_fetchRowCollection: function () {
			var options = this._getFetchOptions(true, this._initializeTrendModel, this._fetchRowCollection),
				that = this;
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

			this.models.testResults.fetch(options);
		},

		_initializeTrendModel: function () {
			this.models.trendModel = new TrendReportModel({
				testResults: this.models.testResults
			});
			this._initializeView();
		},

		_initializeView: function () {

			this.view = new TrendReportView({
				model: this.models.trendModel,
				readOnly: this._readOnly
			});

			this.listenTo(this.get("accountManager"), {
				"viewed-patient-changed": function (id) {
					this.trigger('change-patient', id);
				}
			});

			this.listenTo(this.view, {
				"back-shared": function () {
					this.trigger('back-shared', $.base64.encode(this.userId), $.base64.encode(this.project));
				}
			});


			// Initialize menu
			var applicationView = this.get("applicationView");

			// Show view
			applicationView.showView(this.view);

			this._viewInitialized = true;

			this.view.drawGraph();
		},

		// Initialize menu
		initializeMenu: function () {
			var activeButton = !this.userId ? "trendReport" : null;
			this.get("applicationView").header.showMenu(ViewsConstants.HeaderMenu.Default, activeButton);
		},

		deactivate: function () {
			this._reset();
		}
	});

});

