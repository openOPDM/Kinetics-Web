/*global define:true */
define([
	'jQuery',
	'backbone',
	'underscore',
	'text!Templates/AlertDialog.html',
	'text!Templates/ConfirmDialog.html',
	'text!Templates/PromptDialog.html'
], function ($, Backbone, _, AlertDialogHtml, ConfirmDialogHtml, PromptDialogHtml) {
	"use strict";
	return Backbone.View.extend({
		tagName: "div",
		className: "universal-dialog",
		el: 'dialog-container',

		alertTemplate: _.template(AlertDialogHtml),
		confirmTemplate: _.template(ConfirmDialogHtml),
		promptTemplate: _.template(PromptDialogHtml),

		events: {
			"click .id-ok": "_onOk",
			"click .id-cancel": "_onCancel"
		},

		initialize: function () {
			var that = this,
				el = 'dialog-container';
			this.$el = $('#' + el);
			if (!this.$el.length) {
				this.$el = $('<div/>').attr('id', el).hide()
					.addClass(this.className)
					.appendTo('body')
					.dialog({
						modal: true,
						close: function () {
							that._onCancel();
						},
						autoOpen: false,
						minHeight: 10,
						width: 400
					});
			}
		},

		show: function (mode, message, eventPrefix) {
			var template;
			this._mode = mode;
			this._eventPrefix = eventPrefix || '';
			switch (mode) {
			case 'alert':
				template = this.alertTemplate;
				break;
			case 'confirm':
				template = this.confirmTemplate;
				break;
			case 'prompt':
				template = this.promptTemplate;
				break;
			default:
				console.log('No dialog type was chosen');
				return this;
			}

			this.$el.addClass(mode).html(template({
				message: message
			}));

			this.$el.find('a').button();

			this.$el.dialog('open');
			return this;
		},

		_onCancel: function () {
			this.$el.removeClass('alert, confirm, prompt').dialog('close');
			this._eventPrefix = '';
		},

		_onOk: function () {
			if (this._mode === 'confirm') {
				this.trigger(this._eventPrefix + '-confirmed');
			}
			if (this._mode === 'prompt') {
				this.trigger(this._eventPrefix + '-prompted', this.$el.find('.id-prompt-input').val());
			}

			this.$el.dialog('close').removeClass('alert confirm prompt');
			this._eventPrefix = '';
		},

		remove: function () {
			// Call base implementation
			Backbone.View.prototype.remove.apply(this, arguments);
		}
	});
});