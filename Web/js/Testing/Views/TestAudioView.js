define([
	'backbone',
	'text!Testing/Templates/TestAudio.html'
], function (Backbone, templateHtml) {
	'use strict';

	// Container for audio tags used for tests
	return Backbone.View.extend({
		tagName: "div",
		className: "test-audio",

		template: _.template(templateHtml),

		initialize: function () {
			this.render();
		},

		render: function () {
			this.$el.html(this.template());
			return this;
		}
	});
});