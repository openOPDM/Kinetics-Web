/*global define: true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'Models/Constants',
	'Models/UserProfile',
	'DataLayer/ModelSyncExtension',
	'DataLayer/ServerCommandExecutor',
	'DataLayer/ServerInteractionSerializersHash'
], function ($, _, Backbone, Constants, UserProfile, ModelSyncExtension, ServerCommandExecutor, ServerInteractionSerializersHash) {
	'use strict';

	// Collection of users profiles
	var PatientProfileCollection = Backbone.Collection.extend({
		model: UserProfile,
		comparator: function (x, y) {
			var xx = x.get("creationDate");
			var yy = y.get("creationDate");
			return xx > yy ? -1 : (xx < yy ? 1 : 0);
		},

		fetch: function (options) {
			if (options) {
				var search = $.trim(options.search);
			}

			if (!options.searchBy) {
				options.searchBy = Constants.UserListSearchToken.Summary;
			}
			this.syncCommands.read = ServerInteractionSerializersHash.AccountManager.findPatient;  //find patient
			// Call base implementation
			Backbone.Collection.prototype.fetch.call(this, options);
		}

	});

	ModelSyncExtension.extend(PatientProfileCollection.prototype);

	return PatientProfileCollection;
});
