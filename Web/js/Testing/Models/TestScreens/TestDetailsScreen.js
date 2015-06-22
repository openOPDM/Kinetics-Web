define([
	'backbone',
	'Testing/Models/TestContext'
], function (Backbone, TestContext) {
	'use strict';

	var TestDetailsScreen = Backbone.Model.extend({

		defaults: {
			// Indicate to TestSession instance that screen aggregate testing results and
			// test session results have to be provided
			aggregator: true
		},

		initialize: function () {
			// Creates test context for TestSession object be able to provide test results
			this.set("context", new TestContext());
		},

		activate: function () {
		},

		continuePressed: function () {
			this.trigger("signal:next");
		}

	});

	return TestDetailsScreen;
});

