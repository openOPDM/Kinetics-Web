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
	var AnalystPatientsCollection = Backbone.Collection.extend({
		model: UserProfile,
		comparator: function (x, y) {
			var xx = x.get("creationDate");
			var yy = y.get("creationDate");
			return xx > yy ? -1 : (xx < yy ? 1 : 0);
		},

		fetch: function (options) {
			this.syncCommands.read = ServerInteractionSerializersHash.AccountManager.getPatients;
			// Call base implementation
			Backbone.Collection.prototype.fetch.call(this, options);
		}

	});

	ModelSyncExtension.extend(AnalystPatientsCollection.prototype);

	return AnalystPatientsCollection;
});
