define([
	'underscore',
	'backbone',
	'Views/KeyboardTestReportPartView',
	'text!Templates/KeyboardTestSessionReport.html',
	'moment'
], function (_, Backbone, KeyboardTestReportPartView, templateHtml, moment) {
	'use strict';

	return Backbone.View.extend({

		className: "content-container report",
		template: _.template(templateHtml),

		events: {
		},

		_views: null,

		initialize: function (options) {
			this._userProfile = options.userProfile;
			this._showLinkToTestRoom = options.showLinkToTestRoom;
			this._views = [];
		},

		render: function () {
			this.$el.html(this.template({
				model: this.model,
				moment: moment
			}));

			this.$contextContainer = this.$(".content-text");
			this.$noResults = this.$(".id-no-results");

			var testResultsCollection = this.model.get("testResultsCollection");
			if (_.size(testResultsCollection) > 0) {
				this.$noResults.hide();
				testResultsCollection.forEach(function (testModel) {
					var view = new KeyboardTestReportPartView({ model: testModel });
					this.$contextContainer.append(view.render().el);
					this._views.push(view);
				}, this);
			} else {
				this.$noResults.show();
			}

			return this;
		},

		drawGraph: function () {
			_.forEach(this._views, function (view) {
				view.drawGraph();
			});
		}
	});

});
