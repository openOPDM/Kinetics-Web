/*global define:true */
define([
	'backbone',
	'underscore',
	'Models/TestSessionResultsRow',
	'DataLayer/ModelSyncExtension',
	'DataLayer/ServerInteractionSerializersHash',
	'DataLayer/MultiDeletionCollectionExtension',
	'DataLayer/ServerCommandExecutor'
], function (Backbone, _, TestSessionResultsRow, ModelSyncExtension, ServerInteractionSerializersHash, MultiDeletionCollectionExtension, ServerCommandExecutor) {
	'use strict';

	// Collection of test session results mapped to server object.
	var TestSessionResultsRowCollection = Backbone.Collection.extend({
		model: TestSessionResultsRow,

		initialize: function (models, options) {
			this.userId = options.userId;
			this.project = options.project;

			// Initialize sync command
			switch (true) {
			case !!this.userId && !!this.project:
				this.syncCommands.read = ServerInteractionSerializersHash.TestSessionManager.getAllShared;
				break;
			case !!this.userId:
				this.syncCommands.read = ServerInteractionSerializersHash.TestSessionManager.getAllForUser;
				break;
			default:
				this.syncCommands.read = ServerInteractionSerializersHash.TestSessionManager.getAll;
			}
		},

		comparator: function (x, y) {
			var xx = x.get("creationDate");
			var yy = y.get("creationDate");
			return xx > yy ? -1 : (xx < yy ? 1 : 0);
		},

		updateIsValid: function (ids, valid, options) {
			_.extend(options, {
				ids: ids,
				valid: valid
			});
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.TestSessionManager.modifyStatus, options);
		}
	});

	// Extend collection with data layer features
	MultiDeletionCollectionExtension.extend(TestSessionResultsRowCollection.prototype);

	ModelSyncExtension.extend(TestSessionResultsRowCollection.prototype, {
		'delete': ServerInteractionSerializersHash.TestSessionManager['delete']
	});

	return TestSessionResultsRowCollection;
});
