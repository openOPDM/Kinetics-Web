/*global define:true */
define([
	'jQuery',
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'Models/Constants',
	'Views/Constants',
	'Views/UserListView',
	'Models/UserProfileCollection',
	'Models/ProjectCollection',
	'formatter'
], function ($, _, Constants, ControllerBase, ModelsConstants, ViewsConstants, UserListView, UserProfileCollection, ProjectCollection) {
	'use strict';

	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);

			this._checkAttribute("accountManager");
			this._applicationView = this._checkAttribute("applicationView");
			this._globalModels = this._checkAttribute("globalModels");

			this.projectsList = new ProjectCollection();

			// Bind methods with 'this' reference
			_.bindAll(this, "_fetchData");
		},

		_assignmentChanges: {},

		parseParams: function (params) {
			var result = {};
			if (params.length === 1) {
				result.searchText = params[0];
			}
			if (params.length === 2 && params[0] === Constants.ActionMarker) {
				result.action = params[1];
			}
			if (params.length >= 2 && params[0].toLowerCase() === 'manage') {
				result.manage = params[1];
			}

			if (params.length === 3) {
				result.searchText = params[2];
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
			this._checkSearchText(params.searchText);

			// Store user list globally
			this._initializeRowCollection();


			this._fetchData();

			if (!this._manage) {
				this._fetchProjects();
			} else {
				this._initializeView();
			}

			this.listenTo(this.model, {
				"detail": this._onDetail,
				"testCustomFields": this._onClickTestCustomFields,
				"status-changed": this._onStatusChanged,
				'resend-admin-invitation': this._onResendConfirmation,
				'assignment-changed': this._onAssignmentChanged,
				'change-project': this._onChangeProject
			});
		},

		_onChangeProject: function (model, projectsList) {
			var that = this,
				list = [];

			for (var key in projectsList) {
				if (projectsList.hasOwnProperty(key)) {
					list.push(_.where(this.projectsList.models, {id: projectsList[key]})[0].attributes);
				}
			}

			this.model.changeUserProjects([model.get('id')], list,
				{
					user: model.get('id'),
					ids: projectsList,
					accountManager: this.get("accountManager"),
					errorOther: function (model, xhr, options) {
						that.trigger("error", options.responseError);
					},
					success: function (collection, resp, options) {
						that.model.trigger('saveProjectSuccess', {success: true});
					}
				});
		},

		_onResendConfirmation: function (email) {
			this.model.resendInvite(email, this.get("accountManager"));
		},

		_onStatusChanged: function (model, status) {

			var that = this;

			this.model.block([model.get('id')], status, {
				accountManager: this.get("accountManager"),
				errorOther: function (model, xhr, options) {
					that.trigger("error", options.responseError);
				}
			});

		},

		// Check search text from url params
		_checkSearchText: function (searchText) {
			if (searchText !== undefined) {
				if (searchText !== this._globalModels.searchText) {
					// Reset cache
					searchText = this._prepareSearchText(searchText);
					this._globalModels.searchText = searchText;
				}
			} else if (this._globalModels.searchText) {
				// Add search text to url
				this.trigger("change-url-params: search-text", this._globalModels.searchText, this._manage);
			}
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
			this.projectsList.fetch(options);
		},

		_onProjectsFetched: function () {
			this._initializeView();
		},

		_initializeView: function () {
			var that = this;
			this.view = new UserListView({
				model: this.model,
				projectsList: this.projectsList,
				searchText: this._globalModels.searchText,
				siteAdminMode: this._siteAdminMode,
				manage: this._manage,
				newProject: this._newProject
			});

			// Start listening control events
			this.listenTo(this.view, {
				"search": this._onSearch,
				"block": this._onBlock,
				'create-user': this._onCreateUser,
				'reset-assignments': this._onAssignmentsReset,
				'save-assignments': this._onAssignmentSaved
			});

			// Show view
			this._applicationView.showView(this.view);
		},

		initializeMenu: function () {
			// Initialize menu
			this._applicationView.header.showMenu(ViewsConstants.HeaderMenu.Default, "users");
		},

		deactivate: function () {
			this._globalModels.searchText = null;
			this._reset({ deleteModel: true });
		},

		_onBlock: function (selectedModels, block) {
			var ids = _.map(selectedModels, function (selectedModel) {
				return selectedModel.id;
			});

			var that = this;
			this.model.block(ids, block, {
				accountManager: this.get("accountManager"),
				errorOther: function (model, xhr, options) {
					that.trigger("error", options.responseError);
				}
			});
		},

		_onDetail: function (model) {
			this.trigger("detail", model.id);
		},

		_onSearch: function (searchText) {
			this._globalModels.searchText = this._prepareSearchText(searchText);
			this.trigger("change-url-params: search-text", this._globalModels.searchText, this._manage);
			this._fetchData();
		},

		_prepareSearchText: function (searchText) {
			return _.escape($.trim(searchText));
		},

		_onClickTestCustomFields: function () {
			this.trigger("test-custom-fields");
		},

		_onCreateUser: function () {
			this.trigger('create-user');
		},

		_onAssignmentChanged: function (id, changed) {
			this._assignmentChanges[id] = changed;
			this.view.trigger('assignment-changed');
		},

		_onAssignmentsReset: function () {
			this._assignmentChanges = {};
		},

		_onAssignmentSaved: function () {
			var that = this;
			this.model.saveAssignments({
				project: this._manage,
				accountManager: this.get("accountManager"),
				success: function () {
					that._assignmentChanges = {};
					that.view.trigger('assignments-saved');
				}
			});
		}

	});

});
