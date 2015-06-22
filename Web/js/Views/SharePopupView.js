/*global define:true */
define([
	'underscore',
	'backbone',
	'Models/Constants',
	'Utils/Dialog',
	'text!Templates/SharePopup.html',
	'text!Templates/SocialSharePopup.html',
	'text!Templates/SendEmailPopup.html'
], function (_, Backbone, ModelsConstants, Dialog, templateHtml, socialTemplateHtml, sendEmailTemplateHtml) {
	'use strict';

	var fadeSpeed = 300;

	return Backbone.View.extend({
		tagName: "div",
		className: "share-popup",
		template: _.template(templateHtml),
		socialTemplate: _.template(socialTemplateHtml),
		sendEmailTemplate: _.template(sendEmailTemplateHtml),
		currentUser: null,

		ui: {
			$listContainer: 'ul',
			errorClass: 'sign-row-error',
			successClass: 'sign-row-success',
			messages: {
				success: 'Your test room was shared successfully',
				error: 'Test share properties update failed. Please, try later'
			}
		},


		events: {
			"click .id-remove-email": "_removeEmail",
			"click .id-button-share": "_shareTest",
			"click .id-button-add": "_addEmail",
			"keydown .id-add-email": "_addEmailOnEnter",
			"click .id-close": "_onClosePopup",
			"click #id-share-fb": "_shareFacebook",
			"click #id-share-twitter": "_shareTwitter",
			"click #id-share-google-plus": "_shareGooglePlus",
			"click #id-share-email": "_shareEmail",
			"click .id-button-send-email": "_sendEmails",
			"click .id-preview-link": function (e) {
				e.preventDefault();
				return false;
			}
		},

		initialize: function (options) {
			this.mode = options.mode;
			this.listenTo(this.model, {
				'shared-save-success': this._onShareSuccess,
				'error': this._onError
			});
			this.dialog = new Dialog();
		},

		render: function () {

			switch (true) {
			case this.mode === 'email':
				this.$el.html(this.sendEmailTemplate({
					Constants: ModelsConstants,
					model: this.model
				}));
				break;
			case !!this.model.get('token'):
				this.$el.html(this.socialTemplate({
					Constants: ModelsConstants,
					model: this.model
				}));
				break;
			default:
				this.$el.html(this.template({
					Constants: ModelsConstants,
					model: this.model
				}));
				break;
			}

			this.$emailList = this.$(this.ui.$listContainer);
			this.$email = this.$('.id-add-email');
			this.$errorContainer = this.$('.errorContainer');
			this.$testShareLink = this.$("#id-test-share-link");
			this.$emailBody = this.$('.id-email-text');

			return this;
		},

		_hideErrorsAndStatuses: function () {
			this.$errorContainer.removeClass(this.ui.successClass).removeClass(this.ui.errorClass).hide();
		},

		_onShareSuccess: function () {
			this.dialog.show('alert', this.ui.messages.success);
		},

		_onError: function (errorMessage) {
			this.$errorContainer.show()
				.addClass(this.ui.errorClass).removeClass(this.ui.successClass)
				.text(errorMessage || this.ui.messages.error);
		},

		_removeEmail: function (e) {
			var $item = $(e.currentTarget).closest('li');
			this._hideErrorsAndStatuses();

			$item.find('*').unbind();
			$item.fadeOut(fadeSpeed);
			setTimeout(function () {
				$item.remove();
			}, fadeSpeed * 1.2);
			console.log('remove Email');
		},

		_addEmailOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._addEmail();
			}
		},

		_addEmail: function () {
			var newItemValue = this.$email.val(),
				emailValidation = this.model.validateEmail(newItemValue, this.getEmailList());

			this._hideErrorsAndStatuses();

			if (!emailValidation.error) {
				var $newItem = this.$emailList.find('._proto_').clone();
				$newItem.removeAttr('class')
					.appendTo(this.$emailList)
					.find('span').text(newItemValue);
				this.$email.val('');
			} else {
				this._onError(emailValidation.error.description);
			}
		},

		getEmailList: function () {
			var shareData = [];
			this.$emailList.find('>*:not(._proto_)').each(function (e) {
				shareData.push($(this).find('span').text());
			});
			return shareData;
		},

		_shareTest: function () {
			this._hideErrorsAndStatuses();
			this.trigger('save-shared', this.model, this.getEmailList());
		},

		_shareFacebook: function () {
			var link = "http://www.facebook.com/share.php?u={0}".format(encodeURIComponent(this.$testShareLink.val()));
			this.openShareWindow(link);
		},

		_shareTwitter: function () {
			var link = "https://twitter.com/share?url={0}".format(encodeURIComponent(this.$testShareLink.val()));
			this.openShareWindow(link);
		},

		_shareGooglePlus: function () {
			var link = "https://plus.google.com/share?url={0}".format(encodeURIComponent(this.$testShareLink.val()));
			this.openShareWindow(link);
		},

		openShareWindow: function (url) {
			try {
				var width = 550,
					height = 286,
					screenHeight = window.innerHeight,
					screenWidth = window.innerWidth,
					left = Math.round((screenWidth / 2) - (width / 2)),
					top = 0;
				if (screenHeight > height) {
					top = Math.round((screenHeight / 2) - (height / 2));
				}
				var k = window.open(url, "", "left=" + left + ",top=" + top + ",width=" + width + ",height=" + height + ",personalbar=0,menubar=0,toolbar=0,scrollbars=1,resizable=1");
				k.focus();
			} catch (h) {
				console.log("Error happened while opening share window.");
			}
		},

		_onClosePopup: function () {
			this.trigger('close-popup');
		},

		_closePopup: function () {
			this.$el.find('*').unbind();
			this.$el.parent().html('');
		},

		_shareEmail: function () {
			this.trigger('start-email-share');
		},

		_sendEmails: function () {
			var message = this.$emailBody.val().replace(/\n/g, "<br/>");
			this.trigger('share-email', this.getEmailList(), message);
		}
	});
});
