define([
	'backbone',
	'Testing/Models/TestResultsCollection',
	'Testing/Models/Constants'
], function (Backbone, TestResultsCollection, Constants) {
	'use strict';

	var TestSessionResults = Backbone.Model.extend({
		defaults: {
			testResultsCollection: null,
			navigator: {},
			createDate: null,
			totalScore: 0,
			extension: [],
			notes: "",
			valid: true
		},

		parse: function (resp, options) {
			var resp = Backbone.Model.prototype.parse.call(this, resp, options);
			resp.testResultsCollection = new TestResultsCollection(resp.testResultsCollection);
			return resp;
		},

		toJSON: function () {
			var json = {
				testResultsCollection: this.get("testResultsCollection").toJSON()
			};
			return json;
		},

		initialize: function () {
			var testResultsCollection = this.get("testResultsCollection");
			if (!testResultsCollection || !(testResultsCollection instanceof TestResultsCollection)) {
				this.set("testResultsCollection", new TestResultsCollection());
			}
		},

		passedTests: function () {
			var returnValue = "";
			var testResultsCollection = this.get("testResultsCollection");
			if (testResultsCollection) {
				_.each(testResultsCollection.models, function (testResults) {
					if (testResults.get("state") == Constants.TestResultState.Passed) {
						if (returnValue.length > 0) returnValue += " ";
						returnValue += testResults.get("testTag");
					}
				})
			}
			return returnValue;
		}
	});

	return TestSessionResults;
});


