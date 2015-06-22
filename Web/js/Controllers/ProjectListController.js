/*global define: true */
define([
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'DataLayer/Constants',
	'DataLayer/ErrorConstants',
	'Views/Constants',
	'Views/SiteAdminProjectListView',
	'Views/SiteAdminCreateProjectView',
	'Views/SiteAdminExportView',
	'Models/Project',
	'Models/ProjectCollection',
	'formatter'
], function (_, Constants, ControllerBase, DataConstants, ErrorConstants, ViewsConstants, SiteAdminProjectListView, SiteAdminCreateProjectView, SiteAdminExportView, Project, ProjectCollection) {
	'use strict';
	return ControllerBase.extend({
		initialize: function () {
			ControllerBase.prototype.initialize.apply(this, arguments);
			this._checkAttribute("applicationView");
			this._checkAttribute("accountManager");

			this._applicationView = this._checkAttribute("applicationView");
			this._globalModels = this._checkAttribute("globalModels");
		},

		activate: function (params) {
			this.model = new ProjectCollection();
			this._fetchProjects();
		},

		_fetchProjects: function () {
			var options = this._getFetchOptions(true, this._onProjectsFetched, this._fetchProjects, this);
			this.model.fetch(options);
		},

		_onProjectsFetched: function () {
			this.view = new SiteAdminProjectListView({ model: this.model });

			this._applicationView.showView(this.view);

			this.listenTo(this.model, {
				"rename": this._onRename,
				"disable": this._onDisable,
				"create": this._onClickCreate,
				'manage-project': function (project) {
					this.trigger('manage-project', project);
				}
			});

			// Initialize menu
			this._applicationView.header.showMenu(ViewsConstants.HeaderMenu.SiteAdmin, 'projects');
		},

		_onRename: function (model, name) {
			model.modifyProjectInfo(name, this.get("accountManager"));
		},

		_onClickCreate: function () {
			this.trigger('create');
		},

		_onDisable: function (model) {
			model.modifyProjectStatus(this.get("accountManager"));
		},

		_onError: function (error, options) {

		},

		deactivate: function () {
			this._reset();
		}

	});
});
