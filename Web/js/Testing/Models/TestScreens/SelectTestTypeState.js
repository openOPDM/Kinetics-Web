define([
	'Testing/Models/TestScreens/ScreenBase',
	'Testing/Models/Constants',
	'Utils/ConsoleStub',
	'formatter'
], function (ScreenBase, Constants) {
	'use strict';

	// Helper state that checks current test type and help to select respective testing screen.
	return ScreenBase.extend({
		activate: function () {
			// Call method form base prototype
			ScreenBase.prototype.activate.call(this);

			var testType = this._testProperties.get("testType");

			console.log("Current test type is {0}".format(testType));

			switch (testType) {
			case Constants.TestType.NM:
				this.trigger("signal:startNMTest");
				break;
			case Constants.TestType.PQ:
				this.trigger("signal:startPQTest");
				break;
			default :
				throw new Error("Invalid test type value '{0}'.".format(testType));
			}
		},

		_checkContext: function () {
			// Call base implementation
			ScreenBase.prototype._checkContext.call(this);

			if (!this._testProperties.has("testType")) {
				throw new Error("'testType' not specified in the test properties.");
			}
		}
	});

});
