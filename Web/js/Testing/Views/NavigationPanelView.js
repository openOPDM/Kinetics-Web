define([
	'backbone',
	'Testing/Views/NavigationTestDetailsView',
	'Testing/Views/NavigationTestItemView',
	'Testing/Views/NavigationSummaryItemView',
	'Testing/Models/Test',
	'Testing/Models/TestScreens/TestDetailsScreen',
	'Testing/Models/TestScreens/SummaryScreen',
	'text!Testing/Templates/NavigationPanelView.html'
], function (Backbone, NavigationTestDetailsView, NavigationTestItemView, NavigationSummaryItemView, Test, TestDetailsScreen, SummaryScreen, templateHtml) {
	'use strict';

	// Represent navigation panel of testing stages at left side.
	// This view is self rendering during initialization.
	var NavigationPanelView = Backbone.View.extend({
		tagName: "div",
		className: "test-nav",

		template: _.template(templateHtml),

		initialize: function () {
			if (!this.model) {
				throw new Error("Model not set.");
			}

			this.render();

			for (var i = 0; i < this.model.length; i++) {
				var stageModel = this.model[i];
				if (stageModel instanceof TestDetailsScreen) {
					var testDetailsView = new NavigationTestDetailsView({ model: stageModel });
					this.$el.append(testDetailsView.el);
				} else if (stageModel instanceof Test) {
					var itemView = new NavigationTestItemView({ model: stageModel });
					this.$el.append(itemView.el);
				} else if (stageModel instanceof SummaryScreen) {
					var summaryView = new NavigationSummaryItemView({ model: stageModel });
					this.$el.append(summaryView.el);
				}
			}
		},

		render: function () {
			this.$el.html(this.template());
			return this;
		}
	});

	return NavigationPanelView;
});