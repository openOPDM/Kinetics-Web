/*global define:  true */
define([
	'underscore',
	'moment',
	'backbone',
	'Models/Constants',
	'text!Templates/UserListRow.html',
	'text!Templates/RoleSelector.html',
	'text!Templates/StatusSelector.html',
	'text!Templates/ManageProjectsRow.html'
], function (_, moment, Backbone, ModelsConstants, templateHtml, RoleSelector, StatusSelector, manageProjectsRowHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "tr",
		className: "",
		template: _.template(templateHtml),
		roleSelector: null,
		statusSelector: _.template(StatusSelector),
		templateManageProjectsRow: _.template(manageProjectsRowHtml),

		events: {
			"click .test-checkbox": "_onSelected",
			"click .id-button-detail": "_onClickDetail",
			"click .id-status span": "_onClickStatus",
			"click .id-user-assigned": "_onAssignmentChanged",
			"click .id-manage-project": "_onClickProject",
			"mouseover .user-list .id-project": "_onFocusProject",
			"mouseout .user-list .id-project": "_onBlurProject"
		},

		_selected: false,

		initialize: function (options) {
			this.listenTo(this.model, "change", this.render);
			this._siteAdminMode = options.siteAdminMode;

			this._manage = options.manage;
			this.showProjects = options.showProjects;
		},

		// Get/Set row selection flag
		selected: function (value) {
			if (value === undefined) {
				return this._selected;
			} else {
				this._selected = value;
				this._updateSelectCheckbox();
			}
		},

		render: function () {
			if (this._manage) {
				this.$el.html(this.templateManageProjectsRow({
					model: this.model,
					moment: moment,
					Constants: ModelsConstants,
					siteAdminMode: this._siteAdminMode,
					project: parseInt(this._manage, 10),
					showProjects: this.showProjects
				}));
			} else {
				this.$el.html(this.template({
					model: this.model,
					moment: moment,
					Constants: ModelsConstants,
					siteAdminMode: this._siteAdminMode,
					showProjects: this.showProjects
				}));
			}


			this.$selectCheckBox = this.$(".test-checkbox .tick");
			this._updateSelectCheckbox();
			return this;
		},

		_updateSelectCheckbox: function () {
			if (this._selected) {
				this.$selectCheckBox.addClass("checked");
			} else {
				this.$selectCheckBox.removeClass("checked");
			}
		},

		_onClickProject: function () {
			this.model.trigger('clickProject', this.model);
			return false;
		},

		_onFocusProject: function () {
			this.$el.find('.test-detail:first').addClass('test-detail-hover');
		},

		_onBlurProject: function () {
			this.$el.find('.test-detail:first').removeClass('test-detail-hover');
		},

		_onClickStatus: function () {
			console.info('status');
			var that = this,
				status = this.model.get("status"),
				value = status.toLowerCase() === 'active' ? 0 : 1;
			//todo: rewrite this in a better way
			if (status === ModelsConstants.UserStatus.Waiting) {
				$('.dialog-waiting-user').dialog({ modal: true }).find('.resend').off().button().click(function (e) {
					e.preventDefault();
					that.model.trigger('resend-admin-invitation', that.model.get("email"));
					$('.dialog-waiting-user').dialog('destroy');
					return false;
				});

				return;
			}


			this.$('.id-status span').hide();
			if (this.$('.id-status select').length) {
				this.$('.id-status select').show().focus();
				return;
			}

			this.$('.id-status').append(this.statusSelector);
			this.$('.id-status select').blur(function () {
				$(this).hide();
				that.$('.id-status span').show();
			}).change(function () {
					$(this).attr('disabled', true);
					that.model.trigger('status-changed', that.model, !!parseInt($(this).val(), 10));
				}).children('[value=' + value + ']').attr('selected', true);

			this.$('.id-status select').focus();
		},

		_onSelected: function () {
			this.selected(!this.selected());
		},

		_onClickDetail: function () {
			this.model.trigger("detail", this.model);
		},

		_onAssignmentChanged: function (e) {
			this.model.trigger('assignment-changed', this.model.get('id'), !!$(e.target).is(':checked'));
		}

	});
});