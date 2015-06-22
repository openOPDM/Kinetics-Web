/*global define: true */
define([
	'backbone',
	'underscore',
	'text!Templates/PrivacyPolicy.html',
    'text!Templates/TermsOfService.html',
    'text!Templates/EULA.html'
], function (Backbone, _, templatePP, templateToS, templateEULA) {
	'use strict';

    var PAGES = {
        "privacy-policy": templatePP,
        "terms-of-service": templateToS,
        "eula": templateEULA
    };

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper info-page",
		template: _.template(templatePP),

		events: {
		},

		initialize: function (params) {
            this.template = _.template(PAGES[params.page]);
		},

		remove: function () {
			// Call base implementation
			Backbone.View.prototype.remove.apply(this, arguments);
		},

		render: function () {
			this.$el.html(this.template());
			return this;
		}
	});

});
