define([
	'underscore',
	'backbone'
], function (_, Backbone) {
	'use strict';

	// NOTE: View should be created one for one test session then should be destroyed
	return Backbone.View.extend({
		tagName: "div",
		className: "test-nav-row",

		initialize: function () {
			this.listenTo(this.model, {
				"state:activated": this._onActivated,
				"state:deactivated": this._onDeactivated
			});
		},

		render: function () {
			this.$el.html(this.template(this.model));
			this.$score = this.$(".test-nav-score");
			return this;
		},

		_updateScore: function (scoreValue) {
			// Format number value
			if (_.isNumber(scoreValue)) {
				scoreValue = scoreValue.toFixed(2);
			}
			this.$score.html(scoreValue);
		},

		_onActivated: function () {
			this.$el.addClass("active");
		},

		_onDeactivated: function () {
			this.$el.removeClass("active");
		}
	});

});
