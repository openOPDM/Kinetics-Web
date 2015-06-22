/*global define:  true */
define([
	'underscore',
	'Testing/Models/Constants',
	'Testing/Views/TestEndsScreenViewBase',
	'Testing/Views/SpentTimeUIUpdater',
	'Testing/Views/CorrectPressesUIUpdater',
	'text!Testing/Templates/TestPassedScreen.html',
	'Utils/AudioHelper'
], function (_, Constants, TestEndsScreenViewBase, SpentTimeUIUpdater, CorrectPressesUIUpdater, templateSource, sound) {
	'use strict';

	return TestEndsScreenViewBase.extend({
		template: _.template(templateSource),

		initialize: function () {
			TestEndsScreenViewBase.prototype.initialize.call(this);
			this._spentTimeUpdater = new SpentTimeUIUpdater();
			this._correctPressesUpdater = new CorrectPressesUIUpdater();
		},

		render: function () {
			TestEndsScreenViewBase.prototype.render.call(this);

			var _testType = this._testContext.get("properties").get("testType");
			switch (_testType) {
			case Constants.TestType.NM:
				this._correctPressesUpdater.findControls(this.$el);
				this._correctPressesUpdater.updateControls(this._testResults.get("keyPresses"));
				break;

			case Constants.TestType.PQ:
				this._spentTimeUpdater.findControls(this.$el);
				this._spentTimeUpdater.updateControls(this._testResults.get("spentTime"));
				break;
			}
		}
	});

});
