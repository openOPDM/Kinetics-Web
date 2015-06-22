/*global define:true */
define([
	'jQuery',
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Models/Constants',
	'Views/Constants',
	'Views/ManageView',
	'Models/UserProfileCollection',
	'Models/ProjectCollection',
	'formatter'
], function ($, _, Constants, ControllerBase, ModelsConstants, ViewsConstants, ManageView, UserProfileCollection, ProjectCollection) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);

			this._checkAttribute("accountManager");
			this._applicationView = this._checkAttribute("applicationView");
			this._globalModels = this._checkAttribute("globalModels");

			this.projects = new ProjectCollection();

			// Bind methods with 'this' reference
			_.bindAll(this, "_fetchData");
		},

		_assignmentChanges: {},
		_unassigned: {},
		_projectUsers: [],

		parseParams: function (params) {
			var result = {};
			if (params.length === 1) {
				result.manage = params[0];
			}
			return result;
		},

		activate: function (params) {
			var currentUser = this.get('accountManager').currentUser();
			if (currentUser) {
				this._siteAdminMode = currentUser.get("isSiteAdmin");
			}

			//manage users in certain project
			this._manage = parseInt(params.manage, 10);

			this._newProject = params.newProject;

			// Check search text from url params

			// Store user list globally
			this._initializeRowCollection();
			this._initializeView();

			this._fetchData();

			this.listenTo(this.model, {
				"detail": this._onDetail,
				"testCustomFields": this._onClickTestCustomFields,
				"status-changed": this._onStatusChanged,
				"role-changed": this._onRoleChanged,
				'resend-admin-invitation': this._onResendConfirmation,
				'assignment-changed': this._onAssignmentChanged,
				'change-project': this._onChangeProject
			});
		},



		_initializeRowCollection: function () {
			this.model = new UserProfileCollection();
		},

		_fetchData: function () {
			var options = this._getFetchOptions(true, null, this._fetchData);
			this.model.fetch(_.extend(options, { search: this._globalModels.searchText, project: this._manage }));
		},

		_fetchProjects: function () {
			var options = this._getFetchOptions(true, this._onProjectsFetched, this._fetchProjects, this);
			this.projects.fetch(options);
		},

		_onProjectsFetched: function () {
			if (!_.where(this.projects.models, {'id': this._manage}).length) {
				console.log('Invalid project Id');
				this.trigger('invalid-project-code');
			}

			this.view = new ManageView({
				model: this.model,
				projects: this.projects,
				siteAdminMode: this._siteAdminMode,
				manage: this._manage,
				newProject: this._newProject
			});

			// Start listening control events
			this.listenTo(this.view, {
				'create-user': this._onCreateUser,
				'add-users': this._addUsers,
				'reset-assignments': this._onAssignmentsReset,
				'save-assignments': this._onAssignmentSaved,
				'project-user-list': this._updateProjectUsers,
				'project-switched': this._projectSwitched
			});

			// Show view
			this._applicationView.showView(this.view);
		},		

		_initializeView: function () {
			var that = this;
			this._fetchProjects();
		},

		_updateProjectUsers: function (users) {
			this._projectUsers = users;
		},

		initializeMenu: function () {
			// Initialize menu
			this._applicationView.header.showMenu(ViewsConstants.HeaderMenu.Default, "users");
		},

		deactivate: function () {
			this._globalModels.searchText = null;
			this._reset({ deleteModel: true });
		},


		_onCreateUser: function () {
			this.trigger('create-user', this._manage);
		},


		_onDetail: function (model) {
			this.trigger("detail", model.id);
		},

		_onAssignmentChanged: function (id, changed) {
			this._unassigned[id] = changed;
			this.view.trigger('assignment-changed');
		},

		_onAssignmentsReset: function () {
			this._unassigned = {};
		},

		_onAssignmentSaved: function () {
			var that = this,
				filteredUsers = _.reject(this._projectUsers, function (id) {
				return that._unassigned[id];
			});

			this.model.saveAssignments({
				project: this._manage,
				accountManager: this.get("accountManager"),
				users: filteredUsers,
				success: function () {
					that._unassigned = {};
					that.view.trigger('assignments-saved');
					that._fetchData();
				}
			});
		},

		_addUsers: function () {
			this.trigger('add-users', this._projectUsers, this._manage, this.model.backup);
		},

		_projectSwitched: function (id) {
			this.trigger('project-switched', id);
		}

	});

});
