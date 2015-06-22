/*global define:true */
define([
	'underscore',
    'jQuery',
	'backbone',
	'Models/Constants',
	'Utils/SimpleRequest',
	'Utils/Dialog',
	'text!Templates/CurrentProject.html',
	'text!Templates/ModalProjectSelector.html'
], function (_, $, Backbone, ModelsConstants, SimpleRequest, Dialog, templateHtml, projectSelector) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "project-info-container",
		template: _.template(templateHtml),
		projectSelectorTemplate: _.template(projectSelector),

		events: {
			"click .id-change": "_projectSelection"
		},

		initialize: function () {
			var accountManager = this.model,
				that = this;

			this.listenTo(accountManager, {
				'project-selected': this._updateProjectInfo,
				'project-changed-success': this._updateProjectInfo,
				'sign-out': this._hideProjectInfo
			});
			this.dialog = new Dialog();
			this.listenTo(this.dialog, {
				'switch-confirmed': function () {
					that.model.switchProject({
						'id': this._switchingId
					});
				}
			});

		},

		render: function () {
			var currentUser = this.model.currentUser();
			this.$el.html(this.template({
				Constants: ModelsConstants,
				model: this.model.currentUser()
			}));
			this.$projectSelector = this.$('#project-selector-drop');
			$('.project-info-container').show();
			return this;
		},

		_projectSelection: function () {
			var that = this,

			projects = _.filter(this.model.currentUser().get('project'),
				function (project) {
					return (project.status == ModelsConstants.ProjectStatus.Active) && (project.id != that.model.currentUser().get('projectId'));
				});
			projects = _.sortBy(projects, function (project) {
				return project.name;
			});
			this.$projectSelector.html(this.projectSelectorTemplate({
					projects: projects
				})).dialog({
					modal: true
				});
			this.$projectSelector.find('.project').button().click(function (e) {
				e.preventDefault();
				that.$projectSelector.dialog('destroy');
				that._onChangeProject($(this).data('id'));
				return false;
			});
		},


		_onChangeProject: function (id) {
			var messages = {
					analyst: 'After change you will be redirected to Analyst room',
					patient: 'After change you will be redirected to your Test room'
				},
				isAnalyst = this.model.currentUser().get('isAnalyst');

			this._switchingId = id;
			this.dialog.show('confirm', messages[isAnalyst ? 'analyst' : 'patient'], 'switch');
		},

		_updateProjectInfo: function (projects, selectedProjectId) {
			projects = projects || this.model.currentUser().get('project');
			selectedProjectId = selectedProjectId || this.model.currentUser().get('projectId');
			var $container = $('.project-info-container'),
				selected = projects.length === 1 ? projects : _.where(projects, {id: selectedProjectId}),
				activeProject = _.where(projects, {status: ModelsConstants.ProjectStatus.Active});

			selected = selected.length ? selected[0].name : '';
			$container.show().find('span').text(selected);
			if (activeProject.length > 1) {
				$container.find('i').removeClass('hidden');
			} else {
				$container.find('i').addClass('hidden');
			}
		},

		_hideProjectInfo: function () {
			$('.project-info-container').hide().find('span').text('');
		}
	});
});
