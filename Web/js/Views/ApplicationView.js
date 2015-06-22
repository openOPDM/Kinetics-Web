/*global define: true */
define([
	'jQuery',
	'backbone',
	'Views/HeaderView',
	'DataLayer/Constants',
	'hashchage'
], function ($, Backbone, HeaderView, constants) {
	'use strict';

	return Backbone.View.extend({
		el: $("#main-container"),

		initialize: function () {
			var that = this;
			if (!this.model) {
				throw new Error("Model not set.");
			}
			var accountManager = this.model.accountManager;
			if (!accountManager) {
				throw new Error("Account manager not set in the model.");
			}

			this.header = new HeaderView({ model: { accountManager: accountManager } });
			this.render();

			if (constants.analytics) {

				window._gaq = window._gaq || [];
				window._gaq.push(['_setAccount', constants.analyticsId]);
				//_gaq.push(['_trackPageview']);

				(function () {
					var ga = document.createElement('script');
					ga.type = 'text/javascript';
					ga.async = true;
					ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
					var s = document.getElementsByTagName('script')[0];
					s.parentNode.insertBefore(ga, s);
				})();

				this.trackPage();

				$(window).hashchange(function () {
					that.trackPage();
				});
			}

			$(document)
				.ajaxStart(this._ajaxRequestStart)
				.ajaxStop(this._ajaxRequestStop)
				.ajaxError(this._ajaxRequestStop);


			if ('WebkitAppearance' in document.documentElement.style && navigator.userAgent.indexOf('Android') >= 0 && navigator.userAgent.indexOf('Chrome') === -1) {
				$('body').addClass('android-native');
			}
		},

		render: function () {
			this.$el.append(this.header.render().el);
		},

		trackPage: function () {
			try {
				window._gaq.push(['_trackPageview', location.pathname + location.search + location.hash]);
				//console.info('really tracked');
			} catch (e) {
				//console.info('not really tracked');
			}
		},

		showView: function (view) {
			this.$el.append(view.render().el);
		},

		updateView: function (view) {
			this.$el.find('>.content-wrapper').remove();
			this.showView(view);
		},

		_ajaxRequestStart: function () {
			$('body').addClass('ajaxRequestInProcess');
		},

		_ajaxRequestStop: function () {
			$('body').removeClass('ajaxRequestInProcess');
		}

	});
});