/*global define: true */
define([
	'backbone',
	'underscore',
	'Models/Constants',
	'text!Templates/Welcome.html',
	'text!Templates/ModalProjectSelector.html'
], function (Backbone, _, ModelsConstants, templateHtml, projectSelector) {
	'use strict';

	return Backbone.View.extend({
		tagName: "div",
		className: "content-wrapper welcome",
		template: _.template(templateHtml),
		projectSelectorTemplate: _.template(projectSelector),

		events: {
			"click #button-sign-up": function () {
				this.trigger("sign-up");
			},
			"click #button-sign-in": "_onSignIn",
			"click #button-forgot-password": "_onForgotPassword",
			"keypress #sign-in-password": "_validatePassword"
		},

		initialize: function () {
			this.listenTo(this.model.accountManager, "error", this._showError);
			this.listenTo(this, 'projectSelection', this._projectSelection);

			this._capsLock = null;
		},

		render: function () {
			this.model.Constants = ModelsConstants;
			this.$el.html(this.template(this.model));
			this.$email = this.$("#sign-in-email");
			this.$project = this.$('#sign-in-project');
			this.$password = this.$("#sign-in-password");
			this.$errorContainer = this.$(".id-error-row");
			this.$errorContainer.hide();
			this.$errorMessage = this.$(".id-error-message");
			this.$capsLockWarning = this.$(".id-warning-message");
			this.$projectSelector = this.$('#project-selector');

			var that = this; //todo:refacor this to change render->afterRender events
			setTimeout(function () {
				that.$email.focus();
			});
			$('.project-info-container').hide();
			return this;
		},

		_showError: function (error) {
			this.$errorMessage.html(error.description);
			this.$errorContainer.show();
		},

		_projectSelection: function (projects) {
			var that = this;
			projects = _.sortBy(projects, function (project) {
				return project.name;
			});
			this.$projectSelector.html(this.projectSelectorTemplate({projects: projects})).dialog({
				modal: true
			});
			this.$projectSelector.find('.project').button()
				.keydown(function (e) {
					var $this = $(this);
					if (e.keyCode === 38) {
						if ($this.is(':first-child')) {
							$this.parent().children(':last-child').focus();
						} else {
							$this.prev().focus();
						}
					}
					if (e.keyCode === 40) {
						if ($this.is(':last-child')) {
							$this.parent().children(':first-child').focus();
						} else {
							$this.next().focus();
						}

					}
				})
				.click(function (e) {
					e.preventDefault();
					that.$projectSelector.dialog('destroy');
					that.trigger('projectSelected', that.$email.val(), that.$password.val(), $(this).data('id'));
					return false;
				});
		},

		_onSignIn: function (e) {
			e.preventDefault();
			this.$errorContainer.hide();
			var email = this.$email.val(),
				password = this.$password.val(),
				project = this.$project && this.$project.val();

			this.trigger('authenticate', email, password);

			return false;
		},

		_onForgotPassword: function () {
			this.trigger("forgot-password", this.$email.val());

			// Prevent relocation by hyperlink
			return false;
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
		}

	});

});
