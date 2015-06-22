define([
	'backbone',
	'Testing/Views/NavigationPanelItemViewBase',
	'text!Testing/Templates/NavigationSummaryItemView.html'
], function (Backbone, NavigationPanelItemViewBase, templateHtml) {
	'use strict';

	// NOTE: View should be created one for one test session then should be destroyed
	var NavigationSummaryItemView = NavigationPanelItemViewBase.extend({
		template: _.template(templateHtml),

		initialize: function () {
			// Call base implementation
			NavigationPanelItemViewBase.prototype.initialize.call(this);

			// Wait when results will be initialized
			this.model.once("change:sessionResults", this._bindListenerToSessionResults, this);
			this.render();
		},

		_bindListenerToSessionResults: function (model, sessionResults) {
			if (!sessionResults) {
				throw new Error("Session results not set.");
			}

			// Bind score changes listener
			this.listenTo(sessionResults, {
				"change:totalScore": function (model, totalScore) {
					this._updateScore(totalScore);
				}
			});

			this._updateScore(sessionResults.get("totalScore"));
		}
	});

	return NavigationSummaryItemView;
});
