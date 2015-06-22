/*global define: true */
define([
	'underscore',
	'moment',
	'backbone',
	'Models/Constants',
	'text!Templates/PatientInfo.html'
], function (_, moment, Backbone, Constants, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),
		_analystMode: null,

		initialize: function () {
			this._analystMode = this.options.analystMode;
			this._showProjects = this.options.showProjects;
		},
		render: function () {
			this.$el.html(this.template({
				moment: moment,
				model: this.model,
				analystMode: this._analystMode,
				Constants: Constants,
				showProjects: this._showProjects
			}));
			return this;
		},
		embed: function ($el) {
			$el.after(this.template({
				moment: moment,
				model: this.model,
				analystMode: this._analystMode,
				Constants: Constants,
				showProjects: this._showProjects
			}));
			$el.parent().find('.content-container h1, .content-container .user-container').remove();
		},
		remove: function () {
			// Call base implementation
			Backbone.View.prototype.remove.apply(this, arguments);
		}
	});
});
