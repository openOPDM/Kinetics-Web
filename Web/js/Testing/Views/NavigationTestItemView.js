/*global define:true */
define([
	'underscore',
	'backbone',
	'Testing/Views/NavigationPanelItemViewBase',
	'Testing/Models/Constants',
	'text!Testing/Templates/NavigationTestItemView.html'
], function (_, Backbone, NavigationPanelItemViewBase, Constants, templateHtml) {
	'use strict';

	// NOTE: View should be created one for one test session then should be destroyed
	return NavigationPanelItemViewBase.extend({
		template: _.template(templateHtml),

		initialize: function () {
			// Call base implementation
			NavigationPanelItemViewBase.prototype.initialize.call(this);

			// Wait when results will be initialized
			this.model.get("context").once("change:results", this._bindListenerOfContext, this);
			this.render();
		},

		_bindListenerOfContext: function (model, testResults) {
			if (!testResults) {
				throw new Error("Test results not set.");
			}
			var that = this;

			// Bind score changes listener
			this.listenTo(testResults, {
				"change:score change:state": function () {

					var state = testResults.get("state"),
						score = testResults.get("score");

					if (state === Constants.TestResultState.Passing || state === Constants.TestResultState.Passed) {
						that._updateScore(score);
					} else {
						that._updateScore(state);
					}

				}
			});

			this._updateScore(testResults.get("state"));
		}
	});

});
