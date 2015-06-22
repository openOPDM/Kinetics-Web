define(['Testing/Models/TestScreens/ScreenBase'], function (ScreenBase) {
	'use strict';

	var TestEndsScreenBase = ScreenBase.extend({
		_checkContext: function () {
			// Call base implementation
			ScreenBase.prototype._checkContext.call(this);

			if (!this._testContext.has("firstTest")) {
				throw new Error("First test flag not specified in current test context.");
			}
		},

		repeatPressed: function () {
			this.trigger("signal:repeat");
		},

		backPressed: function () {
			if (this._testContext.get("firstTest")) {
				throw new Error("Back button cannot be pressed for first test.");
			}
			this.trigger("out_signal:back");
		},

		nextPressed: function () {
			this.trigger("out_signal:next");
		}
	});

	return TestEndsScreenBase;
});

