/*global define: true */
define([
	'moment',
	'backbone',
	'underscore',
	'Models/Constants',
	'Models/ErrorConstants',

	'DataLayer/Constants',
	'DataLayer/ModelSyncExtension',
	'DataLayer/ServerInteractionSerializersHash',
	'DataLayer/ServerCommandExecutor',
	'Utils/StringExtensions'

], function (moment, Backbone, _, Constants, ErrorConstants, DataConstants, ModelSyncExtension, ServerInteractionSerializersHash, ServerCommandExecutor, StringExtensions) {
	'use strict';

	var SharePopup = Backbone.Model.extend({
		defaults: {
			id: null,
			shareData: null
		},

		initialize: function () {
		},


		validateEmail: function (email, emailList) {
			var error = null;
			if (StringExtensions.isTrimmedEmpty(email)) {
				error = ErrorConstants.Validation.EmptyEMail;
			} else if (!email.match(Constants.EmailPattern)) {
				error = ErrorConstants.Validation.InvalidEMail;
			} else if (emailList.indexOf(email) >= 0) {
				error = ErrorConstants.Validation.EMailIsNotUnique;
			}

			return {error: error};
		},


		fetch: function (options) {
			var success = options.success;
			options.success = function (model, xhr, options) {
				if (success) {
					success(model, xhr, options);
				}
			};
			// Call base implementation
			Backbone.Model.prototype.fetch.call(this, options);
		},

		getAll: function (options) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.SharingManager.getAllShareInfo, {
				accountManager: options.accountManager,
				sessionToken: options.accountManager.getSessionToken(),
				success: options.success
			});
		},

		unshare: function (options) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.SharingManager.removeEmail, {
				accountManager: options.accountManager,
				sessionToken: options.accountManager.getSessionToken(),
				email: options.email,
				success: options.success
			});
		},

		dropToken: function (options) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.SharingManager.dropToken, {
				accountManager: options.accountManager,
				sessionToken: options.accountManager.getSessionToken(),
				id: options.id,
				success: options.success
			});
		},

		leaveShare: function (options) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.SharingManager.leaveTests, {
				accountManager: options.accountManager,
				sessionToken: options.accountManager.getSessionToken(),
				user: options.user,
				project: options.project,
				success: options.success
			});
		},

		checkToken: function (options) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.SharingManager.checkToken, {
				accountManager: options.accountManager,
				sessionToken: options.accountManager.getSessionToken(),
				user: options.user,
				id: options.id,
				success: options.success
			});
		},

		generateToken: function (options) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.SharingManager.generateToken, {
				accountManager: options.accountManager,
				sessionToken: options.accountManager.getSessionToken(),
				user: options.user,
				id: options.id,
				success: options.success,
				error: options.error
			});
		},

		shareByMail: function (options) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.SharingManager.shareByMail, {
				accountManager: options.accountManager,
				sessionToken: options.accountManager.getSessionToken(),
				message: options.message,
				email: options.email,
				urlPath: 'http://' + window.location.hostname + '/kineticsweb/#shared-test/' + this.get('token'),
				success: options.success,
				error: options.error
			});
		}


	});

	ModelSyncExtension.extend(SharePopup.prototype, {
		read: ServerInteractionSerializersHash.SharingManager.getAllShareInfo,
		create: ServerInteractionSerializersHash.SharingManager.addEmail,
		update: ServerInteractionSerializersHash.SharingManager.addEmail
//        'delete': ServerInteractionSerializersHash.ShareManager.deleteShare
	});

	return SharePopup;
});