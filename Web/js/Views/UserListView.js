/*global define:true */
define([
	'underscore',
	'backbone',
	'moment',
	'text!Templates/UserList.html',
	'text!Templates/UserListBlockConfirmation.html',
	'text!Templates/UserProjectManage.html',
	'text!Templates/ManageProjects.html',
	'Models/Constants',
	'Models/UserProfileCollection',
	'Views/UserListRowView',
	'Utils/Dialog'
], function (_, Backbone, moment, templateHtml, blockConfirmationHtml, UserProjectManageHtml, manageProjectsHtml, ModelsConstants, UserProfileCollection, UserListRowView, Dialog) {
	'use strict';

	var SuccessStyle = "sign-row-success";
	var ErrorStyle = "sign-row-error";

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper user-list",
		template: _.template(templateHtml),
		templateConfirmation: _.template(blockConfirmationHtml),
		templateManageProjects: _.template(manageProjectsHtml),
		projectManage: null,
		currentModel: null,

		sortType: 'name',
		sortOrder: 'asc',

		events: {
			"click #button-find": "_onSearch",
			"keypress #id-search-text": "_submitSearchOnEnter",
			"click #button-show-all": "_onShowAll",

			"click .all-check": "_onSelectAll",
			"click .id-button-block": function () {
				this._onBlockSelected(true);
			},
			"click .id-button-unblock": function () {
				this._onBlockSelected(false);
			},
			"click .id-button-test-custom-fields": "_onClickTestCustomFields",
			"click .id-button-create-user": function () {
				if (this._siteAdminMode) {
					this.trigger('create-user');
				}
			},

			'click .id-reset': '_resetAssignments',
			'click .id-save-changes': '_onSaveAssignments',

			"click .project-add": "_projectAdd",
			"click .project-remove": "_projectRemove",
			"click .manageProjectsContainer .id-save-project": "_onSaveProject",
			"click .manageProjectsContainer .id-cancel-project": "_onCancelProject",
			"click .result-table th i": "_changeSortOrder"
		},

		initialize: function (options) {
			var that = this;
			if (!this.model && this.model instanceof UserProfileCollection) {
				throw new Error("Model not set or wrong type.");
			}

			this.listenTo(this.model, {
				"reset": this._onReset,
				"clickProject": this._onClickProject,
				"saveProjectSuccess": this._setSaveStatus,
				"error": this._setSaveStatus
			});

			this.listenTo(this, {
				'assignment-changed': function () {
					this.$('.save-or-reset').slideDown();
				},
				'assignments-saved': function () {
					this.$('.save-or-reset').slideUp();
				}
			});

			this._manage = options.manage;
			this._newProject = options.newProject;
			this._searchText = options.searchText;
			this._siteAdminMode = options.siteAdminMode;
			this.projectsList = options.projectsList;
			this._rowViews = {};

			this.dialog = new Dialog();
			this.listenTo(this.dialog, {
				'block-selected-confirmed': function () {
					that.trigger("block", that._getSelectedModels(), that._block);
					that._selectAll(false);
				},
				'save-project-confirmed': function () {
					that._hideSaveStatus();
					that.model.trigger('change-project', that.currentModel, that.projectsListNew);
				}
			});
		},

		_initializeRowViews: function () {

			var that = this;

			// sort user's projects
			if (this.sortType === "project") {
				this.model.each(function (m) {
					var projects = m.get("project");
					projects.sort(function (a, b) {
						var validator = that.sortOrder === "asc" ?
							a.name.toLowerCase() > b.name.toLowerCase() :
							a.name.toLowerCase() < b.name.toLowerCase();
						return validator ? 1 : -1;
					});
				}, this);
			}

			this.model.models.sort(function (a, b) {
				switch (true) {
				case (that.sortType === 'name' && that.sortOrder === 'asc'):
					return a.get('firstName') + a.get('secondName') > b.get('firstName') + b.get('secondName') ? 1 : -1;
				case (that.sortType === 'name' && that.sortOrder === 'desc'):
					return a.get('firstName') + a.get('secondName') < b.get('firstName') + b.get('secondName') ? 1 : -1;
				case (that.sortType === 'email' && that.sortOrder === 'asc'):
					return (a.get('email') || '') > (b.get('email') || '') ? 1 : -1;
				case (that.sortType === 'email' && that.sortOrder === 'desc'):
					return (a.get('email') || '') < (b.get('email') || '') ? 1 : -1;
				case (that.sortType === 'status' && that.sortOrder === 'asc'):
					return a.get('status') > b.get('status') ? 1 : -1;
				case (that.sortType === 'status' && that.sortOrder === 'desc'):
					return a.get('status') < b.get('status') ? 1 : -1;
				case (that.sortType === 'role' && that.sortOrder === 'asc'):
					return (_.isArray(a.get('roles')) ? a.get('roles')[0].name : '') > (_.isArray(b.get('roles')) ? b.get('roles')[0].name : '') ? 1 : -1;
				case (that.sortType === 'role' && that.sortOrder === 'desc'):
					return (_.isArray(a.get('roles')) ? a.get('roles')[0].name : '') < (_.isArray(b.get('roles')) ? b.get('roles')[0].name : '') ? 1 : -1;
				case (that.sortType === 'project' && that.sortOrder === 'asc'):
					return _.pluck(a.get('project'), 'name').join('') > _.pluck(b.get('project'), 'name').join('') ? 1 : -1;
				case (that.sortType === 'project' && that.sortOrder === 'desc'):
					return _.pluck(a.get('project'), 'name').join('') < _.pluck(b.get('project'), 'name').join('') ? 1 : -1;
				}
			});

			_.forEach(this.model.models, function (rowModel) {
				this._rowViews[rowModel.cid] = new UserListRowView({
					model: rowModel,
					siteAdminMode: this._siteAdminMode,
					manage: this._manage,
					showProjects: this.projectsList.models.length > 1
				});
			}, this);
		},

		_onReset: function () {
			this._removeAllRowsViews();
			this._initializeRowViews();
			this._fillRows();
		},

		_onSelectAll: function () {
			this._selectAll(!this.$checkAll.hasClass("checked"));
		},

		_selectAll: function (selectAll) {
			if (selectAll) {
				this.$checkAll.addClass("checked");
			}
			else {
				this.$checkAll.removeClass("checked");
			}

			_.each(this._rowViews, function (rowView) {
				rowView.selected(selectAll);
			});

		},

		render: function () {
			var view = null;
			if (this._manage) {
				view = this.templateManageProjects({
					model: this.model,
					Constants: ModelsConstants,
					siteAdminMode: this._siteAdminMode,
					newProject: this._newProject
				});
			} else {
				view = this.template({
					model: this.model,
					Constants: ModelsConstants,
					siteAdminMode: this._siteAdminMode,
					showProjects: this.projectsList.models.length > 1
				});
			}

			this.$el.html(view);

			this.$checkAll = this.$(".all-check .tick");
			this.$resultTable = this.$(".result-table");
			this.$headerRow = this.$(".result-header-row");
			this.$noResultsRow = this.$(".id-no-results");

			this.$searchText = this.$(".id-search-text");
			this.$searchText.val(this._searchText);

			var that = this; //todo:refacor this to change render->afterRender events
			setTimeout(function () {
				that.$searchText.focus();
			});

			return this;
		},

		_fillRows: function () {

			_.each(this.model.models, function (rowModel) {
				var rowView = this._rowViews[rowModel.cid];
				this.$resultTable.append(rowView.render().el);
			}, this);

			this._updateNoResultRow();
		},

		_updateNoResultRow: function () {
			if (this.model.length > 0) {
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

		_getSelectedModels: function () {
			var selected = [];
			_.each(this._rowViews, function (rowView) {
				if (rowView.selected()) {
					selected.push(rowView.model);
				}
			});
			return selected;
		},

		_onBlockSelected: function (block) {
			var selectedModels = this._getSelectedModels();
			this._block = block;
			if (selectedModels.length > 0) {
				this.dialog.show('confirm', this.templateConfirmation({ moment: moment, selected: selectedModels, block: block }), 'block-selected');
			}
		},

		_onSearch: function () {
			this.trigger("search", this.$searchText.val());
			this.$checkAll.removeClass("checked");
			return false;
		},

		_submitSearchOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._onSearch();
			}
		},

		_onShowAll: function () {
			this.$searchText.val("");
			this._onSearch();
		},

		hide: function () {
			this.$el.hide();
		},

		show: function () {
			this.$el.show();
		},

		_onClickTestCustomFields: function () {
			this.model.trigger("testCustomFields");
		},

		_resetAssignments: function () {
			this.trigger('reset-assignments');
			this._onReset();
			this.$('.save-or-reset').slideUp();
		},

		_onSaveAssignments: function () {
			this.trigger('save-assignments');
		},

		_hideSaveStatus: function () {
			this.$saveStatus.html('').hide();
		},

		_setSaveStatus: function (status) {
			var prefix;
			if (status.success) {
				this._onCancelProject();
				this.dialog.show("alert", "User profile updated successfully.");

				this._removeAllRowsViews();
				this._initializeRowViews();
				this._fillRows();

			} else {
				prefix = "User profile update failed. ";
				this.$saveStatus.removeClass(SuccessStyle)
					.addClass(ErrorStyle);
			}
			this.$saveStatus.html(prefix + (status.description ? status.description : "")).show();
		},

		_projectAdd: function () {
			var selectedOptions = this.$projects.all.find('option:selected');
			if (selectedOptions.length) {
				var that = this;
				this.$projects.selected.append(selectedOptions);
				selectedOptions.each(function () {
					that.projectsListNew.push(parseInt($(this).val(), 10));
				});
			}
		},

		_projectRemove: function () {
			var options = this.$projects.selected.find('option'),
				selectedOptions = options.filter(':selected');

			if (selectedOptions.length) {
				var that = this;
				selectedOptions.each(function (index) {
					var id = parseInt($(this).val(), 10);
					that.$projects.all.append($(this));
					that.projectsListNew.splice(that.projectsListNew.indexOf(id), 1);
				});
			}
		},

		_onChangeProject: function () {
			this.model.trigger('change-project', this.model);
		},

		_onClickProject: function (model) {
			this.currentModel = model;
			this.projectManage = _.template(UserProjectManageHtml, {
				Constants: ModelsConstants,
				model: this.currentModel,
				projectsList: this.projectsList
			});

			$('.manageProjectsContainer').show().html(this.projectManage);

			this.$projects = {
				all: $('#all_projects'),
				selected: $('#projects')
			};

			this.$saveStatus = $('.id-change-project-status');
			this._hideSaveStatus();

			this.projectsListNew = [];
			var selectedProjects = model.get('project');
			for (var key in selectedProjects) {
				if (selectedProjects.hasOwnProperty(key)) {
					this.projectsListNew.push(selectedProjects[key].id);
				}
			}
		},

		_onCancelProject: function () {
			$('.manageProjectsContainer').html('').hide();
		},

		_onSaveProject: function () {
			var newProjectList = this.projectsListNew,
				oldProjectsList = this.currentModel.get('project');

			if (!newProjectList.length) {
				this.dialog.show('alert', 'Please choose at least one project for selected user.<br>You can block the user to prevent his access.');
				return;
			}

			if (projectsNotRemoved()) {
				if (newProjectList.length > oldProjectsList.length) {
					this._hideSaveStatus();
					this.model.trigger('change-project', this.currentModel, this.projectsListNew);
				} else {
					this._onCancelProject();
				}
			} else {
				this.dialog.show('confirm', 'Data from unassigned ' + ModelsConstants.customLabel('projects') + ' will be lost permanently.<br><br>Proceed?', 'save-project');
			}

			function projectsNotRemoved() {
				if (newProjectList.length < oldProjectsList.length) {
					return false;
				} else {
					for (var key = 0; key < oldProjectsList.length; key++) {
						if (newProjectList.indexOf(oldProjectsList[key].id) < 0) {
							return false;
						}
					}
				}
				return true;
			}
		},

		_changeSortOrder: function (e) {
			var $this = $(e.target);

			switch (true) {
			case $this.is('.sort-name'):
				this.sortType = 'name';
				break;
			case $this.is('.sort-email'):
				this.sortType = 'email';
				break;
			case $this.is('.sort-status'):
				this.sortType = 'status';
				break;
			case $this.is('.sort-role'):
				this.sortType = 'role';
				break;
			case $this.is('.sort-project'):
				this.sortType = 'project';
				break;
			}

			switch (true) {
			case $this.is('.sort-asc'):
				this.sortOrder = 'asc';
				break;
			case $this.is('.sort-desc'):
				this.sortOrder = 'desc';
				break;

			}

			this.$('.result-table th .hidden').removeClass('hidden');
			$this.addClass('hidden');

			this._removeAllRowsViews();
			this._initializeRowViews();
			this._fillRows();
		}
	});
});
