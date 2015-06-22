define([
	'backbone',
	'text!Testing/Templates/NavigationTestDetailsView.html'
], function (Backbone, templateHtml) {
	'use strict';

	//TODO make it with NavigationPanelItemViewBase to be inherited from the same component

	var NavigationTestDetailsView = Backbone.View.extend({
		tagName: "div",
		className: "test-nav-row",
		template: _.template(templateHtml),

		initialize: function () {

			this.listenTo(this.model, {
				"state:activated": this._onActivated,
				"state:deactivated": this._onDeactivated
			});

			this.render();
		},

		render: function () {
			this.$el.html(this.template());
			return this;
		},

		_onActivated: function () {
			this.$el.addClass("active");
		},

		_onDeactivated: function () {
			this.$el.removeClass("active");
		}

	});

	return NavigationTestDetailsView;
});
