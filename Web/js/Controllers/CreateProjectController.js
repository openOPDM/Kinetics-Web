/*global define: true */
define([
	'underscore',
	'Controllers/Constants',
	'Controllers/ControllerBase',
	'DataLayer/Constants',
	'DataLayer/ErrorConstants',
	'Views/Constants',
	'Views/SiteAdminCreateProjectView',
	'Models/Project',
	'formatter'
], function (_, Constants, ControllerBase, DataConstants, ErrorConstants, ViewsConstants, SiteAdminCreateProjectView,  Project) {
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
			var that = this;

			this.view = new SiteAdminCreateProjectView({ model: new Project() });

			// Start listening control events
			this.listenTo(this.view, {
				"create-project": this._onCreateProject,
				"cancel": function () {
					that.trigger('cancelCreate');
				}
			});

			// Show view
			this.get("applicationView").showView(this.view);
			this._applicationView.header.showMenu(ViewsConstants.HeaderMenu.SiteAdmin, 'projects');
		},

		_onCreateProject: function (model) {
			var that = this;
			model.attributes.sessionToken = this.get("accountManager").getSessionToken();
			model.save({}, {
				wait: true,
				accountManager: this.get("accountManager"),
				error: function (model, xhr, options) {
					model.trigger("error", options.responseError);
				},
				success: function (model, xhr, options) {
					that.trigger("project-creation-success", xhr.response['function'].data.id);
				}
			});
		},

		_onError: function (error, options) {

		},

		deactivate: function () {
			this._reset();
		}

	});
});
