/*global define:true */
define([
	'underscore',
	'backbone',
	'text!Templates/ConfirmSuccess.html'
], function (_, Backbone, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),

		events: {
			"click .id-button-to-account": "_onNavigateByLink"
		},

		initialize: function () {
			this.listenTo(this.model, {
				"change:remainedSeconds": this._updateTimer
			});
		},

		render: function () {
			this.$el.html(this.template(this.model.attributes));
			this.$remainedSeconds = this.$(".id-remained-seconds");
			this.$remainedSecondsPluralEnds = this.$(".id-remained-seconds-ends");

			this._updateTimer(this.model, this.model.get("remainedSeconds"));

			return this;
		},

		_updateTimer: function (model, remainedSeconds) {
			this.$remainedSeconds.html(remainedSeconds);
			if (remainedSeconds == 1) {
				this.$remainedSecondsPluralEnds.hide();
			} else {
				this.$remainedSecondsPluralEnds.show();
			}
		},

		_onNavigateByLink: function () {
			this.model.stop();

			// Prevent navigation by hyperlink
			return false;
		}
	});
});
