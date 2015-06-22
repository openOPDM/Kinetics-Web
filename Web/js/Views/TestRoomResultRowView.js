/*global define: true */
define([
	'underscore',
	'jQuery',
	'moment',
	'backbone',
	'DataLayer/Constants',
	'text!Templates/TestRoomResultRow.html'
], function (_, $, moment, Backbone, Constants, templateHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "result-row",
		template: _.template(templateHtml),

		events: {
			"click .test-checkbox": "_onSelected",
			"click .id-button-detail": "_onClickDetail",
			"click .id-button-share": "_onClickShare",
			"click .test-valid": "_onClickValid"
		},

		_adminMode: false,

		initialize: function (options) {
			this._adminMode = options.adminMode;
			this._ownRoom = options.ownRoom;
			this._readOnly = options.readOnly;
			this.listenTo(this.model, "change:isValid", this._updateValid);
		},

		adminMode: function () {
			return this._adminMode;
		},

		// Get/Set row selection flag
		selected: function (value) {
			if (value === undefined) {
				return this.$selectCheckBox.hasClass("checked");
			} else {
				if (value) {
					this.$selectCheckBox.addClass("checked");
				} else {
					this.$selectCheckBox.removeClass("checked");
				}
			}
		},

		render: function () {
			this.$el.html(this.template({
				model: this.model,
				moment: moment,
				ownRoom: this._ownRoom,
				readOnly: this._readOnly,
				isAvanir: Constants.branding === "Avanir"
			}));

			this.$selectCheckBox = this.$(".test-checkbox .tick");

			var $valid = this.$(".id-valid");

			if (this.adminMode()) {
				$valid.removeClass("test-valid-ro");
			} else {
				$valid.removeClass("test-valid");
			}

			this.$validTick = $valid.find(".tick");
			if (this.model.get("isValid")) {
				this.$validTick.addClass("checked");
			}

			return this;
		},

		_onSelected: function () {
			this.$selectCheckBox.toggleClass('checked');
		},

		_onClickDetail: function () {
			this.model.trigger("detail", this.model);
		},

		_onClickShare: function () {
			this.model.trigger("shareTest", this.model.get('id'));
		},

		_onClickValid: function () {
			var isValid = this.model.get("isValid");
			this.model.set("isValid", !isValid);
		},

		_updateValid: function (model, isValid) {
			if (isValid) {
				this.$validTick.addClass("checked");
			} else {
				this.$validTick.removeClass("checked");
			}
		}
	});
});