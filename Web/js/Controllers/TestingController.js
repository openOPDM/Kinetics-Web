/*global define: true */
define([
	'jQuery',
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Testing/Views/TestSessionView',
	'Testing/Models/DexterityCalculator',
	'Testing/Models/TestSessionResults',
	'Testing/Models/TestSession',
	'Testing/Models/TestTransitionsInstance',
	'Testing/Models/ScreenTransitionsInstance',
	'Models/TestSessionResultsRow',
	'Views/Constants',
	'Models/ExtensionsCollection',
	'Utils/Dialog'
], function ($, _, Constants, ControllerBase, TestSessionView, DexterityCalculator, TestSessionResults, TestSession, testTransitions, screenTransitions, TestSessionResultsRow, ViewsConstants, ExtensionsCollection, Dialog) {
	'use strict';

	return ControllerBase.extend({
		registerAfterTest: false,

		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);

			this._checkAttribute("accountManager");

			this.dexterityCalculator = new DexterityCalculator();
			this.dialog = new Dialog();
		},

		parseParams: function (params) {
			var result = {};
			if (params.length === 2 && params[0] === Constants.ActionMarker) {
				result.action = params[1];
			} else {
				this.registerAfterTest = false;
				if (params.length === 1 && params[0] === Constants.TestTryIt) {
					this.registerAfterTest = true;
					result.userId = null;
				} else {
					result.userId = params[0];
				}
			}
			return result;
		},

		activate: function (params) {
			var accountManager = this.get("accountManager");
			//todo: refactor this functionality

			if (this.registerAfterTest && accountManager.get('currentUser')) {
				// return to user-test-room
				this.trigger("user-test-room");

				this.dialog.show('alert', '"Try It" is for new users. You are already logged in, we are taking you to the Test Room now.<br><br>If you want to use "Try It", please logout first.');
			} else {
				// Create new test session results
				this.testSessionResults = new TestSessionResults();

				// Initialize listening model for dexterity calculation
				this.dexterityCalculator.set("sessionResults", this.testSessionResults);

				if (this.registerAfterTest) {
					//Set blank custom question collection
					this._setNoCustomFields();
				} else {
					// Getting test details custom questions
					this._getCustomFields();
				}
				this.userId = params.userId;
			}
			this._toggleUserSelector();
		},

		_setNoCustomFields: function () {
			this.customFieldsCollection = {};
			this._proceedControllerActivation();
		},

		_getCustomFields: function () {
			//Getting test custom fields
			this.customFieldsCollection = new ExtensionsCollection();
			var self = this;
			var options = this._getFetchOptions(true, function () {
				self._proceedControllerActivation();
			}, this._getCustomFields);
			this.customFieldsCollection.fetch(options);
		},

		_proceedControllerActivation: function () {
			this.testSession = new TestSession({
				sessionResults: this.testSessionResults,
				testTransitions: testTransitions(parseInt(this.customFieldsCollection.length, 10)),
				screenTransitions: screenTransitions,
				customFields: this.customFieldsCollection,
				registerAfterTest: this.registerAfterTest
			});

			// Start listening control events
			this.listenTo(this.testSession, {
				"submit": this._onSubmit,
				"cancel": this._onCancel,
				"register": this._onRegister
			});

			// Initialize menu
			var applicationView = this.get("applicationView");
			applicationView.header.showMenu(ViewsConstants.HeaderMenu[this.registerAfterTest ? 'Authorization' : 'Testing']);

			// Show test session view
			this.view = new TestSessionView({
				el: applicationView.el,
				model: { testTransitions: testTransitions(parseInt(this.customFieldsCollection.length, 10)), screenTransitions: screenTransitions, registerAfterTest: this.registerAfterTest},
				accountManager: this.get("accountManager")
			});

			// Show view
			this.view.render();

			// Start test session
			if (this.testSession) {
				this.testSession.start();
			}


			//Clear previous test data
			localStorage.removeItem('kinetics-TestResults');
		},

		deactivate: function () {
			if (this.testSession && this.testSession.isStarted()) {
				this.testSession.stop();
			}
			this._reset();
		},

		_reset: function () {
			this._toggleUserSelector(true);
			this.stopListening();
			this.dexterityCalculator.set("sessionResults", null);
			if (this.view) {
				this.view.remove();
				this.view = null;
			}
			this.testSessionResults = null;
			this.customFieldsCollection = null;
		},

		_toggleUserSelector: function (isShowed) {
			var $userSelector = $('.username select');
			if ($userSelector.length) {
				if (isShowed) {
					$userSelector.removeAttr('disabled');
				} else {
					$userSelector.attr('disabled', 'disabled');
				}
			}
		},

		_onSubmit: function () {
			var container = TestSessionResultsRow.buildFromTestSessionResults(this.testSessionResults, this.userId);
			this._submit(container);
		},

		_submit: function (container) {
			var submitHandler = _.bind(this._submit, this, container),
				that = this;

			container.save(null, {
				wait: true,
				accountManager: this.get("accountManager"),
				userId: that.userId || null,
				errorOther: _.bind(function (model, xhr, options) {
					delete this.currentRequest;
					this.trigger("error", options.responseError);
				}, this),
				errorUnauthenticated: _.bind(function (/*errorObject*/) {
					delete this.currentRequest;
					this._sleep(submitHandler);
//					this.trigger("unauthenticated"); //looping welcome controller
				}, this),
				success: _.bind(function () {
					delete this.currentRequest;
					this.trigger("submit", container);
					this.trigger("submitted", that.userId);
				}, this)
			});
		},

		_onRegister: function (options) {
			var container = TestSessionResultsRow.buildFromTestSessionResults(this.testSessionResults, null),
				testResults = {
					type: container.get('type'),
					score: container.get('score'),
					rawData: container.get('rawData'),
					isValid: container.get('isValid'),
					notes: container.get('notes')
				};

			localStorage.setItem('kinetics-TestResults', JSON.stringify(testResults));

			this.trigger('sign-up');
		},

		_onCancel: function () {
			this.trigger("cancel", this.userId);
		}
	});

});
