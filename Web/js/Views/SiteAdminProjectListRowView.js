/*global define:  true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'DataLayer/ErrorConstants',
	'text!Templates/SiteAdminProjectListRow.html'
], function (_, Backbone, ModelsConstants, ErrorConstants, templateHtml, templateConfirmationHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "result-row",
		template: _.template(templateHtml),
		templateConfirmation: _.template(templateConfirmationHtml),

		events: {
			"click .id-button-disable": "_onClickDisable",
			"click .id-button-manage": "_onClickManage",
			"click .id-name span": "_onClickName",
			"keypress .id-name input": "_onNameKeypress",
			"blur .id-name input": "_onNameBlur"
		},

		initialize: function () {
			this.listenTo(this.model, {
				"change": this.render,
				"error": this._onError
			});
		},

		render: function () {
			this.$el.html(this.template({
				model: this.model,
				Constants: ModelsConstants
			}));

			return this;
		},

		_onError: function (error) {
			var errorMessage = this.$('.id-name .validationErrors').length ?
				this.$('.id-name .validationErrors') :
				$('<div class="validationErrors"></div>');

			errorMessage.insertAfter(this.$('.id-name input')).hide().html(error.description).slideDown();

			setTimeout(function () {
				errorMessage.slideUp(function () {
					$(this).remove();
				});
			}, 2000);

			this._onNameBlur();

		},

		_onClickDisable: function () {
			this.model.trigger("disable", this.model);
		},

		_onClickName: function () {
			var $span = this.$('.id-name span'),
				$input = $span.siblings('input').length ? $span.siblings('input') : $('<input>').insertAfter($span);
			$span.hide();
			$input.attr('disabled', false).val($span.text()).show().focus();
		},

		_onNameBlur: function () {
			var $input = this.$('.id-name input'),
				$span = $input.siblings('span');

			$input.hide().val('');
			$span.show();
		},

		_onNameKeypress: function (e) {
			var $input = this.$('.id-name input');
			if (+e.keyCode === 13) {
				$input.attr('disabled', true);
				this.model.trigger("rename", this.model, $input.val());
			}

			if (+e.keyCode === 27) { //doesn't work for some reason
				this._onNameBlur();
			}
		},

		_onClickManage: function () {
			this.model.trigger('manage-project', this.model.get('id'));
		}

	});
});