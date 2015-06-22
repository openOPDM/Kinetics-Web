define([
	'Testing/Models/TestScreens/ScreenBase',
	'Utils/TimerManager',
	'Testing/Models/Constants'
], function (ScreenBase, TimerManager, Constants) {
	'use strict';

	var CountdownScreen = ScreenBase.extend({
		defaults: {
			"spentSeconds": -1
		},

		initialize: function (/*attributes, options*/) {
			this._timerManager = new TimerManager(this._tick.bind(this), 1000);
		},

		activate: function () {
			// Call method form base prototype
			ScreenBase.prototype.activate.call(this);

			this.set("spentSeconds", this._testProperties.get("secondsForCountdown"));
			this._timerManager.startTimer();
		},

		_checkContext: function () {
			// Call base implementation
			ScreenBase.prototype._checkContext.call(this);

			this._testResults = this._testContext.get("results");
			if (!this._testResults) {
				throw new Error("Test result not specified in current test context.");
			}

			if (!this._testProperties.has("secondsForCountdown")) {
				throw new Error("'secondsForCountdown' not specified in test properties.");
			}
		},

		deactivate: function () {
			this._timerManager.stopTimer();

			// Call base implementation
			ScreenBase.prototype.deactivate.call(this);
		},

		_tick: function () {
			var countdownValue = this.get("spentSeconds");
			this.set("spentSeconds", --countdownValue);

			if (countdownValue <= 0) {
				this._timerManager.stopTimer();
				this.trigger("signal:countdownEnds");
			}
		},

		stopPressed: function () {
			this._testResults.set("state", Constants.TestResultState.Canceled);
			this.trigger("signal:stop");
		}
	});

	return CountdownScreen;
});

