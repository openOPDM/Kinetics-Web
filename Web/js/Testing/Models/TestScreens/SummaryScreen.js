define([
	'backbone',
	'Testing/Models/TestContext'
], function (Backbone, TestContext) {
	'use strict';

	// Aggregation screen for testing results
	var SummaryScreen = Backbone.Model.extend({
		defaults: {
			context: null,

			// Indicate to TestSession instance that screen aggregate testing results and
			// test session results have to be provided
			aggregator: true,

			// Test session results that will be provided by TestSession instance
			sessionResults: null
		},

		initialize: function () {
			// Creates test context for TestSession object be able to provide test results
			this.set("context", new TestContext());
		},

		activate: function () {
			this._checkContext();
		},

		deactivate: function () {
			this._testContext = null;
			this._testProperties = null;
		},

		_checkContext: function () {
			this._sessionResults = this.get("sessionResults");
			if (!this._sessionResults) {
				throw new Error("Test session results weren't provided.");
			}
		},

		backPressed: function () {
			this.trigger("signal:back");
		},

		submitPressed: function () {
			this.trigger("out_signal:submit");
		},

        registerPressed:function(){
           this.trigger('out_signal:register');
        },

		cancelPressed: function () {
			this.trigger("out_signal:cancel");
		}
	});

	return SummaryScreen;
});

