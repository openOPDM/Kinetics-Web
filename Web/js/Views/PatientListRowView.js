/*global define:  true */
define([
	'underscore',
	'moment',
	'backbone',
	'Models/Constants',
	'text!Templates/AddPatientRow.html'
], function (_, moment, Backbone, ModelsConstants, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "result-row",
		template: _.template(templateHtml),

		events: {
			"click .id-add-patient": "_onAddPatient"
		},

		initialize: function () {
			this.listenTo(this.model, "change", this.render);
		},

		render: function () {
			this.$el.html(this.template({
				model: this.model,
				moment: moment,
				Constants: ModelsConstants
			}));

			return this;
		},

		_onAddPatient: function () {
			this.model.trigger("add-patient", this.model);
		}
	});
});