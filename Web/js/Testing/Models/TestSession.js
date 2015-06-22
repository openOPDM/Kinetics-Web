define([
	'backbone',
	'Testing/Models/StateMachine',
	'Testing/Models/Test',
	'Testing/Models/TestResults',
	'Utils/ConsoleStub'
], function (Backbone, StateMachine, Test, TestResults) {
	'use strict';

	var TestSession = Backbone.Model.extend({
		defaults: {
			// Hash of test results with key by test tag (from test properties)
			sessionResults: null,
			testTransitions: null,
            registerAfterTest:null
		},

		initialize: function () {
			var testTransitions = this.get("testTransitions");

			this._markFirstTest(testTransitions.table);
			this._markLastTest(testTransitions.table);

			this.on("change:sessionResults", this._sessionResultsChanged);

			// Create state machine
			this._testStateMachine = new StateMachine(null, null, testTransitions);
			this._testStateMachine.on({
				"out_signal:submit": this._onSubmit,
				"out_signal:cancel": this._onCancel,
                "out_signal:register": this._onRegister,
				"state:activating": this._onTestActivating,
				"state:activated": this._onTestActivated,
				"state:deactivated": this._onTestDeactivated
			}, this);
		},

		isStarted: function () {
			return this._testStateMachine.isStarted();
		},

		_sessionResultsChanged: function (/*model, sessionResults*/) {
			if (this.isStarted()) {
				throw new Error("Test session results instance cannot be changed when test session is started.");
			}
		},

		_initializeAggregators: function (reset) {
			var sessionResults = reset ? null : this.get("sessionResults"),
			    customFields = reset ? null : this.get("customFields"),
                registerAfterTest = reset ? null : this.get("registerAfterTest");

			var table = this.get("testTransitions").table;
			for (var i = 0; i < table.length; i++) {
				var test = table[i].state;
				if (test.get("aggregator")) {
					test.set("sessionResults", sessionResults);
					test.set("customFields", customFields);
                    test.set("registerAfterTest",registerAfterTest)
				}
			}
		},

		_mapTestResultsToTests: function (transitionTable, testResultsCollection) {
			for (var i = 0; i < transitionTable.length; i++) {
				var test = transitionTable[i].state;
				if (test instanceof Test && !test.get("aggregator")) {
					this._setTestResults(test, testResultsCollection);
				}
			}
		},

		// Reset to null test results
		_resetTestResultsOfTests: function (transitionTable) {
			for (var i = 1; i < transitionTable.length; i++) {
				var test = transitionTable[i].state;
				if (test instanceof Test && !test.get("aggregator")) {
					test.get("context").set("results", null);
				}
			}
		},

		// Set correct TestResults object to test
		_setTestResults: function (test, testResultsCollection) {
			var testContext = test.get("context");
			if (!testContext) {
				throw new Error("Test context not available.");
			}

			var properties = testContext.get("properties");
			var sortIndex = properties.get("sortIndex");
			var testTag = properties.get("tag");

			var testResults = testResultsCollection.getByTag(testTag);
			if (!testResults) {
				// Create new test results for test if needs
				testResults = new TestResults({ sortIndex: sortIndex, testTag: testTag });
				testResultsCollection.add(testResults);
			}

			testContext.set("results", testResults);
		},

		// Marks first test by specific attribute
		// NOTE: Method implemented as stub that mark first item in transition table as first test
		_markFirstTest: function (transitionTable) {
			if (transitionTable.length > 1) {
				for (var i = 0; i < transitionTable.length; i++) {
					var test = transitionTable[i].state;
					if (test instanceof Test) {
						var firstTest = test;
						break;
					}
				}
				firstTest.get("context").set("firstTest", true);
			}
		},

		// Marks last test by specific attribute
		_markLastTest: function (transitionTable) {
			if (transitionTable.length > 1) {
				var lastTest = transitionTable[0].state;
				for (var i = 1; i < transitionTable.length; i++) {
					var test = transitionTable[i].state;
					if (test instanceof Test) {
						lastTest = test;
					}
				}
				lastTest.get("context").set("lastTest", true);
			}
		},

		// Starts inner state machine
		start: function () {
			if (!this.has("sessionResults")) {
				throw new Error("Test session results not set to attribute 'results'. It may be set in constructor.");
			}

			if (this.isStarted()) {
				throw new Error("Test session already started.");
			}

			this._initializeAggregators(false);

			var testResultsCollection = this.get("sessionResults").get("testResultsCollection");
			this._mapTestResultsToTests(this.get("testTransitions").table, testResultsCollection);

			this.trigger("starting");
			this._testStateMachine.start(true);
			this.trigger("started");
		},

		// Stops inner state machine
		stop: function () {
			if (!this.isStarted()) {
				throw new Error("Test session already stopped.");
			}

			this._initializeAggregators(true);
			this._resetTestResultsOfTests(this.get("testTransitions").table);

			this._testStateMachine.stop();
			this.trigger("stopped");
		},

		_onSubmit: function () {
			this._testStateMachine.stop();

			this.get("sessionResults").set("createDate", new Date());
			this.trigger("submit");
		},

        _onRegister:function(){
            this._testStateMachine.stop();
            this.get("sessionResults").set("createDate", new Date());
            this.trigger('register');
        },

		_onCancel: function () {
			console.log("TestSession._onCancel()");

			this._testStateMachine.stop();
			this.trigger("cancel");
		},

		_onTestActivating: function (stateItem) {
			console.log("TestSession._onTestActivating()");

			// Transmits event
			this.trigger("test:activating", stateItem);
		},

		_onTestActivated: function (stateItem) {
			// Transmits event
			this.trigger("test:activated", stateItem);
		},

		_onTestDeactivated: function (stateItem) {
			console.log("TestSession._onTestDeactivated()");

			// Transmits event
			this.trigger("test:deactivated", stateItem);
		}
	});

	return TestSession;
});
