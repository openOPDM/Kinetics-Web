define(['Testing/Models/TestResults'], function (TestResults) {
	'use strict';

	var TestResultsCollection = Backbone.Collection.extend({
		model: TestResults,
		comparator: "sortIndex",

		getByTag: function (testTag) {
			return this.find(function (testResults) {
				return testResults.get("testTag") == testTag;
			});
		}
	});
	return TestResultsCollection;
});
