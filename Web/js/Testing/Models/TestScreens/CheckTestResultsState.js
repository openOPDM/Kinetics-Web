define([
	'Testing/Models/TestScreens/ScreenBase',
	'Testing/Models/Constants'
], function (ScreenBase, Constants) {
	"use strict";
	// Helper state that checks exists of current test results and
	// help to select beginning screen: start/passed/canceled screen.
	return ScreenBase.extend({
		activate: function () {
			// Call method form base prototype
			ScreenBase.prototype.activate.call(this);

			var testResults = this._testContext.get("results");

			switch (testResults.get("state")) {
			case Constants.TestResultState.Passed:
				this.trigger("signal:passed");
				break;

			case Constants.TestResultState.Canceled:
				this.trigger("signal:canceled");
				break;

			default:
				this.trigger("signal:noResults");
				break;
			}
		},

		_checkContext: function () {
			// Call base implementation
			ScreenBase.prototype._checkContext.call(this);

			if (!this._testContext.has("results")) {
				throw new Error("'results' not specified in the test context.");
			}

			if (!this._testProperties.has("testType")) {
				throw new Error("'testType' not specified in the test properties.");
			}
		}
	});

});
