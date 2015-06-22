/*global define: true */
define([
	'jQuery',
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Views/SharePopupView',
	'Models/Sharing',
	'Views/Constants',
	'Models/ExtensionsCollection',
	'Utils/Dialog'
], function ($, _, Constants, ControllerBase, SharePopupView, SharePoup, ViewsConstants, ExtensionsCollection, Dialog) {
	'use strict';

	return ControllerBase.extend({

		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			_.bindAll(this, "_fetchShared", "_initializeView");

			this.dialog = new Dialog();
		},

		activate: function (options) {

			this.model = new SharePoup({
				id: options && options.id || null,
				token: options && options.token || null
			});

			//this._fetchShared();
			this._initializeView();

		},

		_fetchShared: function () {
			var options = this._getFetchOptions(true, this._initializeView, this._fetchShared);
			this.model.fetch(options);
		},

		_initializeView: function () {
			this.view = new SharePopupView({
				model: this.model
			});

			this.listenTo(this.view, {
				'save-shared': this._onSaveShared,
				'close-popup': this._closePopup,
				'start-email-share': this._startEmailShare
			});

			this.view.render();
			this._initPopup();
		},

		_initPopup: function () {
			var that = this;

			$('.share-container').html(this.view.$el).dialog({
				modal: true,
				width: 575,
				close: function () {
					that.view._closePopup();
					$('.share-container').dialog('destroy');
				}
			});
		},

		_onSaveShared: function (model, shareData) {
			this._save(model, {'shareData': shareData});
		},

		_save: function (model, attributes) {
			//todo this should not be a "save" method
			var that = this;
			model.save(attributes, {
				validate: false,
				accountManager: this.get("accountManager"),
				errorOther: function (models, xhr, options) {
					that.trigger("error", options.responseError);
				},
				errorUnauthenticated: function () {
					that._sleep(_.bind(that._onSaveShared, that, model, attributes));
				},
				success: function () {
					that._onSuccess();
				}
			});
		},

		_closePopup: function () {
			$('.share-container').dialog('close');
		},

		_onSuccess: function () {
			$('.share-container').dialog('close');
			this.get("accountManager").trigger('updated-shares');
			this.model.trigger('shared-save-success');
		},

		_startEmailShare: function () {
			this._closePopup();

			this.view = new SharePopupView({
				model: this.model,
				mode: 'email'
			});

			this.listenTo(this.view, {
				'share-email': this._shareEmail
			});

			this.view.render();
			this._initPopup();

		},

		_shareEmail: function (email, message) {
			var that = this;

			this.model.shareByMail({
				email: email,
				message: message,
				accountManager: this.get("accountManager"),
				success: function () {
					that._closePopup();
					that.dialog.show('alert', 'Invitations were sent.');
				}
			});
		}

	});
});
