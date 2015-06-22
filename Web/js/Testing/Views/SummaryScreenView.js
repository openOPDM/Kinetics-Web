/*global define:  true */
define([
	'underscore',
	'Testing/Views/ScreenViewBase',
	'Utils/Dialog',
	'text!Testing/Templates/SummaryScreen.html',
	'text!Testing/Templates/SummaryScreenSubmitConfirmation.html',
	'text!Testing/Templates/SummaryScreenCancelConfirmation.html',
	'text!Testing/Templates/SummaryScreenRegisterConfirmation.html',

	'Utils/AudioHelper'
], function (_, ScreenViewBase, Dialog, templateHtml, templateSubmitConfirmationHtml, templateCancelConfirmationHtml, templateRegisterConfirmationHtml, sound) {
	'use strict';

	return ScreenViewBase.extend({
		template: _.template(templateHtml),
		templateSubmitConfirmation: _.template(templateSubmitConfirmationHtml),
		templateCancelConfirmation: _.template(templateCancelConfirmationHtml),
		templateRegisterConfirmation: _.template(templateRegisterConfirmationHtml),

		events: {
			"click .id-button-back": "_onBack",
			"click .id-button-submit": "_onSubmit",
			"click .id-button-cancel": "_onCancel",

            "click .id-button-register": "_onRegister",


			"click .id-valid .tick": "_onCheckedValid"
		},

		render: function () {
			// Call base implementation
			ScreenViewBase.prototype.render.call(this);
			this.$notes = this.$(".id-notes");
			this.$valid = this.$(".id-valid .tick");
			sound.play('test-sound-submit');
		},

		// Overridden for initial UI update by model attributes
		_onActivated: function () {
			var that = this;
			// Call base implementation
			ScreenViewBase.prototype._onActivated.call(this);
			this._updateValid(this.model.get("sessionResults").get("valid"));
			if (!this.dialog) {
				this.dialog = new Dialog();
				this.listenTo(this.dialog, {
					'cancel-confirmation-confirmed': function () {
						that._updateModel();
						that.model.cancelPressed();
					},
					'submit-confirmed': function () {
						that._updateModel();
						that.model.submitPressed();
					}
				});
			}
		},

		_updateValid: function (valid) {
			this.$valid.hasClass("checked");
			if (valid) {
				this.$valid.addClass("checked");
			} else {
				this.$valid.removeClass("checked");
			}
		},

		_onBack: function () {
			this._updateModel();
			this.model.backPressed();
			sound.pause('test-sound-submit');
		},

		_onSubmit: function () {
			this.dialog.show('confirm', this.templateSubmitConfirmation(), 'submit');
		},

		_onCancel: function () {
			this.dialog.show('confirm', this.templateCancelConfirmation(), 'cancel-confirmation');
		},

        _onRegister: function () {
			this._updateModel();
			this.model.registerPressed();
		},

        _onExit: function () {
            //todo: goto landing page
        },


		_onCheckedValid: function () {
			this.$valid.toggleClass("checked");
		},

		_updateModel: function () {
			this.model.get("sessionResults").set({
				"notes": this.$notes.val(),
				"valid": this.$valid.hasClass("checked")
			});
		}
	});

});
