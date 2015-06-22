define([
	'Testing/Models/TestScreens/TestingScreenBase',
	'Testing/Models/TimeCalculation'
], function (TestingScreenBase, TimeCalculation) {
	'use strict';

	var TestingPQScreen = TestingScreenBase.extend({
		defaults: {
			"remainedPresses": -1
		},

		_startTime: null,

		_expectedKeySet: ["p", "q"],

		activate: function () {
			// Call method form base prototype
			TestingScreenBase.prototype.activate.call(this);

			this._expextedPresses = this._testProperties.get("pqTestCountOfExpectedCorrectPresses");
			this.set("remainedPresses", this._expextedPresses);

			this._startTime = new Date();
		},

		_checkContext: function () {
			// Call method form base prototype
			TestingScreenBase.prototype._checkContext.call(this);

			if (!this._testProperties.has("pqTestCountOfExpectedCorrectPresses")) {
				throw new Error("'pqTestCountOfExpectedCorrectPresses' not specified in the test properties.");
			}
		},

		_tick: function () {
			var spentTime = this._calculateSpentTime();
			this._testResults.set("spentTime", spentTime);
		},

		_testPassed: function () {
			// Save last value of spent time in results
			var spentTime = this._calculateSpentTime();
			this._testResults.set("spentTime", spentTime);

			TestingScreenBase.prototype._testPassed.call(this);
		},

		_calculateSpentTime: function () {
			var spentTicks = (new Date()) - this._startTime;
			return TimeCalculation.getTimeSpan(spentTicks);
		},

		_expectedKeyPressed: function () {
			// Decrement remained correct presses counter
			var remainedPresses = this.get("remainedPresses");
			this.set("remainedPresses", --remainedPresses);

			// Set key presses counter
			this._testResults.set("keyPresses", this._expextedPresses - remainedPresses);

			var percentsDone = 100 - (remainedPresses / this._expextedPresses * 100);
			this.set("percentsDone", percentsDone);

			if (remainedPresses <= 0) {
				this._testPassed();
			} else {
				this._toggleExpectedKey();
			}
		}
	});

	return TestingPQScreen;
});

