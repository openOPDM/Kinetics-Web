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
	'Utils/StringExtensions',
	'backbone.localStorage'
], function (moment, Backbone, _, Constants, ErrorConstants, DataConstants, ModelSyncExtension, ServerInteractionSerializersHash, ServerCommandExecutor, StringExtensions) {
	'use strict';

	var Project = Backbone.Model.extend({
		defaults: {
			projectId: null,
			projectName: null,
			status: null
		},

		localStorage: new Backbone.LocalStorage("kinetics-Project"),

		validate: function (attrs, options) {
			options = options || {};
			var errors = [];

			if (StringExtensions.isTrimmedEmpty(attrs.projectName)) {
				errors.push(ErrorConstants.Validation.EmptyProjectName);
			}

			if (errors.length > 0) {
				return errors;
			}
		},

		toJSON: function (options) {
			var result = Backbone.Model.prototype.toJSON.call(this, options);

			if (options.local) {
				result = _.pick(result,
					"projectName",
					"email",
					"passHash"
				);
			}

			return result;
		},

		modifyProjectStatus: function (accountManager) {
			var that = this,
				disable = this.get('status') === Constants.ProjectStatus.Active;

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.ProjectManager.modifyProjectStatus, {
				accountManager: accountManager,
				sessionToken: accountManager.getSessionToken(),
				disable: disable,
				id: this.get('id'),
				success: function () {
					if (disable) {
						that.set({status: Constants.ProjectStatus.Disabled});
					} else {
						that.set({status: Constants.ProjectStatus.Active});
					}
				},
				error: null
			});
		},
		modifyProjectInfo: function (name, accountManager) {
			var that = this;

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.ProjectManager.modifyProjectInfo, {
				accountManager: accountManager,
				sessionToken: accountManager.getSessionToken(),
				name: name,
				id: this.get('id'),
				success: function () {
					that.set({name: name});
				},
				error: function (model, xhr, options) {
					that.trigger("error error:rename", options.responseError, options);
				}
			});
		},

		getProjectInfoById: function (options) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.ProjectManager.getProjectInfoById, {
				accountManager: options.accountManager,
				sessionToken: options.accountManager.getSessionToken(),
				id: options.id,
				success: options.success,
				error: options.error
			});
		}


	});

	// Extend instance with server command to get/update information only for current user
	ModelSyncExtension.extend(Project.prototype, {
		create: ServerInteractionSerializersHash.ProjectManager.createProject,
		'delete': ServerInteractionSerializersHash.ProjectManager.deleteProject
	});

	return Project;
});
