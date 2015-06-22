/*global define:true, prompt: true, confirm: true */
define([
	'jQuery',
	'underscore',
	'backbone',
	'moment',
	'DataLayer/Constants',
	'Models/Constants',
	'Models/ErrorConstants',
	'Models/Sharing',
	'Utils/Dialog',
	'text!Templates/Profile.html',
	'text!Templates/ProfileDestroyConfirmation.html',
	'jQuery.placeholder'
], function ($, _, Backbone, moment, DataLayerConstants, Constants, ErrorConstants, SharePopup, Dialog, templateHtml, destroyConfirmationTemplateHtml) {
	'use strict';

	var SuccessStyle = "sign-row-success";
	var ErrorStyle = "sign-row-error";

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper",
		template: _.template(templateHtml),
		destroyConfirmationTemplate: _.template(destroyConfirmationTemplateHtml),
		projectsList: [],

		events: {
			"click .id-save-profile": "_onSaveProfile",
			"keypress .profile-data input": "_submitProfileDataOnEnter",
			"click .id-save-password": "_onSavePassword",
			"keypress .change-password input": "_submitChangePassOnEnter",
			"click .id-save-project": "_onSaveProject",
			"click .id-cancel": "_onCancel",
			"click .id-destroy": "_onDestroy",
			"click .project-add": "_projectAdd",
			"click .project-remove": "_projectRemove",
			"click .id-unshare": "_unshare",
			"click .id-leave-share": "_leaveShare",
			"click .id-share-all": "_shareAll",
			"click .id-share-test": "_shareTest",
			"click .id-unshare-test": "_unshareTest",
			"keypress #password-old, #password-new, #password-confirmation": "_validatePassword"
		},

		initialize: function () {
			_.bindAll(this, "_hideErrorsAndStatuses");

			var that = this;
			this.listenTo(this.model.userProfile, {
				"invalid": function (model, errors/*, options*/) {
					this._updateErrorMessage(errors);
				},
				"error": function (error) {
					this._updateErrorMessage([ error ]);
				},
				"sync": function () {
					this._setSaveStatus({ success: true });
				},
				"unshared": function (email) {
					var that = this;
					this.$('.id-unshare[data-email="' + email + '"]').parents('tr').fadeOut(function () {
						this.remove();
						if (!that.$('.id-unshare').length) {
							that.$('table.sharing .no-tests').show();
						}
					});
				},
				"unshared-test": function (id) {
					var that = this;
					this.$('.id-unshare-test[data-id="' + id + '"]').parents('tr').fadeOut(function () {
						this.remove();
						if (!that.$('.id-unshare-test').length) {
							that.$('table.shared-tests .no-tests').show();
						}
					});
				},
				"left-shared": function (id, project) {
					var that = this;
					this.$('.id-leave-share[data-id="' + id + '"][data-project="' + project + '"]').parents('tr').fadeOut(function () {
						this.remove();
						if (!that.$('.id-leave-share').length) {
							that.$('table.shared .no-tests').show();
						}
					});
				}
			});
			this.listenTo(this.model.passwordModifier, {
				"invalid": function (model, errors/*, options*/) {
					this._updateErrorMessage(errors);
				},
				"success": function () {
					this._setChangePasswordStatus({ success: true });
				},
				"error": function (error) {
					this._setChangePasswordStatus(error);
				},
				"resetFields": this._onResetPasswordFields
			});

			this.listenTo(this.model.projectModifier, {
				"invalid": function (model, errors/*, options*/) {
					this._updateErrorMessage(errors);
				},
				"success": function () {
					var projects = that.model.project.models,
						updatedProject = [],
						findProject = function (id) {
							for (var key in projects) {
								if (projects.hasOwnProperty(key) && projects[key].get('id') == id) {
									return projects[key].attributes;
								}
							}
						};

					for (var key in that.projectsList) {
						if (that.projectsList.hasOwnProperty(key)) {
							updatedProject.push(findProject(this.projectsList[key]));
						}
					}

					that.model.userProfile.set('project', updatedProject);

					this._setChangeProjectStatus({ success: true });
				},
				"error": function (error) {
					this._setChangeProjectStatus(error);
				},
				"resetFields": this._onResetProjectFields
			});

			this.dialog = new Dialog();
			this.listenTo(this.dialog, {
				'last-field-confirmed': function () {
					that._onDestroy();
				},
				'save-projects-confirmed': function () {
					that.trigger("saveProject", that.model.userProfile, this.projectsList);
				},
				'unshare-confirmed': function () {
					that.trigger('unshare', that.$lastUnshareButton.data('email'));
				},
				'unshare-test-confirmed': function () {
					that.trigger('unshare-test', that.$lastUnshareTestButton.data('id'));
				},
				'leave-share-confirmed': function () {
					that.trigger('leave-share', that.$lastLeaveShareButton.data('id'), that.$lastLeaveShareButton.data('project'));
				},
				'destroy-profile-prompted': function (input) {
					if (input === "DELETE") {
						that.trigger("destroy");
					}
				}
			});

			this.listenTo(this, {
				'updated-shares': function () {
					var lines = '';
					//todo move this to template
					_.each(this.model.shares.shareMine, function (share) {
						lines += '<tr><td>' + share.email + '</td><td>' + (share.name || '') + '</td><td><a class="button button-detail id-unshare" data-email="' + share.email + '">Unshare</a></td></tr>';
					});
					$('table.sharing tr:not(:first):not(:last)').remove();
					$('table.sharing tr:first').after(lines);
					if (this.model.shares.shareMine.length) {
						this.$('table.sharing .no-tests').hide();
					}

				},
				'last-site-admin': function () {
					$('.box-sign-in p').css({color: 'red'});
				}
			});

			this.sharePopup = new SharePopup();
		},

		render: function () {
			this.$el.html(this.template({
				Constants: Constants,
				model: this.model.userProfile,
				homePageTitle: this.model.homePageTitle,
				shares: this.model.shares,
				moment: moment,
				isAvanir: DataLayerConstants.branding === "Avanir"
			}));

			this.$firstName = this.$(".id-first-name");
			this.$secondName = this.$(".id-second-name");
			this.$birthday = this.$(".id-birthday");
			this.$genderRadios = this.$("input:radio[name=gender]");

			this.$passwordOld = this.$(".id-password-old");
			this.$passwordNew = this.$(".id-password-new");
			this.$passwordConfirmation = this.$(".id-password-confirmation");

			this.$errorFirstName = this.$(".id-error-first-name");
			this.$errorSecondName = this.$(".id-error-second-name");
			this.$errorGender = this.$(".id-error-gender");
			this.$errorBirthday = this.$(".id-error-birthday");
			this.$errorPasswordOld = this.$(".id-error-password-old");
			this.$errorPasswordNew = this.$(".id-error-password-new");
			this.$errorPasswordConfirm = this.$(".id-error-password-confirm");

			this.$saveStatus = this.$(".id-save-status");
			this.$changePasswordStatus = this.$(".id-change-password-status");
			this.$changeProjectStatus = this.$(".id-change-project-status");

			this.$capsLockWarning = this.$(".id-warning-message");

			this.subsections = {
				"profile-data": {
					menu : this.$('.side-menu .profile-data'),
					subsection: this.$('.content-container>.profile-data')
				},
				"change-password": {
					menu : this.$('.side-menu .change-password'),
					subsection: this.$('.content-container>.change-password')
				},
				"project-list-selector": {
					menu : this.$('.side-menu .project-list-selector'),
					subsection: this.$('.content-container>.project-list-selector')
				},
				"sharing": {
					menu : this.$('.side-menu .sharing'),
					subsection: this.$('.content-container>.sharing')
				}
			};
			this.subsectionsPermissions = {};
			this.subsectionsPermissions[Constants.UserRole.Patient] = ["profile-data", "change-password", "project-list-selector", "sharing"];
			this.subsectionsPermissions[Constants.UserRole.Analyst] = ["profile-data", "change-password", "sharing"];
			this.subsectionsPermissions[Constants.UserRole.SiteAdmin] = ["profile-data", "change-password"];

			this.$("input, textarea").placeholder();

			var gender = this.model.userProfile.get("gender");
			this.$genderRadios.filter('[value="' + gender + '"]').attr("checked", true);

			// Add change lister
//			this.$("input").change(this._hideErrorsAndStatuses);

			this.$birthday.datepicker({
				minDate: '-150y',
				maxDate: "-1y",
				yearRange: "-150:-1",
				dateFormat: 'mm/dd/yy',
				changeMonth: true,
				changeYear: true
			});

			this.$projects = {
				all: this.$('#all_projects'),
				selected: this.$('#projects')
			};

			//fill projects list
			this.projectsList = [];
			var projectList = this.model.userProfile.get('project');
			for (var key in projectList) {
				if (projectList.hasOwnProperty(key)) {
					this.projectsList.push(projectList[key].id);
				}
			}

			this._hideErrorsAndStatuses();



			this.$('.side-menu a').click(_.bind(this._subMenuNavigation, this));

			if (this.model.shares.social && this.model.shares.social.length) {
				this.$('table.shared-tests .no-tests').hide();
			}

			if (this.model.shares.shareMine && this.model.shares.shareMine.length) {
				this.$('table.sharing .no-tests').hide();
			}
			if (this.model.shares.shareOthers && this.model.shares.shareOthers.length) {
				this.$('table.shared .no-tests').hide();
			}
			var allowedSections = this.subsectionsPermissions[this.model.userProfile.get("role")];
			var section = (this.options.activeSection && _.indexOf(allowedSections, this.options.activeSection) >= 0) ?
				this.subsections[this.options.activeSection] :
				this.subsections[_.first(allowedSections)];
			section.menu.parent().addClass('active');
			section.subsection.show();

			return this;
		},

		_hideErrorsAndStatuses: function () {

			this.$saveStatus.hide();
			this.$changePasswordStatus.hide();
			this.$changeProjectStatus.hide();

			this.$(ErrorStyle).hide().removeAttr('title');
			this.$('input, select').removeClass('errored');

		},

		_onResetPasswordFields: function () {
			this.$passwordOld.val("");
			this.$passwordNew.val("");
			this.$passwordConfirmation.val("");
		},

		_onResetProjectFields: function () {
			//todo: make function restore previous state
		},

		_onSaveProfile: function () {
			this._hideErrorsAndStatuses();

			var userProfileValues = {
				firstName: $.trim(this.$firstName.val()),
				secondName: $.trim(this.$secondName.val()),
				birthdayFormatted: $.trim(this.$birthday.val()),
				gender: this.$genderRadios.filter(":checked").val()
			};

//			if (!this.model.userProfile.validate(userProfileValues, {birthdayRequired:true, genderRequired:true})) {
			this.trigger("saveProfile", this.model.userProfile, userProfileValues);
//			}
		},

		_submitProfileDataOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._onSaveProfile();
			}
		},

		_onSavePassword: function () {
			var newPasswordValues = {
				passwordOld: this.$passwordOld.val(),
				passwordNew: this.$passwordNew.val(),
				passwordConfirmation: this.$passwordConfirmation.val()
			};
			if (this.model.passwordModifier.set(newPasswordValues, { validate: true })) {
				this.trigger("savePassword", this.model.userProfile);
			}
		},

		_submitChangePassOnEnter: function (e) {
			if (e.keyCode === 13) {
				this._onSavePassword();
			}
		},

		_onSaveProject: function () {
			var newProjectList = this.projectsList,
				oldProjectsList = this.model.userProfile.get('project');

			this._hideErrorsAndStatuses();

			if (projectsNotRemoved()) {
				if (newProjectList.length > oldProjectsList.length) {
					this.trigger("saveProject", this.model.userProfile, this.projectsList);
				}
			} else {
				this.dialog.show("confirm", "Data from unassigned " + Constants.customLabel("projects") + " will be lost permanently.<br><br>Proceed?", "save-projects");
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


		_onCancel: function () {
			this.trigger("cancel");
		},

		_updateErrorMessage: function (errors) {
			_.forEach(errors, function (error) {
				var errored = {
					$container: null
				};

				switch (error.code) {
				case ErrorConstants.Validation.EmptyFirstName.code:
					errored.$container = this.$errorFirstName;
					break;

				case ErrorConstants.Validation.EmptySecondName.code:
					errored.$container = this.$errorSecondName;
					break;


				case ErrorConstants.Validation.EmptyBirthday.code:
				case ErrorConstants.Validation.InvalidBirthday.code:
					errored.$container = this.$errorBirthday;
					this.$errorBirthday.show();
					break;

				case ErrorConstants.Validation.EmptyGenderSelected.code:
					errored.$container = this.$errorGender;
					break;

				case ErrorConstants.Validation.EmptyOldPassword.code:
					errored.$container = this.$errorPasswordOld;
					break;

				case ErrorConstants.Validation.EmptyNewPassword.code:
					errored.$container = this.$errorPasswordNew;
					break;

				case ErrorConstants.Validation.InvalidPasswordConfirmation.code:
					errored.$container = this.$errorPasswordConfirm;
					break;

				default:
					this._setSaveStatus(error);
					break;
				}


				if (errored.$container) {
					errored.$container.show().html(error.description)
						.attr('title', error.description);

					errored.$input = errored.$input || errored.$container.closest('.sign-row').find('input[type!=radio], select');
					errored.$input.addClass('errored');
				}

			}, this);
		},

		_validatePassword: function (e) {
			var keyCode = e.which;
			if (keyCode >= 65 && keyCode <= 90) {
				this._toggleCapsLockWarning(!e.shiftKey);

			} else if (keyCode >= 97 && keyCode <= 122) {
				this._toggleCapsLockWarning(e.shiftKey);
			}
		},

		_toggleCapsLockWarning: function (showWarning) {
			if (showWarning) {
				this._capsLock = true;
				this.$capsLockWarning.show();
			} else {
				this._capsLock = false;
				this.$capsLockWarning.hide();
			}
		},

		_setSaveStatus: function (status) {
			var prefix;
			if (status.success) {
				prefix = "User profile updated successfully. ";
				this.$saveStatus.removeClass(ErrorStyle)
					.addClass(SuccessStyle);
			} else {
				prefix = "User profile update failed. ";
				this.$saveStatus.removeClass(SuccessStyle)
					.addClass(ErrorStyle);
			}
			this.$saveStatus.html(prefix + (status.description ? status.description : ""))
				.show();
		},

		_setChangePasswordStatus: function (status) {
			var prefix;
			if (status.success) {
				prefix = "Password changed successfully. ";
				this.$changePasswordStatus.removeClass(ErrorStyle)
					.addClass(SuccessStyle);
			} else {
				prefix = "Password change failed. ";
				this.$changePasswordStatus.removeClass(SuccessStyle)
					.addClass(ErrorStyle);
			}
			this.$changePasswordStatus.html(prefix + (status.description ? status.description : ""))
				.show();
		},

		_setChangeProjectStatus: function (status) {
			var prefix;
			if (status.success) {
				prefix = Constants.customLabel("Projects") + " list changed successfully. ";
				this.$changeProjectStatus.removeClass(ErrorStyle)
					.addClass(SuccessStyle);
			} else {
				prefix = Constants.customLabel("Projects") + " list change failed. ";
				this.$changeProjectStatus.removeClass(SuccessStyle)
					.addClass(ErrorStyle);
			}
			this.$changeProjectStatus.html(prefix + (status.description ? status.description : ""))
				.show();
		},


		_onDestroy: function () {
			this.dialog.show('prompt', this.destroyConfirmationTemplate({ profile: this.model.userProfile }), 'destroy-profile');
		},

		_projectAdd: function () {
			var selectedOptions = this.$projects.all.find('option:selected');
			if (selectedOptions.length) {
				var that = this;
				this.$projects.selected.append(selectedOptions);
				selectedOptions.each(function () {
					that.projectsList.push(parseInt($(this).val(), 10));
				});
			}
		},

		_projectRemove: function () {
			var errorMessages = {
					lastField: 'You cannot unassign all projects.<br>Perhaps, you want to delete your account?',
					assigned: 'You cannot unassign from current project.<br>Please, login to different project to proceed'
				},
				options = this.$projects.selected.find('option'),
				selectedOptions = options.filter(':selected');

			if (options.length === selectedOptions.length) {
				this.dialog.show('confirm', errorMessages.lastField, 'last-field');
			} else {
				var currentProject = this.model.userProfile.get('projectId');

				if (selectedOptions.length) {
					var that = this;

					selectedOptions.each(function (index) {
						var id = parseInt($(this).val(), 10);
						if (currentProject == id) {
							that.dialog.show('alert', errorMessages.assigned);
						} else {
							that.$projects.all.append($(this));
							that.projectsList.splice(that.projectsList.indexOf(id), 1);
						}
					});
				}
			}
		},

		_subMenuNavigation: function (e) {
			e.preventDefault();
			var $menuContainer = $('.side-menu'),
				$oldSub = $('.side-menu .active a'),
				$newSub = $(e.currentTarget),
				oldSubClass = $oldSub.attr('class'),
				newSubClass = $newSub.attr('class'),
				active = $('.side-menu .active');

			if (oldSubClass === newSubClass || $menuContainer.is('.in-progress')) {
				return false;
			}
			$menuContainer.addClass('in-progress');
			active.removeClass('active');
			$newSub.parent().addClass('active');
			this.trigger("subsection-changed", newSubClass);
			$('.content-container>.' + oldSubClass).fadeOut(function () {
				$('.content-container>.' + newSubClass).fadeIn(function () {
					$menuContainer.removeClass('in-progress');
				});
			});

			return false;
		},

		_leaveShare: function (e) {
			this.$lastLeaveShareButton = $(e.target);
			this.dialog.show('confirm', 'You will lose access to this test room.<br><br>Proceed?', 'leave-share');
		},

		_unshare: function (e) {
			this.$lastUnshareButton = $(e.target);
			this.dialog.show('confirm', 'This user will loose access to your test room.<br><br>Proceed?', 'unshare');
		},

		_shareAll: function () {
			this.trigger('share-all');
		},

		_shareTest: function (e) {
			this.trigger('share-test', $(e.target).data('token'));
		},

		_unshareTest: function (e) {
			this.$lastUnshareTestButton = $(e.target);
			this.dialog.show('confirm', 'Noone will be able to view this test with a previously generated link.<br><br>Proceed?', 'unshare-test');
		}
	});
});
