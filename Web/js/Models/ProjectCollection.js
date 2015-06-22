/*global define: true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'Models/Constants',
	'Models/Project',
	'DataLayer/ModelSyncExtension',
	'DataLayer/ServerCommandExecutor',
	'DataLayer/ServerInteractionSerializersHash'
], function ($, _, Backbone, Constants, Project, ModelSyncExtension, ServerCommandExecutor, ServerInteractionSerializersHash) {
	'use strict';

	// Collection of users profiles
	var ProjectCollection = Backbone.Collection.extend({
		model: Project /*,
		comparator: function (x, y) {
			var xx = x.get("creationDate");
			var yy = y.get("creationDate");
			return xx > yy ? -1 : (xx < yy ? 1 : 0);
		}*/
	});

	ModelSyncExtension.extend(ProjectCollection.prototype, {
		read: ServerInteractionSerializersHash.ProjectManager.getProjectInfoList
	});

	return ProjectCollection;
});
