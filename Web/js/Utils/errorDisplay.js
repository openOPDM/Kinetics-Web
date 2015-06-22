/*global define:true */
define([
	'jQuery',
	'underscore',
	'text!Templates/NoConnectionError.html'
], function ($, _, noConnectionError) {
	"use strict";
	return {
		templates: {
			noConnection: _.template(noConnectionError)
		},
		el: 'error-container',
		container: null,
		show: function (error) {
			this.container = $('#' + this.el);
			var errorText,
				errorMessage;
			if (!this.container.length) {
				this.container = $('<div id="' + this.el + '" class="flash-error"></div>').appendTo('body');
			}
			if (this.container.children('.' + error).length) {
				return;
			}

			switch (error) {
			case 'no-connection' :
				errorText = this.templates.noConnection();
				break;
			}
			errorMessage = $('<div class="error"></div>').addClass(error).hide().html(errorText).appendTo(this.container);
			if (this.container.children('.error').length > 1) {
				errorMessage.fadeIn();
			} else {
				errorMessage.show();
				this.container.fadeIn();
			}


		},
		hide: function (error) {
			var that = this;
			if (this.container) {
				if (!error || this.container.children('.error').length) {
					this.container.fadeOut(function () {
						that.container.children().remove();
					});
				} else {
					this.container.children('.' + error).fadeOut(function () {
						$(this).remove();
					});
				}
			}

		}
	};
});