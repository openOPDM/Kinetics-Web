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
	var UserProfileCollection = Backbone.Collection.extend({
		model: UserProfile,
		comparator: function (x, y) {
			var xx = x.get("email");
			var yy = y.get("email");
			return xx > yy ? -1 : (xx < yy ? 1 : 0);
		},

		fetch: function (options) {
			if (options) {
				var search = $.trim(options.search);
				options.search = search != "" ? search : null;
			}

			if (options && options.search) {
				if (!options.searchBy) {
					options.searchBy = Constants.UserListSearchToken.Summary;
				}
				this.syncCommands.read = ServerInteractionSerializersHash.AccountManager.findUser;
			} else {
				this.syncCommands.read = ServerInteractionSerializersHash.AccountManager.getUserInfoList;
			}

			// Call base implementation
			Backbone.Collection.prototype.fetch.call(this, options);
		},

		block: function (ids, block, options) {
			options = options || {};

			var success = options.success;
			options.success = function (collection, resp, options) {
				var affectedModels = collection.filter(function (model) {
					return _.indexOf(ids, model.id) >= 0;
				});

				var status = block ? Constants.UserStatus.Disabled : Constants.UserStatus.Active;
				_.forEach(affectedModels, function (model) {
					model.set("status", status);
				}, this);

				if (success) {
					success(collection, resp, options);
				}
			};

			_.extend(options, {
				ids: ids,
				disable: block
			});
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.modifyUserStatus, options);
		},

		resendInvite: function (email, accountManager) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.resendInvite, {
				email: email,
				accountManager: accountManager
			});
		},

		changeRole: function (ids, role, options) {
			options = options || {};

			var success = options.success;
			options.success = function (collection, resp, options) {
				var affectedModels = collection.filter(function (model) {
					return _.indexOf(ids, model.id) >= 0;
				});

				var roles = [role];
				_.forEach(affectedModels, function (model) {
					model.set("roles", roles);
				}, this);

				if (success) {
					success(collection, resp, options);
				}
			};

			if (role.name.toLowerCase() === Constants.UserRole.SiteAdmin) {
				_.extend(options, {
					ids: ids
				});
				ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.assignSiteAdminRole, options);
			} else {
				_.extend(options, {
					ids: ids,
					role: role.name
				});
				ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.AccountManager.changeRole, options);
			}
		},
		saveAssignments: function (options) {
			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.ProjectManager.changeProjectUsers, {
				success: options.success,
				project: options.project,
				accountManager: options.accountManager,
				ids: options.users
			});

		},

		changeUserProjects: function (id, project, options) {
			options = options || {};

			var success = options.success;
			options.success = function (collection, resp, options) {

				var affectedModels = collection.filter(function (model) {
					return _.indexOf(id, model.id) >= 0;
				});

				_.forEach(affectedModels, function (model) {
					model.set("project", project);
				}, this);

				if (success) {
					success(collection, resp, options);
				}
			};

			ServerCommandExecutor.execute(this, ServerInteractionSerializersHash.ProjectManager.changeUserProjects, options);
		}
	});

	ModelSyncExtension.extend(UserProfileCollection.prototype);

	return UserProfileCollection;
});
