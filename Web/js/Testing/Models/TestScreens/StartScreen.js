/*global define:true */
define([
	'Testing/Models/TestScreens/ScreenBase',
	'Testing/Models/Constants'
], function (ScreenBase, Constants) {
	'use strict';

	return ScreenBase.extend({
		_checkContext: function () {
			// Call base implementation
			ScreenBase.prototype._checkContext.call(this);

			this._testResults = this._testContext.get("results");
			if (!this._testResults) {
				throw new Error("Test result not specified in current test context.");
			}
		},

		deactivate: function () {
			this.trigger("pause-video-tutorial");

			// Call base implementation
			ScreenBase.prototype.deactivate.apply(this, arguments);
		},

		startPressed: function () {
			this.trigger("signal:start");
		},

		backPressed: function () {
			if (this._testContext.get("firstTest")) {
				throw new Error("Back button cannot be pressed for first test.");
			}

			this.trigger("out_signal:back");
		},

		nextPressed: function () {
			// Set state to skipped
			this._testResults.set("state", Constants.TestResultState.Skipped);

			this.trigger("out_signal:next");
		}
	});
});
