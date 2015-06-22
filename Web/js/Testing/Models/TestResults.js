define([
	'underscore',
	'backbone',
	'Testing/Models/Constants',
	'Testing/Models/TestPropertiesHash'
], function (_, Backbone, Constants, TestPropertiesHash) {
	'use strict';

	var TestResults = Backbone.Model.extend({
		defaults: {
			sortIndex: null,
			testTag: null,
			keyPresses: null,
			spentTime: null,
			score: null,
			raw: null,
			state: Constants.TestResultState.NotPassed
		},

		getTestName: function () {
			var testName = null;
			var testTag = this.get("testTag");
			if (testTag) {
				var testProperties = _.find(TestPropertiesHash, function (testProperties) {
					return testProperties.get("tag") == testTag;
				});
				if (testProperties) {
					testName = testProperties.get("name");
				}
			}
			return testName;
		}
	});
	return TestResults;
});
