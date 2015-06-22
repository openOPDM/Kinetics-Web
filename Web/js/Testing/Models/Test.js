define([
	'backbone',
	'Testing/Models/TestContext',
	'Testing/Models/StateMachine',
	'Utils/ConsoleStub'
], function (Backbone, TestContext, StateMachine) {
	var Test = Backbone.Model.extend({
		defaults: {
			context: null
		},

		initialize: function (attributes, options, testProperties, screenTransitions) {
			var testContext = new TestContext();
			testContext.set("properties", testProperties);
			this.set("context", testContext);

			this.screenTransitions = screenTransitions;

			// Create state machine for test that will switch test screens
			this._stateMachine = new StateMachine(null, null, this.screenTransitions);

			// Bind event handlers
			this._stateMachine.on({
				"out_signal:back": this._onBack,
				"out_signal:next": this._onNext
			}, this);
		},

		activate: function () {
			// Change test context attributes to actual for current test
			this._changeContext(false);

			// Start state machine (execute logic of first of last state screen,
			// bind event handlers to this state screen)
			this._stateMachine.start(true);
		},

		deactivate: function () {
			// Stop state machine (unbinds all event handlers for current screen)
			this._stateMachine.stop();

			// Reset test context for save consistency state
			this._changeContext(true);
		},

		// Change test context to context of current test for all screens
		_changeContext: function (reset) {
			var testContext = reset ? null : this.get("context");

			// Set test context to all test screens
			for (var i = 0; i < this.screenTransitions.table.length; i++) {
				var screen = this.screenTransitions.table[i].state;
				screen.set("testContext", testContext);
			}
		},

		_onBack: function () {
			console.log("Test._onBack()");

			// Retransmits event
			this.trigger("signal:back");
		},

		_onNext: function () {
			console.log("Test._onNext()");

			// Retransmits event
			this.trigger("signal:next");
		}
	});

	return Test;
});