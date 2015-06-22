/*global define:true, confirm: true */
define([
	'underscore',
	'backbone',
	'Views/Constants',
	'Models/Constants',
	'Utils/Dialog',
	'text!Templates/Header.html',
	'text!Templates/ConfirmLeavingTest.html'
], function (_, Backbone, Constants, ModelsConstants, Dialog, templateHtml, ConfirmLeavingTestHtml) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "header",
		template: _.template(templateHtml),
		confirmTemplate: _.template(ConfirmLeavingTestHtml),

		_defaultMenu: null,

		events: {
			"click .id-back-to-test-room": function () {
				this.dialog.show('confirm', this.confirmTemplate(), 'back');
			},
			"click .id-back-to-welcome": function () {
				this.trigger("back-to-welcome");
			},
			"click .id-sign-out": function () {
				this.model.accountManager.signOut();
			},
			"click .id-profile": function () {
				this.trigger("profile");
			},
			"click .id-test-room": function () {
				this.trigger("test-room");
			},
			"click .id-trend-report": function () {
				this.trigger("trend-report");
			},
			"click .id-export": function () {
				this.trigger("extra");
			},
			"click .id-analyst-room": function () {
				this.trigger("analyst-room");
			},
			"click .id-projects": function () {
				this.trigger("project-list");
			},
			"click .id-users": function () {
				this.trigger("user-list");
			},
			"click .id-custom-fields": function () {
				this.trigger("custom-fields");
			}
		},

		initialize: function () {
			if (!this.model || !this.model.accountManager) {
				throw new Error("Account manager not set in the model.");
			}
			this.dialog = new Dialog();
			this.listenTo(this.dialog, {
				'back-confirmed': function () {
					this.trigger("back-to-test-room");
				}
			});
		},

		render: function () {
			this.$el.html(this.template({
				model: this.model,
				Constants: ModelsConstants
			}));

			this.$logo = this.$(".id-logo");

			this.buttons = {
				backToTestRoom: { $control: this.$(".id-back-to-test-room"), menu: [ Constants.HeaderMenu.Testing ] },
				backToWelcome: { $control: this.$(".id-back-to-welcome"), menu: [ Constants.HeaderMenu.Authorization ] },
				customFields: { $control: this.$(".id-custom-fields"), menu: [ Constants.HeaderMenu.SiteAdmin ] },
				export: { $control: this.$(".id-export"), menu: [ Constants.HeaderMenu.SiteAdmin ] },
				analystRoom: { $control: this.$(".id-analyst-room"), menu: [ Constants.HeaderMenu.Analyst ] },
				projects: { $control: this.$(".id-projects"), menu: [ Constants.HeaderMenu.SiteAdmin ] },
				users: { $control: this.$(".id-users"), menu: [ Constants.HeaderMenu.SiteAdmin ] },
				signOut: { $control: this.$(".id-sign-out"), menu: [ Constants.HeaderMenu.Patient, Constants.HeaderMenu.Analyst, Constants.HeaderMenu.SiteAdmin ] },
				profile: { $control: this.$(".id-profile"), menu: [ Constants.HeaderMenu.Patient, Constants.HeaderMenu.Analyst, Constants.HeaderMenu.SiteAdmin ] },
				testRoom: { $control: this.$(".id-test-room"), menu: [ Constants.HeaderMenu.Patient, Constants.HeaderMenu.Analyst ] },
				trendReport: { $control: this.$(".id-trend-report"), menu: [ Constants.HeaderMenu.Patient, Constants.HeaderMenu.Analyst ] }
			};

			return this;
		},

		defaultMenu: function (value) {
			if (value === undefined) {
				return this._defaultMenu;
			} else {
				if (_.indexOf(_.values(Constants.HeaderMenu), value) < 0) {
					throw new Error("Argument 'value' is not a Enum Views/Constants.HeaderMenu enumeration value.");
				}

				this._defaultMenu = value;
			}
		},

		showMenu: function (menu, activeButton) {
			if (_.indexOf(_.values(Constants.HeaderMenu), menu) < 0) {
				throw new Error("Argument 'menu' is not a Enum Views/Constants.HeaderMenu enumeration value.");
			}

			if (menu == Constants.HeaderMenu.Default) {
				menu = this.defaultMenu();
			}

			var minWidth = this.$logo[0].offsetWidth;
			_.forEach(this.buttons, function (button, buttonName) {
				if (_.some(button.menu, function (value) {
					return value == menu;
				})) {
					button.$control.addClass('visible');
					//minWidth += button.$control[0].offsetWidth;
				} else {
					button.$control.removeClass('visible');
				}

				if (buttonName === activeButton || (_.isArray(activeButton)) && _.indexOf(activeButton, buttonName) >= 0) {
					button.$control.addClass("active");
				} else {
					button.$control.removeClass("active");
				}
			}, this);

			//this.$el.closest("#main-container").css("min-width", minWidth + 50);
		}
	});

});
