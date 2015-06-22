/*global define: true */
define([
	'underscore',
	'backbone',
	'text!Templates/TestSessionCustomFieldsReportView.html'
], function (_, Backbone, templateHtml) {
	'use strict';

	return Backbone.View.extend({

		template: _.template(templateHtml),

		events: {
		},

		initialize: function (options) {

		},

		render: function () {

			this.$el.html(this.template());

			this.$contextContainer = this.$(".content-container");

			var self = this;
			_.each(this.model.get('extension'), function (item) {
				if (item.value === '') {
					item.value = '-';
				}
				//todo refactor this; there should be no
				self.$contextContainer.append('<div class="list-row"><div class="list-row-label">' + item.name + '</div> <div class="list-row-text">' + item.value + '</div></div>');
			});
			return this;
		}
	});

});
