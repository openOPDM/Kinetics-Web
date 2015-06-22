define([
	'Testing/Models/TestScreens/TestingScreenBase',
	'Testing/Models/TimeCalculation'
], function (TestingScreenBase, TimeCalculation) {
	'use strict';

	return TestingScreenBase.extend({
		defaults: {
			"remainedSeconds": -1
		},

		_expectedKeySet: ["n", "m"],

		activate: function () {
			// Call method form base prototype
			TestingScreenBase.prototype.activate.call(this);

			this._nmTestTimeout = this._testProperties.get("nmTestTimeout");
			this.set("remainedSeconds", this._nmTestTimeout);
		},

		_checkContext: function () {
			// Call method form base prototype
			TestingScreenBase.prototype._checkContext.call(this);

			if (!this._testProperties.has("nmTestTimeout")) {
				throw new Error("'nmTestTimeout' not specified in the test properties.");
			}
		},

		_tick: function () {
			var remainedSeconds = this.get("remainedSeconds");
			this.set("remainedSeconds", --remainedSeconds);

			var spentSeconds = this._nmTestTimeout - remainedSeconds;
			var spentTime = TimeCalculation.getTimeSpan(spentSeconds * 1000);
			this._testResults.set("spentTime", spentTime);

			var percentsDone = 100 - (remainedSeconds / this._nmTestTimeout * 100);
			this.set("percentsDone", percentsDone);

			if (remainedSeconds <= 0) {
				this._testPassed();
			}
		},

		_expectedKeyPressed: function () {
			// Increment correct presses counter
			this._testResults.set("keyPresses", this._testResults.get("keyPresses") + 1);
			this._toggleExpectedKey();
		}
	});

});

