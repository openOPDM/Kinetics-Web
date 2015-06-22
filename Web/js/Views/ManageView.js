/*global define:true, confirm: true */
define([
	'underscore',
	'backbone',
	'moment',
	'text!Templates/UserListBlockConfirmation.html',
	'text!Templates/UserProjectManage.html',
	'text!Templates/ManageProjects.html',
	'Models/Constants',
	'Models/UserProfileCollection',
	'Views/UserListRowView'
], function (_, Backbone, moment, blockConfirmationHtml, UserProjectManageHtml, manageProjectsHtml, ModelsConstants, UserProfileCollection, UserListRowView) {
	'use strict';

	var SuccessStyle = "sign-row-success";
	var ErrorStyle = "sign-row-error";

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper user-list manage",
		templateConfirmation: _.template(blockConfirmationHtml),
		templateManageProjects: _.template(manageProjectsHtml),
		projectManage: null,
		currentModel: null,

		events: {
			"click .id-button-create-user": function () {
				this.trigger('create-user');
			},
			'click .id-button-add-users': function () {
				this.trigger('add-users');
			},
			'click .id-reset': '_resetAssignments',
			'click .id-save-changes': '_onSaveAssignments',
			'change .id-project-selector': '_onProjectSwitched'
		},

		initialize: function (options) {
			if (!this.model && this.model instanceof UserProfileCollection) {
				throw new Error("Model not set or wrong type.");
			}

			this.listenTo(this.model, {
				"reset": this._onReset
			});

			this.listenTo(this, {
				/*
				'assignment-changed': function () {
					this.$('.save-or-reset').slideDown();
				},
				'assignments-saved': function () {
					this.$('.save-or-reset').slideUp();
				}
				*/
			});

			this._manage = options.manage;
			this._newProject = options.newProject;
			this._searchText = options.searchText;
			this._siteAdminMode = options.siteAdminMode;
			this._projects = options.projects;
			this._rowViews = {};
		},

		_initializeRowViews: function () {
			_.forEach(this.model.models, function (rowModel) {
				this._rowViews[rowModel.cid] = new UserListRowView({
					model: rowModel,
					siteAdminMode: this._siteAdminMode,
					manage: this._manage
				});
			}, this);
		},

		_resetAssignments: function () {
			this.trigger('reset-assignments');
			this._onReset();
			//this.$('.save-or-reset').slideUp();
		},

		_onReset: function () {

			//filter site admins from view; this is a hack and should be done on serer side
			this.model.models = _.reject(this.model.models, function (model) {
				return model.attributes.roles && model.attributes.roles[0].name.toLowerCase() === ModelsConstants.UserRole.SiteAdmin;
			});


			this._removeAllRowsViews();
			this._initializeRowViews();
			this._fillRows();
		},

		render: function () {
			var projects = this._projects
				.sortBy(function (project) {
					return project.get("name");
				}, this)
				.map(function (project) {
					return {
						id: project.get("id"),
						name: project.get("name")
					};
				});
			var view = this.templateManageProjects({
					model: this.model,
					Constants: ModelsConstants,
					siteAdminMode: this._siteAdminMode,
					newProject: this._newProject,
					currentProject: this._manage,
					projects: projects
				});

			this.$el.html(view);

			this.$checkAll = this.$(".all-check .tick");
			this.$resultTable = this.$(".result-table");
			this.$headerRow = this.$(".result-header-row");
			this.$noResultsRow = this.$(".id-no-results");
			this.$projectSelector = this.$(".id-project-selector");

			return this;
		},

		_onProjectSwitched: function () {
			this.trigger('project-switched', this.$projectSelector.val());
		},

		_onSaveAssignments: function () {
			this.trigger('save-assignments');
		},

		_fillRows: function () {
			this.model.backup = _.rest(this.model.models, 0);
			var that = this,
				fit = [], unfit = [];
			_.each(this.model.models, function (m) {
				if (!_.where(m.get('project'), {id: that._manage}).length) {
					unfit.push(m);
				} else {
					fit.push(m.get('id'));
				}
			});
			_.each(unfit, function (m) {
				that.model.remove(m);
			});

			//send fit to store in controller
			this.trigger('project-user-list', fit);

			_.each(this.model.models, function (rowModel) {
				var rowView = this._rowViews[rowModel.cid];
				this.$resultTable.append(rowView.render().el);
			}, this);

			this._updateNoResultRow();
		},

		_updateNoResultRow: function () {
			if (this.model.models.length > 0) {
				this.$noResultsRow.hide();
			} else {
				this.$noResultsRow.show();
			}
		},

		// Remove view from DOM
		remove: function () {
			// Destroy row views
			this._removeAllRowsViews();

			// Call base implementation
			Backbone.View.prototype.remove.call(this);
		},

		// Destroy all row view
		_removeAllRowsViews: function () {
			_.each(this._rowViews, function (rowView, key, collection) {
				rowView.remove();
				delete collection[key];
			});
		},


		hide: function () {
			this.$el.hide();
		},

		show: function () {
			this.$el.show();
		}

	});
});